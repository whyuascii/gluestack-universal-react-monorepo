import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { tenants, tenantMembers, user } from "../../schema/tables";
import type {
  Tenant,
  InsertTenant,
  UpdateTenant,
  TenantMember,
  InsertTenantMember,
  UpdateTenantMember,
} from "../../dto";

export const TenantQueries = {
  /**
   * Find tenant by ID
   */
  findById: async (id: string): Promise<Tenant | null> => {
    const result = await db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });
    return result ?? null;
  },

  /**
   * Create a new tenant
   */
  create: async (data: InsertTenant): Promise<Tenant> => {
    const [result] = await db.insert(tenants).values(data).returning();
    return result;
  },

  /**
   * Update tenant by ID
   */
  update: async (id: string, data: UpdateTenant): Promise<Tenant> => {
    const [result] = await db.update(tenants).set(data).where(eq(tenants.id, id)).returning();
    return result;
  },

  /**
   * Delete tenant by ID
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(tenants).where(eq(tenants.id, id));
  },

  /**
   * Get all tenants for a user
   */
  findByUserId: async (userId: string): Promise<Tenant[]> => {
    const memberships = await db.query.tenantMembers.findMany({
      where: eq(tenantMembers.userId, userId),
      with: {
        tenant: true,
      },
    });
    return memberships.map((m) => m.tenant);
  },
};

export const TenantMemberQueries = {
  /**
   * Find member by tenant and user
   */
  findByTenantAndUser: async (tenantId: string, userId: string): Promise<TenantMember | null> => {
    const result = await db.query.tenantMembers.findFirst({
      where: and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, userId)),
    });
    return result ?? null;
  },

  /**
   * Get all members of a tenant
   */
  findByTenantId: async (tenantId: string): Promise<TenantMember[]> => {
    return db.query.tenantMembers.findMany({
      where: eq(tenantMembers.tenantId, tenantId),
    });
  },

  /**
   * Get all memberships for a user
   */
  findByUserId: async (userId: string): Promise<TenantMember[]> => {
    return db.query.tenantMembers.findMany({
      where: eq(tenantMembers.userId, userId),
    });
  },

  /**
   * Create a new member
   */
  create: async (data: InsertTenantMember): Promise<TenantMember> => {
    const [result] = await db.insert(tenantMembers).values(data).returning();
    return result;
  },

  /**
   * Update member role
   */
  update: async (id: string, data: UpdateTenantMember): Promise<TenantMember> => {
    const [result] = await db
      .update(tenantMembers)
      .set(data)
      .where(eq(tenantMembers.id, id))
      .returning();
    return result;
  },

  /**
   * Delete member
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(tenantMembers).where(eq(tenantMembers.id, id));
  },
};
