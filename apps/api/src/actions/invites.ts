import { db, tenantInvites, tenantMembers, eq, and } from "@app/database";
import { throwError } from "../lib/errors";
import { emit } from "../lib/events";
import type { AuthContext } from "../middleware";

interface GetDetailsInput {
  token: string;
}

interface AcceptInput {
  token: string;
}

export class InviteActions {
  static async getDetails(input: GetDetailsInput) {
    const invite = await db.query.tenantInvites.findFirst({
      where: and(eq(tenantInvites.token, input.token), eq(tenantInvites.status, "pending")),
      with: {
        tenant: true,
        inviter: true,
      },
    });

    if (!invite || new Date(invite.expiresAt) < new Date()) {
      throwError("NOT_FOUND", "errors:notFound.invite");
    }

    // invite is guaranteed to exist here due to throwError above
    return {
      token: invite!.token,
      tenantName: invite!.tenant.name,
      inviterName: invite!.inviter.name,
      email: invite!.email,
      expiresAt: invite!.expiresAt,
    };
  }

  static async accept(input: AcceptInput, context: AuthContext) {
    const currentUser = context.user;

    const invite = await db.query.tenantInvites.findFirst({
      where: and(eq(tenantInvites.token, input.token), eq(tenantInvites.status, "pending")),
      with: {
        tenant: true,
      },
    });

    if (!invite || new Date(invite.expiresAt) < new Date()) {
      throwError("NOT_FOUND", "errors:notFound.invite");
    }

    // Check if already a member
    const existingMember = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.tenantId, invite.tenantId),
        eq(tenantMembers.userId, currentUser.id)
      ),
    });

    if (existingMember) {
      throwError("CONFLICT", "errors:conflict.alreadyMember");
    }

    // Add as member
    await db.insert(tenantMembers).values({
      tenantId: invite.tenantId,
      userId: currentUser.id,
      role: "member",
    });

    // Mark invite as accepted
    await db
      .update(tenantInvites)
      .set({ status: "accepted" })
      .where(eq(tenantInvites.id, invite.id));

    // Emit invite.accepted event for notifications
    emit("invite.accepted", {
      userId: currentUser.id,
      userName: currentUser.name,
      tenantId: invite.tenantId,
      tenantName: invite.tenant.name,
      inviterUserId: invite.invitedBy,
    });

    return {
      tenantId: invite.tenantId,
      tenantName: invite.tenant.name,
    };
  }
}
