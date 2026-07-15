import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  // Run schema migrations before starting the server
  try {
    console.log("[boot] Running DB migrations...");
    const mysql = await import("mysql2/promise");
    const dbUrl = process.env.DATABASE_URL!;
    const conn = await mysql.createConnection(dbUrl);

    const migrations = [
      // Add lastSignInAt to users if missing
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS lastSignInAt DATETIME`,
      // Create user_sessions table (matches Drizzle schema table name)
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL,
        ipAddress VARCHAR(45) NOT NULL DEFAULT '',
        userAgent TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_sessions_userId (userId)
      )`,
      // Create bills table
      `CREATE TABLE IF NOT EXISTS bills (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        dueDate DATETIME NOT NULL,
        isPaid BIGINT NOT NULL DEFAULT 0,
        category VARCHAR(100) NOT NULL DEFAULT 'Servicios',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bills_userId (userId)
      )`,
      // Create user_investments table (matches Drizzle schema: symbol, avgPrice, no name)
      `CREATE TABLE IF NOT EXISTS user_investments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        shares DECIMAL(15,4) NOT NULL DEFAULT 0,
        avgPrice DECIMAL(15,2) NOT NULL DEFAULT 0,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_investments_userId (userId)
      )`,
    ];

    for (const sql of migrations) {
      await conn.execute(sql).catch((err: any) => {
        // Log but don't crash — some DBs may not support IF NOT EXISTS on ALTER
        console.warn("[boot] Migration warning:", err.message);
      });
    }
    await conn.end();
    console.log("[boot] DB migrations complete.");
  } catch (err: any) {
    console.error("[boot] Migration error (non-fatal):", err.message);
  }

  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
