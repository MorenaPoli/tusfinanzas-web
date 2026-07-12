import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    // Strip '?ssl-mode=REQUIRED' or similar parameters that trigger mysql2 warnings
    let cleanUrl = env.databaseUrl;
    if (cleanUrl.includes("ssl-mode=")) {
      cleanUrl = cleanUrl.replace(/[\?&]ssl-mode=[^&]+/g, "");
    }

    // Create the connection pool with explicit ssl options
    const pool = mysql.createPool({
      uri: cleanUrl,
      ssl: {
        rejectUnauthorized: true, // Required for secure hosted DBs like Aiven
      },
    });

    instance = drizzle(pool, {
      schema: fullSchema,
      mode: "default",
    });
  }
  return instance;
}
