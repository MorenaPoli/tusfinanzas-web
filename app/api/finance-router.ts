import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { transactions, dailyQuotes, chatMessages, subscriptions, savingsGoals, familyMemberships } from "@db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedRates: Record<string, number> | null = null;
let lastRatesFetchTime = 0;

async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - lastRatesFetchTime < 3600000) {
    return cachedRates;
  }
  const fallbackRates: Record<string, number> = {
    USD: 1,
    ARS: 915,
    MXN: 18.3,
    EUR: 0.92,
  };
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("Rates API failed");
    const data = await res.json();
    if (data && data.result === "success" && data.rates) {
      cachedRates = {
        USD: Number(data.rates.USD || 1),
        ARS: Number(data.rates.ARS || 915),
        MXN: Number(data.rates.MXN || 18.3),
        EUR: Number(data.rates.EUR || 0.92),
      };
      lastRatesFetchTime = now;
      return cachedRates;
    }
  } catch (e) {
    console.error("Failed to fetch exchange rates, using fallbacks:", e);
  }
  return cachedRates || fallbackRates;
}

function convertAmount(amount: number, from: string, to: string, rates: Record<string, number>): number {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  const baseRateF = rates[f] || 1;
  const baseRateT = rates[t] || 1;
  const amountInUSD = amount / baseRateF;
  return amountInUSD * baseRateT;
}

function getActivePlan(subResults: any[]): "free" | "pro" {
  const sub = subResults[0];
  if (!sub || sub.plan !== "pro") return "free";
  if (sub.status !== "active") return "free";
  if (!sub.expiresAt) return "free";
  const expiresAt = sub.expiresAt instanceof Date ? sub.expiresAt : new Date(sub.expiresAt);
  if (expiresAt <= new Date()) return "free";
  return "pro";
}

