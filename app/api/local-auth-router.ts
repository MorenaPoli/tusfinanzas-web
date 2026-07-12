import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "iafinanzas-secret-key-2026";

function signToken(userId: number, email: string, role: string): string {
  return jwt.sign({ userId, email, role, type: "local" }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyLocalToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && typeof decoded === "object" && decoded.type === "local") {
      return { userId: decoded.userId, email: decoded.email, role: decoded.role };
    }
    return null;
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        email: z.string().email("Email invalido"),
        password: z.string().min(6, "Minimo 6 caracteres"),
        name: z.string().min(2, "Minimo 2 caracteres").max(100),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db.select().from(users).where(eq(users.email, input.email));
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Ya existe una cuenta con ese email" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const result = await db.insert(users).values({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        country: input.country || "Argentina",
      });

      const userId = Number(result[0].insertId);
      const token = signToken(userId, input.email, "user");

      return { token, user: { id: userId, email: input.email, name: input.name, role: "user" } };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const userList = await db.select().from(users).where(eq(users.email, input.email));
      if (userList.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contrasena incorrectos" });
      }

      const user = userList[0];
      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contrasena incorrectos" });
      }

      await db.update(users).set({ lastSignInAt: new Date() }).where(eq(users.id, user.id));

      const token = signToken(user.id, user.email, user.role);

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, country: user.country },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req?.headers?.get?.("x-local-auth-token") || "";
    if (!token) return null;

    const decoded = verifyLocalToken(token);
    if (!decoded) return null;

    const db = getDb();
    const userList = await db.select().from(users).where(eq(users.id, decoded.userId));
    if (userList.length === 0) return null;

    const user = userList[0];
    return { id: user.id, email: user.email, name: user.name, role: user.role, country: user.country };
  }),
});
