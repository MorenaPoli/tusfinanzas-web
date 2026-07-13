import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { budgets, transactions, notifications } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const budgetRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    return db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));
  }),

  set: authedQuery
    .input(
      z.object({
        category: z.string().min(1).max(100),
        amount: z.string().min(1),
      })
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const db = getDb();
      const userId = user.id;

      // Check if budget already exists for this category
      const [existing] = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.category, input.category)));

      if (existing) {
        await db
          .update(budgets)
          .set({ amount: input.amount })
          .where(eq(budgets.id, existing.id));
        return { id: existing.id, updated: true };
      } else {
        const result = await db.insert(budgets).values({
          userId,
          category: input.category,
          amount: input.amount,
        });
        return { id: Number(result[0].insertId), updated: false };
      }
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx: { user }, input }) => {
      const db = getDb();
      const userId = user.id;

      await db
        .delete(budgets)
        .where(and(eq(budgets.id, input.id), eq(budgets.userId, userId)));
      return { success: true };
    }),

  getBudgetReport: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get all budgets
    const userBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));

    // Calculate actual expenses for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startStr = startOfMonth.toISOString().slice(0, 10);

    const actuals = await db
      .select({
        category: transactions.category,
        total: sql<string>`sum(cast(${transactions.amount} as decimal(15,2)))`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          sql`${transactions.date} >= ${startStr}`
        )
      )
      .groupBy(transactions.category);

    const actualMap = new Map(actuals.map(a => [a.category.toLowerCase(), parseFloat(a.total || "0")]));

    return userBudgets.map(b => {
      const spent = actualMap.get(b.category.toLowerCase()) ?? 0;
      const limit = parseFloat(b.amount);
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      return {
        id: b.id,
        category: b.category,
        limit,
        spent,
        percent,
      };
    });
  }),

  generateAutoBudget: authedQuery
    .mutation(async ({ ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startStr = thirtyDaysAgo.toISOString().slice(0, 10);

      const expenses = await db
        .select({
          category: transactions.category,
          amount: transactions.amount,
          description: transactions.description,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, "expense"),
            sql`${transactions.date} >= ${startStr}`
          )
        );

      const totals: Record<string, number> = {};
      for (const ex of expenses) {
        const val = parseFloat(ex.amount);
        totals[ex.category] = (totals[ex.category] || 0) + val;
      }

      const totalSpent = Object.values(totals).reduce((a, b) => a + b, 0);

      let recommendations: { category: string; amount: number; reason: string }[] = [];
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && apiKey !== "placeholder" && !apiKey.includes("TEST-12345")) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
          });

          const prompt = `Asesórame sobre presupuestos mensuales óptimos (en base a la regla 50/30/20).
Mis egresos de los últimos 30 días sumaron un total de $${totalSpent} USD desglosados en:
${Object.entries(totals).map(([cat, val]) => `- ${cat}: $${val}`).join("\n")}

Retorna un objeto JSON con la estructura:
{
  "recommendations": [
    { "category": "Categoría de presupuesto recomendada", "amount": 15000, "reason": "Motivación corta" }
  ]
}
Mantén los nombres de categorías simples (ej: Comida, Transporte, Entretenimiento, Servicios).`;

          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          const parsed = JSON.parse(responseText);
          if (parsed && Array.isArray(parsed.recommendations)) {
            recommendations = parsed.recommendations;
          }
        } catch (err) {
          console.error("Gemini auto-budget failed, running fallback:", err);
        }
      }

      if (recommendations.length === 0) {
        const categories = Object.keys(totals).length > 0 ? Object.keys(totals) : ["Comida", "Transporte", "Servicios", "Entretenimiento"];
        recommendations = categories.map(cat => {
          const spent = totals[cat] || 15000;
          const amount = Math.ceil((spent * 1.1) / 5000) * 5000;
          return {
            category: cat,
            amount: Math.max(5000, amount),
            reason: `Basado en tu consumo de $${spent.toLocaleString()} con un 10% de margen de seguridad.`
          };
        });
      }

      return { recommendations };
    }),
});

export async function checkBudgetThresholds(db: any, userId: number, category: string) {
  // 1. Get the budget for this category
  const [budget] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.category, category)));

  if (!budget) return;

  // 2. Calculate actual expenses for the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startStr = startOfMonth.toISOString().slice(0, 10);

  const [actual] = await db
    .select({
      total: sql<string>`sum(cast(${transactions.amount} as decimal(15,2)))`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        eq(transactions.category, category),
        sql`${transactions.date} >= ${startStr}`
      )
    );

  const spent = parseFloat(actual?.total || "0");
  const limit = parseFloat(budget.amount);
  if (limit <= 0) return;

  const percent = (spent / limit) * 100;

  // 3. Check if we already created a notification this month
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const checkThreshold = async (threshold: number, title: string, message: string) => {
    if (percent >= threshold) {
      // Check if alert already exists for this month and category
      const existingAlerts = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.type, "budget_alert"),
            sql`date_format(${notifications.createdAt}, '%Y-%m') = ${currentMonthStr}`,
            sql`${notifications.message} LIKE ${`%"${category}"%${threshold}%`}`
          )
        );

      if (existingAlerts.length === 0) {
        await db.insert(notifications).values({
          userId,
          type: "budget_alert",
          title,
          message,
        });
      }
    }
  };

  await checkThreshold(
    100,
    `Excediste el presupuesto de ${category}`,
    `¡Atención! Gastaste $${spent.toLocaleString('es-AR')} en la categoría "${category}", superando tu límite mensual de $${limit.toLocaleString('es-AR')} (100% alcanzado).`
  );

  if (percent < 100) {
    await checkThreshold(
      80,
      `Presupuesto de ${category} al 80%`,
      `Estás cerca del límite en la categoría "${category}". Gastaste $${spent.toLocaleString('es-AR')} de tu límite de $${limit.toLocaleString('es-AR')} (80% alcanzado).`
    );
  }
}