export const financeRouter = createRouter({
  // ─── Transactions ───

  listTransactions: authedQuery
    .input(
      z.object({
        type: z.enum(["income", "expense", "investment", "debt", "asset"]).optional(),
        month: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [membership] = await db
        .select()
        .from(familyMemberships)
        .where(eq(familyMemberships.userId, userId));

      let userIds = [userId];
      if (membership) {
        const familyMems = await db
          .select({ userId: familyMemberships.userId })
          .from(familyMemberships)
          .where(eq(familyMemberships.familyGroupId, membership.familyGroupId));
        userIds = familyMems.map(fm => fm.userId);
      }

      const results = await db
        .select()
        .from(transactions)
        .where(inArray(transactions.userId, userIds))
        .orderBy(desc(transactions.createdAt));

      let filtered = results;
      if (input?.type) {
        filtered = filtered.filter((t) => t.type === input.type);
      }
      if (input?.month) {
        filtered = filtered.filter((t) => {
          const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date);
          return dateStr.startsWith(input.month!);
        });
      }

      return filtered;
    }),

  createTransaction: authedQuery
    .input(
      z.object({
        type: z.enum(["income", "expense", "investment", "debt", "asset"]),
        category: z.string().min(1).max(100),
        amount: z.string().min(1),
        description: z.string().max(500).optional(),
        currency: z.string().min(3).max(3).optional(),
        date: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check plan limits (free = 30 tx/month)
      const subResults = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      const plan = getActivePlan(subResults);

      if (plan === "free") {
        const allTx = await db
          .select({ date: transactions.date })
          .from(transactions)
          .where(eq(transactions.userId, userId));
        const now = new Date();
        const monthStr = now.toISOString().slice(0, 7);
        const thisMonthCount = allTx.filter((t) => {
          const d = t.date instanceof Date ? t.date.toISOString().slice(0, 7) : String(t.date).slice(0, 7);
          return d === monthStr;
        }).length;
        if (thisMonthCount >= 30) {
          throw new Error("FREE_LIMIT_REACHED: Alcanzaste el limite de 30 transacciones por mes. Suscribite a PRO para ilimitado.");
        }
      }

      const result = await db.insert(transactions).values({
        userId,
        type: input.type,
        category: input.category,
        amount: input.amount,
        description: input.description || null,
        currency: input.currency || "USD",
        date: new Date(input.date),
      });

      return { id: Number(result[0].insertId) };
    }),

  updateTransaction: authedQuery
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["income", "expense", "investment", "debt", "asset"]).optional(),
        category: z.string().min(1).max(100).optional(),
        amount: z.string().min(1).optional(),
        description: z.string().max(500).optional(),
        currency: z.string().min(3).max(3).optional(),
        date: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const { id, ...updates } = input;

      const existing = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

      if (existing.length === 0) {
        throw new Error("Transaction not found");
      }

      const dbUpdates: Record<string, unknown> = {};
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.date !== undefined) dbUpdates.date = new Date(updates.date);

      await db.update(transactions).set(dbUpdates).where(eq(transactions.id, id));

      return { success: true };
    }),

  deleteTransaction: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, input.id), eq(transactions.userId, userId)));

      if (existing.length === 0) {
        throw new Error("Transaction not found");
      }

      await db.delete(transactions).where(eq(transactions.id, input.id));

      return { success: true };
    }),

  getTotals: authedQuery
    .input(z.object({ currency: z.string().min(3).max(3).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const targetCurrency = input?.currency || "USD";

      const [membership] = await db
        .select()
        .from(familyMemberships)
        .where(eq(familyMemberships.userId, userId));

      let userIds = [userId];
      if (membership) {
        const familyMems = await db
          .select({ userId: familyMemberships.userId })
          .from(familyMemberships)
          .where(eq(familyMemberships.familyGroupId, membership.familyGroupId));
        userIds = familyMems.map(fm => fm.userId);
      }

      const txs = await db
        .select()
        .from(transactions)
        .where(inArray(transactions.userId, userIds));

      const rates = await getExchangeRates();

      const totals: Record<string, number> = {
        income: 0, expense: 0, investment: 0, debt: 0, asset: 0,
      };

      for (const t of txs) {
        const amountVal = parseFloat(t.amount || "0");
        const converted = convertAmount(amountVal, t.currency || "USD", targetCurrency, rates);
        totals[t.type] += converted;
      }

      const capital = totals.income - totals.expense;
      const netWorth = capital + totals.asset - totals.debt;

      return {
        income: totals.income,
        expense: totals.expense,
        investment: totals.investment,
        debt: totals.debt,
        asset: totals.asset,
        capital,
        netWorth,
      };
    }),

  // ─── Daily Quotes ───

  getDailyQuote: authedQuery
    .input(z.object({ date: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const results = await db
        .select()
        .from(dailyQuotes)
        .where(eq(dailyQuotes.userId, userId));

      const targetDate = input?.date || new Date().toISOString().slice(0, 10);
      return results.find((r) => {
        const dateStr = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date);
        return dateStr === targetDate;
      }) || null;
    }),

  createDailyQuote: authedQuery
    .input(
      z.object({
        text: z.string().min(1),
        type: z.enum(["excellent", "good", "regular", "critical"]),
        date: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const result = await db.insert(dailyQuotes).values({
        userId,
        text: input.text,
        type: input.type,
        date: new Date(input.date),
      });

      return { id: Number(result[0].insertId) };
    }),

  // ─── Chat Messages ───

  listChatMessages: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }),

  createChatMessage: authedQuery
    .input(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check chat limit for free users (5 messages/day)
      const subResults = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      const plan = getActivePlan(subResults);

      if (plan === "free" && input.role === "user") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allMsgs = await db
          .select({ createdAt: chatMessages.createdAt, role: chatMessages.role })
          .from(chatMessages)
          .where(eq(chatMessages.userId, userId));
        const todayUserMsgs = allMsgs.filter((m) => {
          if (m.role !== "user") return false;
          const d = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt);
          return d >= today;
        });
        if (todayUserMsgs.length >= 5) {
          throw new Error("FREE_CHAT_LIMIT: Alcanzaste el limite de 5 mensajes por dia. Suscribite a PRO para ilimitado.");
        }
      }

      const result = await db.insert(chatMessages).values({
        userId,
        role: input.role,
        content: input.content,
      });

      return { id: Number(result[0].insertId) };
    }),

  sendMessage: authedQuery
    .input(z.object({ content: z.string().min(1).max(10000) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const userMessage = input.content;

      // 1. Check chat limit for free users (5 messages/day)
      const subResults = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      const plan = getActivePlan(subResults);

      if (plan === "free") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allMsgs = await db
          .select({ createdAt: chatMessages.createdAt, role: chatMessages.role })
          .from(chatMessages)
          .where(eq(chatMessages.userId, userId));
        const todayUserMsgs = allMsgs.filter((m) => {
          if (m.role !== "user") return false;
          const d = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt);
          return d >= today;
        });
        if (todayUserMsgs.length >= 5) {
          throw new Error("FREE_CHAT_LIMIT: Alcanzaste el limite de 5 mensajes por dia. Suscribite a PRO para ilimitado.");
        }
      }

      // 2. Insert User Message
      await db.insert(chatMessages).values({
        userId,
        role: "user",
        content: userMessage,
      });

      // 3. Retrieve User Context for Gemini
      // Totals (converted to USD for uniform LLM analysis)
      const txs = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId));

      const rates = await getExchangeRates();

      const totals: Record<string, number> = {
        income: 0, expense: 0, investment: 0, debt: 0, asset: 0,
      };

      for (const t of txs) {
        const amountVal = parseFloat(t.amount || "0");
        const converted = convertAmount(amountVal, t.currency || "USD", "USD", rates);
        totals[t.type] += converted;
      }

      const capital = totals.income - totals.expense;
      const netWorth = capital + totals.asset - totals.debt;

      // Goals
      const goalsList = await db
        .select()
        .from(savingsGoals)
        .where(eq(savingsGoals.userId, userId));

      const goalsStr = goalsList.map(g => `- ${g.name}: Meta: $${g.targetAmount}, Ahorrado: $${g.currentAmount}, Limite: ${g.deadline || 'N/A'}`).join("\n");

      // Conversation history (last 8 messages)
      const history = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, userId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(8);
      history.reverse();

      const userCountry = ctx.user.country || "Argentina";

      // 4. Call Gemini
      let assistantResponse = "";
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "placeholder" || apiKey.includes("TEST-12345")) {
        // Fallback response if no API key is set
        assistantResponse = `[Modo Sandbox: GEMINI_API_KEY no configurada en el archivo .env]\n\nHola ${ctx.user.name}, veo que estas en ${userCountry}.\n\nTu situacion financiera actual (expresada en USD) es:\n- Patrimonio Neto: $${netWorth.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD\n- Ingresos: $${totals.income.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD\n- Gastos: $${totals.expense.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD\n- Metas de ahorro:\n${goalsStr || "Ninguna meta aun"}\n\nPara habilitar las respuestas en tiempo real de la Inteligencia Artificial de Gemini, por favor agrega tu clave API real en tu archivo \`app/.env\` como \`GEMINI_API_KEY=tu_clave_aqui\`.`;
      } else {
        try {
          const systemPrompt = `Eres "Tu Experto Financiero", un asesor de finanzas personales altamente capacitado.
Estás asesorando a un usuario con el siguiente contexto financiero (todas las sumas convertidas a USD para consistencia) y personal:
- País de residencia: ${userCountry} (Debes sugerir brokers, bancos, impuestos, regulaciones y tickers locales específicos de este país. Por ejemplo, en Argentina: IOL, Lemon Cash, CEDEARs, Mercado Pago; en México: GBM+, CetesDirecto, Bitso, Hey Banco, etc.)
- Ingresos acumulados: $${totals.income.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
- Gastos acumulados: $${totals.expense.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
- Inversiones: $${totals.investment.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
- Deudas: $${totals.debt.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
- Bienes/Capital: $${totals.asset.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
- Patrimonio Neto: $${netWorth.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
- Metas de ahorro actuales:
${goalsStr || "Ninguna meta de ahorro creada aún"}

Tu objetivo es dar recomendaciones súper específicas, accionables, paso a paso y realistas según el país y sus números. No des respuestas vagas.
Sé motivador pero realista. Usa un tono cercano y amigable en español latino.

Historial de conversación reciente:
${history.map(h => `${h.role === 'user' ? 'Usuario' : 'Asistente'}: ${h.content}`).join("\n")}
`;

          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          });
          const result = await model.generateContent(systemPrompt + `\n\nUsuario: ${userMessage}`);
          assistantResponse = result.response.text() || "Lo siento, tuve un problema procesando tu consulta. Por favor intenta de nuevo.";
        } catch (err: any) {
          console.error("Gemini API call failed:", err);
          let listInfo = "";
          try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
            if (listRes.ok) {
              const listData = await listRes.json();
              const names = listData.models?.map((m: any) => m.name.replace("models/", "")) || [];
              listInfo = ` Modelos disponibles para tu clave: ${names.join(", ")}`;
            } else {
              const errBody = await listRes.text();
              listInfo = ` (No se pudo listar modelos: Código ${listRes.status} - ${errBody})`;
            }
          } catch (listErr: any) {
            listInfo = ` (Error al listar: ${listErr.message})`;
          }
          assistantResponse = `Lo siento, hubo un error de comunicación con el servicio de IA de Gemini. Detalle: ${err.message || err}.${listInfo} Por favor asegúrate de que tu GEMINI_API_KEY sea válida.`;
        }
      }

      // 5. Insert Assistant Response
      await db.insert(chatMessages).values({
        userId,
        role: "assistant",
        content: assistantResponse,
      });

      return { success: true, response: assistantResponse };
    }),

  clearChat: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));

    return { success: true };
  }),

  getExchangeRates: authedQuery.query(async () => {
    return getExchangeRates();
  }),

  classifyCsvRows: authedQuery
    .input(
      z.object({
        rows: z.array(
          z.object({
            description: z.string(),
            amount: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const apiKey = process.env.GEMINI_API_KEY;
      const isSandbox = !apiKey || apiKey === "placeholder" || apiKey.includes("TEST-12345");

      if (isSandbox) {
        // Fallback simple rule-based classifier for sandbox mode
        return input.rows.map((row, index) => {
          const desc = row.description.toLowerCase();
          let type: "income" | "expense" | "investment" | "debt" | "asset" = "expense";
          let category = "Otros";

          if (desc.includes("sueldo") || desc.includes("nomina") || desc.includes("salary") || desc.includes("honorarios")) {
            type = "income";
            category = "Sueldo";
          } else if (desc.includes("uber") || desc.includes("cabify") || desc.includes("taxi") || desc.includes("subte") || desc.includes("colectivo") || desc.includes("bus")) {
            type = "expense";
            category = "Transporte";
          } else if (desc.includes("coto") || desc.includes("carrefour") || desc.includes("jumbo") || desc.includes("supermercado") || desc.includes("vea") || desc.includes("chino") || desc.includes("dia")) {
            type = "expense";
            category = "Comida";
          } else if (desc.includes("spotify") || desc.includes("netflix") || desc.includes("cine") || desc.includes("steam") || desc.includes("hbo") || desc.includes("disney")) {
            type = "expense";
            category = "Entretenimiento";
          } else if (desc.includes("inversion") || desc.includes("plazo fijo") || desc.includes("cedear") || desc.includes("crypto") || desc.includes("bitcoin") || desc.includes("acciones")) {
            type = "investment";
            category = "Inversiones";
          } else if (desc.includes("tarjeta") || desc.includes("visa") || desc.includes("mastercard") || desc.includes("prestamo") || desc.includes("credito")) {
            type = "debt";
            category = "Deudas";
          } else if (desc.includes("alquiler") || desc.includes("luz") || desc.includes("gas") || desc.includes("agua") || desc.includes("internet") || desc.includes("expensas")) {
            type = "expense";
            category = "Servicios";
          }

          return { index, type, category };
        });
      }

      // Live Gemini classification
      try {
        const prompt = `Analiza las siguientes transacciones financieras (descripción y monto) y clasifícalas en uno de los siguientes tipos exactos: 'income', 'expense', 'investment', 'debt', 'asset'.
También asígnales una categoría realista en español (por ejemplo: 'Sueldo', 'Comida', 'Transporte', 'Servicios', 'Salud', 'Entretenimiento', 'Otros').

Retorna ÚNICAMENTE un arreglo JSON con el siguiente formato, sin bloques de código markdown ni texto adicional:
[
  { "index": 0, "type": "expense", "category": "Comida" },
  ...
]

Transacciones a clasificar:
${input.rows.map((r, i) => `Índice ${i}: "${r.description}" (monto: ${r.amount})`).join("\n")}
`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        let textResult = result.response.text() || "[]";
        
        // Clean markdown block wrappers if present
        if (textResult.includes("```")) {
          textResult = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        const parsed = JSON.parse(textResult);
        return parsed as { index: number; type: "income" | "expense" | "investment" | "debt" | "asset"; category: string }[];
      } catch (err) {
        console.error("Gemini CSV classification failed, falling back:", err);
        return input.rows.map((row, index) => {
          const desc = row.description.toLowerCase();
          let type: "income" | "expense" | "investment" | "debt" | "asset" = "expense";
          let category = "Otros";
          if (desc.includes("sueldo") || desc.includes("nomina")) {
            type = "income";
            category = "Sueldo";
          } else if (desc.includes("uber") || desc.includes("transport")) {
            type = "expense";
            category = "Transporte";
          } else if (desc.includes("supermercado") || desc.includes("comida")) {
            type = "expense";
            category = "Comida";
          }
          return { index, type, category };
        });
      }
    }),

  bulkInsertTransactions: authedQuery
    .input(
      z.object({
        transactions: z.array(
          z.object({
            type: z.enum(["income", "expense", "investment", "debt", "asset"]),
            category: z.string(),
            amount: z.string(),
            description: z.string().optional(),
            currency: z.string().optional(),
            date: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      if (input.transactions.length === 0) return { success: true, count: 0 };

      // Bulk insert using drizzle
      const valuesToInsert = input.transactions.map((tx) => ({
        userId,
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        description: tx.description || null,
        currency: tx.currency || "USD",
        date: new Date(tx.date),
      }));

      await db.insert(transactions).values(valuesToInsert);

      return { success: true, count: valuesToInsert.length };
    }),
});
