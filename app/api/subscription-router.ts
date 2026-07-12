import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions, transactions } from "@db/schema";
import { eq } from "drizzle-orm";

export const subscriptionRouter = createRouter({
  getMyPlan: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const results = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    if (results.length === 0) {
      // Auto-create free plan for new users
      await db.insert(subscriptions).values({
        userId,
        plan: "free",
        status: "active",
      });
      return { plan: "free" as const, status: "active" as const };
    }

    const sub = results[0];
    // Check if expired
    const now = new Date();
    const expires = sub.expiresAt instanceof Date ? sub.expiresAt : new Date(sub.expiresAt);
    if (sub.plan !== "free" && expires < now) {
      // Downgrade to free
      await db
        .update(subscriptions)
        .set({ plan: "free", status: "active" })
        .where(eq(subscriptions.userId, userId));
      return { plan: "free" as const, status: "active" as const };
    }

    return { plan: sub.plan, status: sub.status };
  }),

  // ADMIN ONLY: upgrade a user (called by Stripe webhook or admin panel)
  upgradePlan: adminQuery
    .input(
      z.object({
        userId: z.number(),
        plan: z.enum(["free", "pro", "family"]),
        months: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { userId, plan, months } = input;

      const expiresAt = months
        ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);

      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      if (existing.length > 0) {
        await db
          .update(subscriptions)
          .set({ plan, status: "active", expiresAt })
          .where(eq(subscriptions.userId, userId));
      } else {
        await db.insert(subscriptions).values({
          userId,
          plan,
          status: "active",
          expiresAt,
        });
      }

      return { success: true, plan };
    }),

  // Count transactions this month for limit checking
  getMonthlyCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const allTx = await db
      .select({ date: transactions.date })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const thisMonth = allTx.filter((t) => {
      const d = t.date instanceof Date ? t.date : new Date(t.date);
      return d.toISOString().slice(0, 7) === monthStr;
    });

    return { count: thisMonth.length, limit: 30 };
  }),
});
