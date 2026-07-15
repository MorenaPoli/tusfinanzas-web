import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { verifyLocalToken } from "./local-auth-router";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    const localToken = opts.req.headers.get("x-local-auth-token");
    if (localToken) {
      const decoded = verifyLocalToken(localToken);
      if (decoded) {
        const db = getDb();
        const userList = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            country: users.country,
            role: users.role,
            avatar: users.avatar,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            lastSignInAt: users.lastSignInAt,
          })
          .from(users)
          .where(eq(users.id, decoded.userId));
        if (userList.length > 0) {
          ctx.user = userList[0] as any;
        }
      }
    }
  } catch (err) {
    console.error("[context] Local auth verification failed:", err);
  }

  return ctx;
}
