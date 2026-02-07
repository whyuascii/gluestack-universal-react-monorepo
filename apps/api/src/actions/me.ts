import { db, tenantMembers, tenantInvites, user, eq, and } from "@app/database";
import { throwError } from "../lib/errors";
import type { AuthContext } from "../middleware";
import type { SupportedLanguage } from "@app/core-contract";

interface GetMeInput {
  invite?: string;
}

interface SwitchTenantInput {
  tenantId: string;
}

export class MeActions {
  static async get(input: GetMeInput | undefined, context: AuthContext) {
    const { user, session } = context;

    // Fetch user's tenant memberships
    const memberships = await db.query.tenantMembers.findMany({
      where: eq(tenantMembers.userId, user.id),
      with: {
        tenant: true,
      },
    });

    // Build tenant context
    const tenantContext = {
      activeTenantId: user.activeTenantId || null,
      memberships: memberships.map((m) => ({
        tenantId: m.tenantId,
        tenantName: m.tenant.name,
        role: m.role as "owner" | "admin" | "member",
        joinedAt: m.joinedAt,
      })),
    };

    // Check for pending invite
    let pendingInvite: { token: string; tenantName: string; inviterName: string } | undefined;
    const inviteToken = input?.invite;

    if (inviteToken) {
      const invite = await db.query.tenantInvites.findFirst({
        where: and(eq(tenantInvites.token, inviteToken), eq(tenantInvites.status, "pending")),
        with: {
          tenant: true,
          inviter: true,
        },
      });

      if (invite && new Date(invite.expiresAt) > new Date()) {
        pendingInvite = {
          token: invite.token,
          tenantName: invite.tenant.name,
          inviterName: invite.inviter.name,
        };
      }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        preferredLanguage: (user.preferredLanguage as SupportedLanguage) || undefined,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
      tenantContext,
      pendingInvite,
    };
  }

  static async switchTenant(input: SwitchTenantInput, context: AuthContext) {
    const currentUser = context.user;
    const { tenantId } = input;

    // Verify user is a member of the tenant
    const membership = await db.query.tenantMembers.findFirst({
      where: and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.userId, currentUser.id)),
    });

    if (!membership) {
      throwError("FORBIDDEN", "You are not a member of this group");
    }

    // Update user's active tenant
    await db.update(user).set({ activeTenantId: tenantId }).where(eq(user.id, currentUser.id));

    return {
      activeTenantId: tenantId,
    };
  }
}
