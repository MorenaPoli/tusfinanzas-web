import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  kimiAuthUrl: required("VITE_KIMI_AUTH_URL"),
  kimiOpenUrl: optional("VITE_KIMI_OPEN_URL") || required("VITE_KIMI_AUTH_URL"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  ownerUnionId: optional("OWNER_UNION_ID"),
};
