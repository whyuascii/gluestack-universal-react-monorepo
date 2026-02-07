/**
 * Admin Identity Actions
 *
 * Business logic for admin user management.
 * Uses simplified admin auth: user.adminRole column instead of separate tables.
 */
import { db, user, verification, eq, desc, isNotNull, and, gt } from "@app/database";
import type { AdminUserResponse, AdminRoleResponse, AdminMeResponse } from "@app/core-contract";
import { ORPCError } from "@orpc/server";
import { createAdminAuditLog } from "./admin-audit";
import { sendEmail } from "@app/mailer";
import { adminInviteEmail } from "@app/mailer/templates";
import { render } from "@react-email/components";
import crypto from "crypto";

// =============================================================================
// TYPES
// =============================================================================

export type AdminRole = "read_only" | "support_rw" | "super_admin";

const ADMIN_INVITE_PREFIX = "admin-invite:";
const INVITE_EXPIRY_DAYS = 7;

// =============================================================================
// HELPER: Generate secure token
// =============================================================================

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

// =============================================================================
// HELPER: Get admin user response format
// =============================================================================

function formatAdminUserResponse(dbUser: {
  id: string;
  email: string;
  name: string;
  adminRole: string | null;
  emailVerified: boolean;
  createdAt: Date;
  lastActiveAt: Date | null;
  image: string | null;
}): AdminUserResponse {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    company: "Internal", // Simplified - no separate company field
    status: dbUser.emailVerified ? "active" : "pending",
    roles: dbUser.adminRole ? [dbUser.adminRole as AdminRole] : [],
    createdAt: dbUser.createdAt,
    lastLoginAt: dbUser.lastActiveAt,
    avatarUrl: dbUser.image,
  };
}

// =============================================================================
// LIST ADMIN USERS
// =============================================================================

export async function listAdminUsers(
  page: number,
  limit: number
): Promise<{ users: AdminUserResponse[]; total: number }> {
  const offset = (page - 1) * limit;

  // Get users who have adminRole set
  const users = await db.query.user.findMany({
    where: isNotNull(user.adminRole),
    limit,
    offset,
    orderBy: desc(user.createdAt),
  });

  // Get total count
  const allAdmins = await db.query.user.findMany({
    where: isNotNull(user.adminRole),
    columns: { id: true },
  });

  return {
    users: users.map(formatAdminUserResponse),
    total: allAdmins.length,
  };
}

// =============================================================================
// GET ADMIN USER
// =============================================================================

export async function getAdminUser(userId: string): Promise<AdminUserResponse> {
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, userId), isNotNull(user.adminRole)),
  });

  if (!dbUser) {
    throw new ORPCError("NOT_FOUND", { message: "Admin user not found" });
  }

  return formatAdminUserResponse(dbUser);
}

// =============================================================================
// CREATE ADMIN USER (with invitation email)
// =============================================================================

export async function createAdminUser(
  input: { email: string; name?: string; roles: AdminRole[] },
  actorAdminUserId: string
): Promise<AdminUserResponse> {
  const email = input.email.toLowerCase().trim();
  const adminRole = input.roles[0] || "read_only"; // Use first role (simplified to single role)

  // Check if user already exists
  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existing) {
    // User exists - check if they're already an admin
    if (existing.adminRole) {
      throw new ORPCError("CONFLICT", { message: "User is already an admin" });
    }

    // Upgrade existing user to admin
    await db.update(user).set({ adminRole }).where(eq(user.id, existing.id));

    // If user is already verified, they're ready to go
    if (existing.emailVerified) {
      await createAdminAuditLog({
        adminUserId: actorAdminUserId,
        action: "admin.user_upgraded",
        targetType: "user",
        targetId: existing.id,
        metadata: { role: adminRole },
      });

      return formatAdminUserResponse({ ...existing, adminRole });
    }

    // Otherwise, send them an invite to complete setup
    await sendAdminInviteEmail(existing.id, email, input.name || existing.name, adminRole);

    await createAdminAuditLog({
      adminUserId: actorAdminUserId,
      action: "admin.user_invited",
      targetType: "user",
      targetId: existing.id,
      metadata: { role: adminRole },
    });

    return formatAdminUserResponse({ ...existing, adminRole });
  }

  // Create new user with admin role
  const newUserId = generateId();
  const [newUser] = await db
    .insert(user)
    .values({
      id: newUserId,
      email,
      name: input.name || email.split("@")[0],
      emailVerified: false,
      adminRole,
    })
    .returning();

  // Send invite email
  await sendAdminInviteEmail(newUser.id, email, newUser.name, adminRole);

  await createAdminAuditLog({
    adminUserId: actorAdminUserId,
    action: "admin.user_created",
    targetType: "user",
    targetId: newUser.id,
    metadata: { role: adminRole },
  });

  return formatAdminUserResponse(newUser);
}

