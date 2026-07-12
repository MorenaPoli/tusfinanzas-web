import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { familyGroups, familyMemberships, users, subscriptions } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const familyRouter = createRouter({
  getMyFamily: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Find user's membership
    const [membership] = await db
      .select()
      .from(familyMemberships)
      .where(eq(familyMemberships.userId, userId));

    if (!membership) return null;

    // Find the family group details
    const [group] = await db
      .select()
      .from(familyGroups)
      .where(eq(familyGroups.id, membership.familyGroupId));

    if (!group) return null;

    // Find all members in this family
    const allMemberships = await db
      .select()
      .from(familyMemberships)
      .where(eq(familyMemberships.familyGroupId, group.id));

    const memberDetails = [];
    for (const mem of allMemberships) {
      const [u] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, mem.userId));
      if (u) {
        memberDetails.push({
          id: u.id,
          name: u.name,
          email: u.email,
          role: mem.role,
        });
      }
    }

    return {
      id: group.id,
      name: group.name,
      code: group.code,
      ownerId: group.ownerId,
      myRole: membership.role,
      members: memberDetails,
    };
  }),

  createFamily: authedQuery
    .input(z.object({ name: z.string().min(2).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // 1. Verify user has Family plan subscription
      const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      if (!sub || sub.plan !== "family" || sub.status !== "active") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Debes tener una suscripción activa del Plan Familiar para crear un grupo.",
        });
      }

      // 2. Verify user is not already in a family
      const [existingMembership] = await db
        .select()
        .from(familyMemberships)
        .where(eq(familyMemberships.userId, userId));
      if (existingMembership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ya eres miembro de un grupo familiar.",
        });
      }

      // 3. Create family group
      const code = "FAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const insertResult = await db.insert(familyGroups).values({
        name: input.name,
        code,
        ownerId: userId,
      });

      const familyGroupId = Number(insertResult[0].insertId);

      // 4. Register owner as admin member
      await db.insert(familyMemberships).values({
        familyGroupId,
        userId,
        role: "admin",
      });

      return { success: true, code };
    }),

  joinFamily: authedQuery
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // 1. Verify user is not already in a family
      const [existingMembership] = await db
        .select()
        .from(familyMemberships)
        .where(eq(familyMemberships.userId, userId));
      if (existingMembership) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ya eres miembro de un grupo familiar.",
        });
      }

      // 2. Find family by code
      const [group] = await db
        .select()
        .from(familyGroups)
        .where(eq(familyGroups.code, input.code.trim().toUpperCase()));
      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "El código de grupo familiar ingresado no existe.",
        });
      }

      // 3. Verify member limit (max 5 members per family)
      const currentMembers = await db
        .select()
        .from(familyMemberships)
        .where(eq(familyMemberships.familyGroupId, group.id));
      if (currentMembers.length >= 6) { // 1 owner + 5 family members = 6 total
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El grupo familiar ha alcanzado el límite de 6 miembros.",
        });
      }

      // 4. Join family as member
      await db.insert(familyMemberships).values({
        familyGroupId: group.id,
        userId,
        role: "member",
      });

      return { success: true, name: group.name };
    }),

  leaveFamily: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Find membership
    const [membership] = await db
      .select()
      .from(familyMemberships)
      .where(eq(familyMemberships.userId, userId));

    if (!membership) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No eres miembro de ningún grupo familiar.",
      });
    }

    const [group] = await db
      .select()
      .from(familyGroups)
      .where(eq(familyGroups.id, membership.familyGroupId));

    if (group && group.ownerId === userId) {
      // Owner is leaving -> delete the group and all memberships
      await db.delete(familyMemberships).where(eq(familyMemberships.familyGroupId, group.id));
      await db.delete(familyGroups).where(eq(familyGroups.id, group.id));
      return { success: true, disbanded: true };
    } else {
      // Normal member leaving -> delete only this membership
      await db.delete(familyMemberships).where(eq(familyMemberships.userId, userId));
      return { success: true, disbanded: false };
    }
  }),

  removeMember: authedQuery
    .input(z.object({ memberId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // 1. Verify caller is admin of the family group
      const [membership] = await db
        .select()
        .from(familyMemberships)
        .where(eq(familyMemberships.userId, userId));

      if (!membership || membership.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo los administradores pueden remover miembros.",
        });
      }

      // 2. Verify target member is in the same family group
      const [targetMembership] = await db
        .select()
        .from(familyMemberships)
        .where(
          and(
            eq(familyMemberships.userId, input.memberId),
            eq(familyMemberships.familyGroupId, membership.familyGroupId)
          )
        );

      if (!targetMembership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "El miembro no pertenece a tu grupo familiar.",
        });
      }

      if (targetMembership.userId === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No puedes removerte a ti mismo. Usa 'leaveFamily' en su lugar.",
        });
      }

      // 3. Delete membership
      await db.delete(familyMemberships).where(eq(familyMemberships.userId, input.memberId));

      return { success: true };
    }),
});
