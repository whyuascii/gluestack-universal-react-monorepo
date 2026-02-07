import { db, tenants, tenantMembers, tenantInvites, user, eq, and } from "@app/database";
import { sendTemplateEmail } from "@app/mailer";
import { throwError } from "../lib/errors";
import { emit } from "../lib/events";
import type { AuthContext } from "../middleware";

interface CreateTenantInput {
  name: string;
}

interface SendInvitesInput {
  id: string;
  emails: string[];
}

export class TenantActions {
  static async create(input: CreateTenantInput, context: AuthContext) {
    const currentUser = context.user;

    try {
      // Create the tenant
      const [newTenant] = await db
        .insert(tenants)
        .values({
          name: input.name,
          type: "family",
        })
        .returning();

      // Create tenant member with owner role
      await db.insert(tenantMembers).values({
        tenantId: newTenant.id,
        userId: currentUser.id,
        role: "owner",
      });

      // If user has no active tenant, set this as active
      if (!currentUser.activeTenantId) {
        await db
          .update(user)
          .set({ activeTenantId: newTenant.id })
          .where(eq(user.id, currentUser.id));
      }

      // Emit tenant.created event for notifications
      emit("tenant.created", {
        tenantId: newTenant.id,
        tenantName: newTenant.name,
        ownerUserId: currentUser.id,
      });

      return {
        tenantId: newTenant.id,
        name: newTenant.name,
      };
    } catch (error) {
      // Log the original error for debugging, then throw user-friendly error
      console.error("Failed to create tenant:", error);
      throwError("INTERNAL_ERROR", "errors:generic.unknown");
    }
  }

  static async sendInvites(input: SendInvitesInput, context: AuthContext) {
    const currentUser = context.user;
    const { id: tenantId, emails } = input;

    // Verify tenant exists
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      throwError("NOT_FOUND", "errors:notFound.group");
    }

    // Verify user is a member
    const membership = await db.query.tenantMembers.findFirst({
      where: and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, currentUser.id)),
    });

    if (!membership) {
      throwError("FORBIDDEN", "errors:forbidden.noPermission");
    }

    // Process each email
    const invited: string[] = [];
    const skipped: Array<{
      email: string;
      reason: "already_member" | "already_invited" | "email_failed" | "invalid_format";
    }> = [];

    const normalizedEmails = [...new Set(emails.map((e) => e.toLowerCase().trim()))];

    for (const email of normalizedEmails) {
      // Don't invite yourself
      if (email === currentUser.email.toLowerCase()) {
        skipped.push({ email, reason: "invalid_format" });
        continue;
      }

      // Check if already a member
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (existingUser) {
        const existingMember = await db.query.tenantMembers.findFirst({
          where: and(
            eq(tenantMembers.tenantId, tenantId),
            eq(tenantMembers.userId, existingUser.id)
          ),
        });

        if (existingMember) {
          skipped.push({ email, reason: "already_member" });
          continue;
        }
      }

      // Check for existing pending invite
      const existingInvite = await db.query.tenantInvites.findFirst({
        where: and(
          eq(tenantInvites.tenantId, tenantId),
          eq(tenantInvites.email, email),
          eq(tenantInvites.status, "pending")
        ),
      });

      if (existingInvite && new Date(existingInvite.expiresAt) > new Date()) {
        skipped.push({ email, reason: "already_invited" });
        continue;
      }

      // Create invite
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      try {
        const [newInvite] = await db
          .insert(tenantInvites)
          .values({
            tenantId,
            invitedBy: currentUser.id,
            email,
            token,
            status: "pending",
            expiresAt,
          })
          .returning();

        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/accept?token=${token}`;

        await sendTemplateEmail("inviteToTenant", {
          to: email,
          data: {
            inviterName: currentUser.name,
            tenantName: tenant!.name,
            inviteLink,
          },
          locale: "en", // TODO: Use user's preferred locale when available
        });

        // Emit invite.sent event for notifications
        emit("invite.sent", {
          inviteId: newInvite.id,
          inviterUserId: currentUser.id,
          inviterName: currentUser.name,
          email,
          tenantId,
          tenantName: tenant!.name,
        });

        invited.push(email);
      } catch (error) {
        skipped.push({ email, reason: "email_failed" });
      }
    }

    return { invited, skipped };
  }
}
