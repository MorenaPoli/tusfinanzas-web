import { financeRouter } from "./finance-router";
import { subscriptionRouter } from "./subscription-router";
import { mercadoPagoRouter } from "./mercadopago-router";
import { localAuthRouter } from "./local-auth-router";
import { adminRouter } from "./admin-router";
import { supportRouter } from "./support-router";
import { goalsRouter } from "./goals-router";
import { familyRouter } from "./family-router";
import { notificationRouter } from "./notification-router";
import { budgetRouter } from "./budget-router";
import { billsRouter } from "./bills-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: localAuthRouter,
  finance: financeRouter,
  subscription: subscriptionRouter,
  mercadopago: mercadoPagoRouter,
  admin: adminRouter,
  support: supportRouter,
  goals: goalsRouter,
  family: familyRouter,
  notification: notificationRouter,
  budget: budgetRouter,
  bills: billsRouter,
});

export type AppRouter = typeof appRouter;
