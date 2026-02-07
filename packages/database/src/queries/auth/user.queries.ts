import { eq } from "drizzle-orm";
import { db } from "../../db";
import { user } from "../../schema/tables";
import type { User, InsertUser, UpdateUser } from "../../dto";

export const UserQueries = {
  /**
   * Find user by ID
   */
  findById: async (id: string): Promise<User | null> => {
    const result = await db.query.user.findFirst({
      where: eq(user.id, id),
    });
    return result ?? null;
  },

  /**
   * Find user by email
   */
  findByEmail: async (email: string): Promise<User | null> => {
    const result = await db.query.user.findFirst({
      where: eq(user.email, email.toLowerCase()),
    });
    return result ?? null;
  },

  /**
   * Create a new user
   */
  create: async (data: InsertUser): Promise<User> => {
    const [result] = await db.insert(user).values(data).returning();
    return result;
  },

  /**
   * Update user by ID
   */
  update: async (id: string, data: UpdateUser): Promise<User> => {
    const [result] = await db.update(user).set(data).where(eq(user.id, id)).returning();
    return result;
  },

  /**
   * Delete user by ID
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(user).where(eq(user.id, id));
  },

  /**
   * Set active tenant for user
   */
  setActiveTenant: async (userId: string, tenantId: string | null): Promise<User> => {
    const [result] = await db
      .update(user)
      .set({ activeTenantId: tenantId })
      .where(eq(user.id, userId))
      .returning();
    return result;
  },
};