// =============================================================================
// SEND ADMIN INVITE EMAIL
// =============================================================================

async function sendAdminInviteEmail(
  userId: string,
  email: string,
  name: string,
  adminRole: AdminRole
): Promise<void> {
  // Generate invite token
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  // Delete any existing invite tokens for this user
  await db
    .delete(verification)
    .where(eq(verification.identifier, `${ADMIN_INVITE_PREFIX}${email}`));

  // Store token in verification table
  await db.insert(verification).values({
    id: generateId(),
    identifier: `${ADMIN_INVITE_PREFIX}${email}`,
    value: token,
    expiresAt,
  });

  // Build invite link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteLink = `${appUrl}/admin-invite?token=${token}`;

  // Render and send email
  const html = await render(
    adminInviteEmail({
      name,
      adminRole,
      inviteLink,
      appName: process.env.EMAIL_FROM_NAME || "App",
    })
  );

  await sendEmail({
    to: email,
    subject: "You've been invited to join the admin team",
    html,
  });
}

// =============================================================================
// VERIFY ADMIN INVITE TOKEN
// =============================================================================

export async function verifyAdminInviteToken(
  token: string
): Promise<{ userId: string; email: string; adminRole: AdminRole }> {
  // Find token in verification table
  const record = await db.query.verification.findFirst({
    where: and(eq(verification.value, token), gt(verification.expiresAt, new Date())),
  });

  if (!record || !record.identifier.startsWith(ADMIN_INVITE_PREFIX)) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid or expired invitation token" });
  }

  const email = record.identifier.replace(ADMIN_INVITE_PREFIX, "");

  // Find the user
  const dbUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (!dbUser) {
    throw new ORPCError("NOT_FOUND", { message: "User not found" });
  }

  if (!dbUser.adminRole) {
    throw new ORPCError("BAD_REQUEST", { message: "User is not an admin" });
  }

  if (dbUser.emailVerified) {
    throw new ORPCError("BAD_REQUEST", { message: "Invitation has already been accepted" });
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    adminRole: dbUser.adminRole as AdminRole,
  };
}

// =============================================================================
// ACCEPT ADMIN INVITE
// =============================================================================

