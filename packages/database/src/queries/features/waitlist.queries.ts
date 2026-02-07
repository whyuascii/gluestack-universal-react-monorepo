import { eq } from "drizzle-orm";
import { db } from "../../db";
import { waitlist } from "../../schema/tables";
import type { Waitlist, InsertWaitlist } from "../../dto";

export const WaitlistQueries = {
  /**
   * Find by email
   */
  findByEmail: async (email: string): Promise<Waitlist | null> => {
    const result = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, email.toLowerCase()),
    });
    return result ?? null;
  },

  /**
   * Add email to waitlist
   */
  create: async (data: InsertWaitlist): Promise<Waitlist> => {
    const [result] = await db
      .insert(waitlist)
      .values({ ...data, email: data.email.toLowerCase() })
      .returning();
    return result;
  },

  /**
   * Check if email exists
   */
  exists: async (email: string): Promise<boolean> => {
    const result = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, email.toLowerCase()),
    });
    return !!result;
  },

  /**
   * Delete by email
   */
  deleteByEmail: async (email: string): Promise<void> => {
    await db.delete(waitlist).where(eq(waitlist.email, email.toLowerCase()));
  },
};
