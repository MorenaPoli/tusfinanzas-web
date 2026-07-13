import { getDb } from "../api/queries/connection";
import { users } from "../db/schema";
import "dotenv/config";

async function testConnection() {
  const { env } = await import("../api/lib/env");
  console.log("🔍 Probando conexión a:", env.databaseUrl);
  const db = getDb();
  try {
    // Intentar una consulta simple para verificar la conexión
    await db.select().from(users).limit(1);
    console.log("✅ ¡Conexión exitosa! Las tablas están creadas y accesibles.");
  } catch (err: any) {
    console.error("❌ Falló la conexión:", err);
    console.log("\n👉 Consejo: Asegúrate de que hayas copiado correctamente la 'Service URI' de Aiven en tu archivo `app/.env` en la variable `DATABASE_URL`.");
  }
}

testConnection();