export async function acceptAdminInvite(
  token: string,
  password: string
): Promise<{ userId: string; email: string }> {
  // Verify token
  const { userId, email } = await verifyAdminInviteToken(token);

  // Hash password using Better Auth's method
  const { hashPassword } = await import("better-auth/crypto");
  const passwordHash = await hashPassword(password);

  // Update user: set password and mark as verified
  await db
    .update(user)
    .set({
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  // Store password in account table (Better Auth pattern)
  const { account } = await import("@app/database");

  // Check if credential account exists
  const existingAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, "credential")),
  });

  if (existingAccount) {
    // Update existing credential account
    await db
      .update(account)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(account.id, existingAccount.id));
  } else {
    // Create credential account
    await db.insert(account).values({
      id: generateId(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Delete the invite token
  await db.delete(verification).where(eq(verification.value, token));

  return { userId, email };
}

// =============================================================================
// UPDATE ADMIN USER ROLES
// =============================================================================

export async function updateAdminUserRoles(
  adminUserId: string,
  roles: AdminRole[],
  reason: string,
  actorAdminUserId: string
): Promise<AdminUserResponse> {
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, adminUserId), isNotNull(user.adminRole)),
  });

  if (!dbUser) {
    throw new ORPCError("NOT_FOUND", { message: "Admin user not found" });
  }

  const newRole = roles[0] || "read_only"; // Simplified to single role

  await db
    .update(user)
    .set({ adminRole: newRole, updatedAt: new Date() })
    .where(eq(user.id, adminUserId));

  await createAdminAuditLog({
    adminUserId: actorAdminUserId,
    action: "admin.user_roles_updated",
    targetType: "user",
    targetId: adminUserId,
    reason,
    metadata: { previousRole: dbUser.adminRole, newRole },
  });

  return formatAdminUserResponse({ ...dbUser, adminRole: newRole });
}

// =============================================================================
// UPDATE ADMIN USER STATUS (suspend/activate)
// =============================================================================

export async function updateAdminUserStatus(
  adminUserId: string,
  status: "active" | "suspended",
  reason: string,
  actorAdminUserId: string
): Promise<AdminUserResponse> {
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, adminUserId), isNotNull(user.adminRole)),
  });

  if (!dbUser) {
    throw new ORPCError("NOT_FOUND", { message: "Admin user not found" });
  }

  if (status === "suspended") {
    // Remove admin role to suspend
    await db
      .update(user)
      .set({ adminRole: null, updatedAt: new Date() })
      .where(eq(user.id, adminUserId));

    await createAdminAuditLog({
      adminUserId: actorAdminUserId,
      action: "admin.user_suspended",
      targetType: "user",
      targetId: adminUserId,
      reason,
      metadata: { previousRole: dbUser.adminRole },
    });

    return formatAdminUserResponse({ ...dbUser, adminRole: null });
  } else {
    // Restore previous role or default to read_only
    const roleToRestore = dbUser.adminRole || "read_only";

    await db
      .update(user)
      .set({ adminRole: roleToRestore, updatedAt: new Date() })
      .where(eq(user.id, adminUserId));

    await createAdminAuditLog({
      adminUserId: actorAdminUserId,
      action: "admin.user_activated",
      targetType: "user",
      targetId: adminUserId,
      reason,
    });

    return formatAdminUserResponse({ ...dbUser, adminRole: roleToRestore });
  }
}

// =============================================================================
// LIST ROLES (static list since we don't use admin_roles table)
// =============================================================================

export async function listAdminRoles(): Promise<AdminRoleResponse[]> {
  return [
    {
      key: "read_only",
      name: "Read Only",
      description: "Can view data but cannot make changes",
      permissions: ["read"],
    },
    {
      key: "support_rw",
      name: "Support",
      description: "Can view and modify data, handle support",
      permissions: ["read", "write", "impersonate"],
    },
    {
      key: "super_admin",
      name: "Super Admin",
      description: "Full access including managing other admins",
      permissions: ["read", "write", "impersonate", "manage_admins"],
    },
  ];
}

// =============================================================================
// RESEND ADMIN INVITE
// =============================================================================

export async function resendAdminInvite(
  adminUserId: string,
  actorAdminUserId: string
): Promise<void> {
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, adminUserId), isNotNull(user.adminRole)),
  });

  if (!dbUser) {
    throw new ORPCError("NOT_FOUND", { message: "Admin user not found" });
  }

  if (dbUser.emailVerified) {
    throw new ORPCError("BAD_REQUEST", { message: "User has already accepted their invitation" });
  }

  await sendAdminInviteEmail(dbUser.id, dbUser.email, dbUser.name, dbUser.adminRole as AdminRole);

  await createAdminAuditLog({
    adminUserId: actorAdminUserId,
    action: "admin.invite_resent",
    targetType: "user",
    targetId: adminUserId,
  });
}
