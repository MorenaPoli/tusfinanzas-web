import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bills, transactions, notifications } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const billsRouter = createRouter({
  listBills: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    return db
      .select()
      .from(bills)
      .where(eq(bills.userId, userId))
      .orderBy(bills.dueDate);
  }),

  createBill: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        amount: z.string().min(1),
        dueDate: z.string().refine(v => !isNaN(Date.parse(v)), { message: 'Fecha inválida' }),
        category: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const result = await db.insert(bills).values({
        userId,
        name: input.name,
        amount: input.amount,
        dueDate: new Date(input.dueDate),
        isPaid: 0,
        category: input.category,
      });

      return { id: Number(result[0].insertId) };
    }),

  payBill: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // 1. Fetch the bill to get details
      const [bill] = await db
        .select()
        .from(bills)
        .where(and(eq(bills.id, input.id), eq(bills.userId, userId)));

      if (!bill) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Bill not found' });
      }

      // Guard: don't double-pay
      if (bill.isPaid === 1) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Esta factura ya fue pagada.' });
      }

      // 2. Mark the bill as paid (isPaid = 1)
      await db
        .update(bills)
        .set({ isPaid: 1 })
        .where(and(eq(bills.id, input.id), eq(bills.userId, userId)));

      // 3. Automatically insert a matching transaction of type 'expense'
      const txResult = await db.insert(transactions).values({
        userId,
        type: "expense",
        category: bill.category,
        amount: bill.amount,
        description: `Pago programado: ${bill.name}`,
        currency: "USD", // default portfolio currency or from local settings
        date: new Date(),
      });

      return { success: true, transactionId: Number(txResult[0].insertId) };
    }),

  deleteBill: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      await db
        .delete(bills)
        .where(and(eq(bills.id, input.id), eq(bills.userId, userId)));

      return { success: true };
    }),
});
