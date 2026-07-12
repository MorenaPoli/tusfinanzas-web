import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { supportTickets } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const supportRouter = createRouter({
  createTicket: authedQuery
    .input(
      z.object({
        subject: z.string().min(5).max(200),
        message: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;
      const email = ctx.user.email || "usuario@iafinanzas.app";

      const result = await db.insert(supportTickets).values({
        userId,
        userEmail: email,
        subject: input.subject,
        message: input.message,
      });

      return { id: Number(result[0].insertId), success: true };
    }),

  myTickets: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, ctx.user.id))
      .orderBy(desc(supportTickets.createdAt));
  }),
});
