import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions } from "@db/schema";
import { eq } from "drizzle-orm";

import { MercadoPagoConfig, PreApproval, Payment } from "mercadopago";

// ─── Lazy init de MercadoPago ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _preapproval: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pay: any = null;

function getMPConfig() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "MercadoPago no configurado. Agrega MERCADOPAGO_ACCESS_TOKEN al .env o en Render.",
    });
  }
  return new MercadoPagoConfig({ accessToken: token });
}

function getPreApproval() {
  if (_preapproval) return _preapproval;
  _preapproval = new PreApproval(getMPConfig());
  return _preapproval;
}

function getPay() {
  if (_pay) return _pay;
  _pay = new Payment(getMPConfig());
  return _pay;
}

// ─── Plan pricing ───
// Nota: MercadoPago Argentina maneja USD nativo con el campo currency_id: "USD"
// Para ARS habría que ajustar los precios al tipo de cambio del día
const PLANS = {
  pro: {
    monthly: 5000,
    yearly: 40000,
    title: "IAfinanzas Pro",
    desc: "Transacciones ilimitadas, Experto IA ilimitado, gráficos avanzados, exportar CSV/Excel",
  },
  family: {
    monthly: 9000,
    yearly: 70000,
    title: "IAfinanzas Familiar",
    desc: "Todo lo de Pro + hasta 5 familiares, presupuesto compartido, metas familiares",
  },
};

// ─── Helper: frecuencia de cobro ───
// La API de Suscripciones de MP usa "frequency" + "frequency_type"
function getBillingFrequency(billing: "monthly" | "yearly") {
  if (billing === "monthly") return { frequency: 1, frequency_type: "months" as const };
  return { frequency: 12, frequency_type: "months" as const };
}

// ─── Helper: crear suscripción recurrente (Preapproval) ───
async function createSubscription(
  userId: number,
  email: string,
  name: string,
  plan: "pro" | "family",
  billing: "monthly" | "yearly"
) {
  const cfg = PLANS[plan];
  const amount = billing === "monthly" ? cfg.monthly : cfg.yearly;
  const { frequency, frequency_type } = getBillingFrequency(billing);
  const origin = process.env.APP_URL || "https://iafinanzas.app";

  const pa = getPreApproval();
  const resp = await pa.create({
    body: {
      // Información del plan
      reason: cfg.title,
      // Referencia externa para identificar userId:plan:billing al recibir webhook
      external_reference: `${userId}:${plan}:${billing}`,
      // URL a donde MP redirige al usuario tras autorizar el débito
      back_url: `${origin}/payment/success`,
      // Datos del pagador
      payer_email: email === "policoding@gmail.com" ? "test_user_1202636372@testuser.com" : (email || `usuario${userId}@iafinanzas.app`),
      // Configuración del cobro automático recurrente
      auto_recurring: {
        frequency,
        frequency_type,
        // transaction_amount es el monto que se cobra en cada ciclo
        transaction_amount: amount,
        // currency_id for subscriptions in Argentina MUST be ARS
        currency_id: "ARS",
        // start_date: primera fecha de cobro (futuro inmediato para evitar clock drift)
        start_date: new Date(Date.now() + 120000).toISOString(),
        // end_date: límite del acuerdo (1 año)
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        // end_date: sin fin (suscripción indefinida, el usuario puede cancelar)
        // Si querés yearly fijo, descomenta:
        // end_date: new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // URL de notificación de cada cobro recurrente
      notification_url: `${origin}/api/trpc/mercadopago.webhook`,
    },
  });

  return {
    subscriptionId: resp.id,
    // init_point es la URL donde el usuario autoriza el débito automático
    initPoint: resp.init_point,
    status: resp.status,
  };
}

// ─── Helper: activar/renovar plan tras autorización o cobro ───
async function activatePlan(externalRef: string, months?: number) {
  const [userIdStr, plan, billing] = externalRef.split(":");
  const userId = Number(userIdStr);
  if (!userId || !plan) return;

  const db = getDb();
  const m = months ?? (billing === "yearly" ? 12 : 1);
  const expiresAt = new Date(Date.now() + m * 30 * 24 * 60 * 60 * 1000);

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  if (existing.length > 0) {
    await db
      .update(subscriptions)
      .set({ plan: plan as "pro" | "family", status: "active", expiresAt })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({
      userId,
      plan: plan as "pro" | "family",
      status: "active",
      expiresAt,
    });
  }
}

// ─── Router ───
export const mercadoPagoRouter = createRouter({
  // Crear suscripción recurrente y devolver URL de autorización
  createPreference: authedQuery
    .input(z.object({ plan: z.enum(["pro", "family"]), billing: z.enum(["monthly", "yearly"]) }))
    .mutation(async ({ ctx, input }) => {
      return createSubscription(
        ctx.user.id,
        ctx.user.email || "",
        ctx.user.name || "",
        input.plan,
        input.billing
      );
    }),

  // Webhook para notificaciones de MP (pagos recurrentes + cambios de estado)
  // MP envía dos tipos principales:
  //   topic=payment  → un cobro puntual se procesó
  //   topic=preapproval → cambio de estado de la suscripción (authorized, paused, cancelled)
  webhook: publicQuery
    .input(
      z.object({
        topic: z.string().optional(),
        id: z.string().optional(),
        type: z.string().optional(),
        "data.id": z.string().optional(),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const topic = input?.topic || input?.type;
      const resourceId = input?.["data.id"] || input?.id;

      if (!resourceId) return { received: true };

      try {
        if (topic === "payment") {
          // Un cobro recurrente fue procesado
          const pay = getPay();
          const data = await pay.get({ id: Number(resourceId) });
          if (data.status === "approved" && data.external_reference) {
            await activatePlan(data.external_reference);
          }
        } else if (topic === "preapproval") {
          // Cambio de estado en la suscripción (ej: usuario autorizó por primera vez)
          const pa = getPreApproval();
          const sub = await pa.get({ id: resourceId });
          if (
            (sub.status === "authorized" || sub.status === "active") &&
            sub.external_reference
          ) {
            // Activar plan inmediatamente al autorizar
            await activatePlan(sub.external_reference);
          }
          // Si status === "cancelled" o "paused", podrías desactivar el plan aquí
          // Por ahora lo dejamos expirar naturalmente por fecha
        }
      } catch (err) {
        console.error("MP webhook error:", err);
      }

      return { received: true };
    }),
});
