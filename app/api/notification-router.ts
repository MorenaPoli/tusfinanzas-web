import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }),

  markAsRead: authedQuery
    .input(z.object({ id: z.number().optional() }))
    .mutation(async ({ ctx: { user }, input }) => {
      const db = getDb();
      const userId = user.id;

      if (input.id) {
        await db
          .update(notifications)
          .set({ isRead: 1 })
          .where(and(eq(notifications.id, input.id), eq(notifications.userId, userId)));
      } else {
        await db
          .update(notifications)
          .set({ isRead: 1 })
          .where(eq(notifications.userId, userId));
      }
      return { success: true };
    }),
});
