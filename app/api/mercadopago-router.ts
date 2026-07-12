import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions } from "@db/schema";
import { eq } from "drizzle-orm";

import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// ─── Lazy init de MercadoPago ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pref: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pay: any = null;

function getPref() {
  if (_pref) return _pref;
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "MercadoPago no configurado. Agrega MERCADOPAGO_ACCESS_TOKEN al .env",
    });
  }
  const config = new MercadoPagoConfig({ accessToken: token });
  _pref = new Preference(config);
  return _pref;
}

function getPay() {
  if (_pay) return _pay;
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MP not configured");
  const config = new MercadoPagoConfig({ accessToken: token });
  _pay = new Payment(config);
  return _pay;
}

// ─── Plan pricing ───
const PLANS = {
  pro: {
    monthly: 4.99,
    yearly: 39.99,
    title: "TusFinanzas Pro",
    desc: "Transacciones ilimitadas, Experto IA ilimitado, graficos avanzados, exportar CSV/Excel",
  },
  family: {
    monthly: 8.99,
    yearly: 69.99,
    title: "TusFinanzas Familiar",
    desc: "Todo lo de Pro + hasta 5 familiares, categorias compartidas, metas familiares",
  },
};

// ─── Helper: crear preferencia ───
async function createPref(
  userId: number,
  email: string,
  name: string,
  plan: "pro" | "family",
  billing: "monthly" | "yearly"
) {
  const cfg = PLANS[plan];
  const amount = billing === "monthly" ? cfg.monthly : cfg.yearly;
  const period = billing === "monthly" ? "mes" : "ano";

  const origin = process.env.APP_URL || "https://tusfinanzas.app";

  const body = {
    items: [
      {
        id: `${plan}-${billing}`,
        title: `${cfg.title} (${period})`,
        description: cfg.desc,
        quantity: 1,
        currency_id: "USD",
        unit_price: amount,
        category_id: "software",
      },
    ],
    payer: { name: name || "Usuario", email: email || "usuario@tusfinanzas.app" },
    external_reference: `${userId}:${plan}:${billing}`,
    back_urls: {
      success: `${origin}/payment/success`,
      failure: `${origin}/payment/failure`,
      pending: `${origin}/payment/pending`,
    },
    auto_return: "approved" as const,
    notification_url: `${origin}/api/trpc/mercadopago.webhook`,
  };

  const pref = getPref();
  const resp = await pref.create({ body });

  return {
    preferenceId: resp.id,
    initPoint: resp.init_point,
    sandboxInitPoint: resp.sandbox_init_point,
  };
}

// ─── Helper: activar plan tras pago ───
async function activatePlan(externalRef: string) {
  const [userIdStr, plan, billing] = externalRef.split(":");
  const userId = Number(userIdStr);
  if (!userId || !plan) return;

  const db = getDb();
  const months = billing === "yearly" ? 12 : 1;
  const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);

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
  // Crear preferencia de pago y devolver URL
  createPreference: authedQuery
    .input(z.object({ plan: z.enum(["pro", "family"]), billing: z.enum(["monthly", "yearly"]) }))
    .mutation(async ({ ctx, input }) => {
      return createPref(ctx.user.id, ctx.user.email || "", ctx.user.name || "", input.plan, input.billing);
    }),

  // Webhook para notificaciones de MP
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
      const paymentId = input?.["data.id"] || input?.id;
      const topic = input?.topic || input?.type;

      if (!paymentId || topic !== "payment") {
        return { received: true };
      }

      try {
        const pay = getPay();
        const data = await pay.get({ id: Number(paymentId) });

        if (data.status === "approved" && data.external_reference) {
          await activatePlan(data.external_reference);
        }
      } catch (err) {
        console.error("MP webhook error:", err);
      }

      return { received: true };
    }),
});
