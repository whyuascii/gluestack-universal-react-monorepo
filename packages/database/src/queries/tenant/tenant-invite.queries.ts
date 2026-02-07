import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { tenantInvites } from "../../schema/tables";
import type { TenantInvite, InsertTenantInvite, UpdateTenantInvite } from "../../dto";

export const TenantInviteQueries = {
  /**
   * Find invite by ID
   */
  findById: async (id: string): Promise<TenantInvite | null> => {
    const result = await db.query.tenantInvites.findFirst({
      where: eq(tenantInvites.id, id),
    });
    return result ?? null;
  },

  /**
   * Find invite by token
   */
  findByToken: async (token: string): Promise<TenantInvite | null> => {
    const result = await db.query.tenantInvites.findFirst({
      where: eq(tenantInvites.token, token),
    });
    return result ?? null;
  },

  /**
   * Find pending invite by tenant and email
   */
  findPendingByTenantAndEmail: async (
    tenantId: string,
    email: string
  ): Promise<TenantInvite | null> => {
    const result = await db.query.tenantInvites.findFirst({
      where: and(
        eq(tenantInvites.tenantId, tenantId),
        eq(tenantInvites.email, email.toLowerCase()),
        eq(tenantInvites.status, "pending")
      ),
    });
    return result ?? null;
  },

  /**
   * Get all invites for a tenant
   */
  findByTenantId: async (tenantId: string): Promise<TenantInvite[]> => {
    return db.query.tenantInvites.findMany({
      where: eq(tenantInvites.tenantId, tenantId),
    });
  },

  /**
   * Create a new invite
   */
  create: async (data: InsertTenantInvite): Promise<TenantInvite> => {
    const [result] = await db.insert(tenantInvites).values(data).returning();
    return result;
  },

  /**
   * Update invite
   */
  update: async (id: string, data: UpdateTenantInvite): Promise<TenantInvite> => {
    const [result] = await db
      .update(tenantInvites)
      .set(data)
      .where(eq(tenantInvites.id, id))
      .returning();
    return result;
  },

  /**
   * Mark invite as accepted
   */
  markAccepted: async (id: string): Promise<TenantInvite> => {
    const [result] = await db
      .update(tenantInvites)
      .set({ status: "accepted" })
      .where(eq(tenantInvites.id, id))
      .returning();
    return result;
  },

  /**
   * Delete invite
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(tenantInvites).where(eq(tenantInvites.id, id));
  },
};
