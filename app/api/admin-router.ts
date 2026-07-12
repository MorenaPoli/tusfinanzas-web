import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, transactions, subscriptions, supportTickets } from "@db/schema";
import { sql, desc } from "drizzle-orm";

export const adminRouter = createRouter({
  getStats: adminQuery.query(async () => {
    const db = getDb();

    const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const totalTransactions = await db.select({ count: sql<number>`COUNT(*)` }).from(transactions);
    const totalPro = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptions)
      .where(sql`${subscriptions.plan} != 'free'`);
    const openTickets = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(supportTickets)
      .where(sql`${supportTickets.status} = 'open'`);

    return {
      users: totalUsers[0]?.count ?? 0,
      transactions: totalTransactions[0]?.count ?? 0,
      proUsers: totalPro[0]?.count ?? 0,
      openTickets: openTickets[0]?.count ?? 0,
    };
  }),

  listUsers: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        country: users.country,
        role: users.role,
        createdAt: users.createdAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }),

  listTransactions: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        category: transactions.category,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(100);
  }),

  listSubscriptions: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt));
  }),

  listTickets: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  }),

  updateTicketStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["open", "in_progress", "resolved", "closed"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(supportTickets).set({ status: input.status }).where(sql`${supportTickets.id} = ${input.id}`);
      return { success: true };
    }),
});
