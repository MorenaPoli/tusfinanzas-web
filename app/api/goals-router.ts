import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { savingsGoals, familyMemberships } from "@db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export const goalsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
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

    return db
      .select()
      .from(savingsGoals)
      .where(inArray(savingsGoals.userId, userIds))
      .orderBy(desc(savingsGoals.createdAt));
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        targetAmount: z.string().min(1),
        currentAmount: z.string().optional(),
        deadline: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const db = getDb();
      const result = await db.insert(savingsGoals).values({
        userId: user.id,
        name: input.name,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount || "0",
        deadline: input.deadline ? new Date(input.deadline) : null,
        icon: input.icon || "🎯",
      });
      return { id: Number(result[0].insertId) };
    }),

  updateProgress: authedQuery
    .input(z.object({ id: z.number(), currentAmount: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(savingsGoals)
        .set({ currentAmount: input.currentAmount })
        .where(eq(savingsGoals.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(savingsGoals).where(eq(savingsGoals.id, input.id));
      return { success: true };
    }),
});
