/**
 * Activity Tracking Middleware
 *
 * Tracks user and tenant activity for engagement metrics.
 * Updates are async and non-blocking to avoid impacting response times.
 */

import { db, user, userActivityDaily, tenantActivityDaily, eq, and, sql } from "@app/database";
import { os } from "@orpc/server";
import type { AuthContext } from "./auth";

/**
 * Simple in-memory debounce to avoid updating lastActiveAt on every request.
 * Only updates if the user hasn't been active in the last minute.
 */
const lastActiveCache = new Map<string, number>();
const DEBOUNCE_MS = 60_000; // 1 minute

function shouldUpdateLastActive(userId: string): boolean {
  const lastActive = lastActiveCache.get(userId);
  const now = Date.now();

  if (!lastActive || now - lastActive > DEBOUNCE_MS) {
    lastActiveCache.set(userId, now);
    return true;
  }

  return false;
}

/**
 * Get current date string in YYYY-MM-DD format
 */
function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Update user's lastActiveAt timestamp
 * Async, non-blocking
 */
async function updateUserLastActive(userId: string): Promise<void> {
  if (!shouldUpdateLastActive(userId)) {
    return;
  }

  try {
    await db.update(user).set({ lastActiveAt: new Date() }).where(eq(user.id, userId));
  } catch (error) {
    // Silently fail - this is best-effort tracking
    console.warn("[Activity] Failed to update lastActiveAt:", error);
  }
}

/**
 * Increment daily activity counter for user
 * Uses upsert pattern with ON CONFLICT
 */
async function incrementUserDailyActivity(userId: string): Promise<void> {
  const dateStr = getCurrentDateString();

  try {
    // Upsert: insert or update event count
    await db
      .insert(userActivityDaily)
      .values({
        userId,
        date: dateStr,
        eventCount: 1,
        sessionCount: 0,
        activeMinutes: 0,
        featuresUsed: [],
      })
      .onConflictDoUpdate({
        target: [userActivityDaily.userId, userActivityDaily.date],
        set: {
          eventCount: sql`${userActivityDaily.eventCount} + 1`,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    // Silently fail - this is best-effort tracking
    console.warn("[Activity] Failed to increment user activity:", error);
  }
}

/**
 * Increment daily activity counter for tenant
 * Uses upsert pattern with ON CONFLICT
 */
async function incrementTenantDailyActivity(tenantId: string): Promise<void> {
  const dateStr = getCurrentDateString();

  try {
    // Upsert: insert or update event count
    await db
      .insert(tenantActivityDaily)
      .values({
        tenantId,
        date: dateStr,
        eventCount: 1,
        activeUsers: 0,
        newMembers: 0,
      })
      .onConflictDoUpdate({
        target: [tenantActivityDaily.tenantId, tenantActivityDaily.date],
        set: {
          eventCount: sql`${tenantActivityDaily.eventCount} + 1`,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    // Silently fail - this is best-effort tracking
    console.warn("[Activity] Failed to increment tenant activity:", error);
  }
}

/**
 * Track all activity for a user (and optionally their active tenant)
 * Fire-and-forget, doesn't block the request
 */
function trackActivity(userId: string, tenantId?: string | null): void {
  // Fire async updates without awaiting
  updateUserLastActive(userId).catch(() => {});
  incrementUserDailyActivity(userId).catch(() => {});

  if (tenantId) {
    incrementTenantDailyActivity(tenantId).catch(() => {});
  }
}

/**
 * Activity tracking middleware
 *
 * Tracks user and tenant activity after authentication.
 * Non-blocking - fires tracking async and returns immediately.
 *
 * Should be placed AFTER authMiddleware in the middleware chain.
 */
export const activityMiddleware = os.middleware(async ({ context, next }) => {
  const ctx = context as AuthContext;

  // Track activity async (fire-and-forget)
  if (ctx.user?.id) {
    trackActivity(ctx.user.id, ctx.user.activeTenantId);
  }

  // Continue to next middleware/handler immediately
  return next({ context });
});

/**
 * Helper to clear the debounce cache (useful for testing)
 */
export function clearActivityCache(): void {
  lastActiveCache.clear();
}
