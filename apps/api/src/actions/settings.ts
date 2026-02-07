import {
  db,
  tenants,
  tenantMembers,
  user,
  eq,
  NotificationPreferencesQueries,
  SettingsMemberQueries,
  TenantMemberQueries,
  TenantQueries,
} from "@app/database";
import { throwError } from "../lib/errors";
import type { AuthContext, TenantContext } from "../middleware";
import type {
  UpdateNotificationPreferencesInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  UpdateTenantInput,
  UpdateLanguagePreferenceInput,
} from "@app/core-contract";

export class SettingsActions {
  // ============================================================================
  // Language Preference (user-scoped)
  // ============================================================================

  /**
   * Update user's preferred language
   */
  static async updateLanguagePreference(
    input: UpdateLanguagePreferenceInput,
    context: AuthContext
  ) {
    const currentUser = context.user;

    await db
      .update(user)
      .set({ preferredLanguage: input.language })
      .where(eq(user.id, currentUser.id));

    return { language: input.language };
  }

  // ============================================================================
  // Notification Preferences (user-scoped)
  // ============================================================================

  /**
   * Get notification preferences for the current user
   */
  static async getNotificationPreferences(context: AuthContext) {
    const currentUser = context.user;

    const preferences = await NotificationPreferencesQueries.findByUserId(currentUser.id);

    if (!preferences) {
      return null;
    }

    return {
      id: preferences.id,
      inAppEnabled: preferences.inAppEnabled,
      pushEnabled: preferences.pushEnabled,
      emailEnabled: preferences.emailEnabled,
      marketingEmailEnabled: preferences.marketingEmailEnabled,
    };
  }

  /**
   * Update notification preferences for the current user
   */
  static async updateNotificationPreferences(
    input: UpdateNotificationPreferencesInput,
    context: AuthContext
  ) {
    const currentUser = context.user;

    const preferences = await NotificationPreferencesQueries.upsertForUser(currentUser.id, {
      inAppEnabled: input.inAppEnabled,
      pushEnabled: input.pushEnabled,
      emailEnabled: input.emailEnabled,
      marketingEmailEnabled: input.marketingEmailEnabled,
    });

    return {
      id: preferences.id,
      inAppEnabled: preferences.inAppEnabled,
      pushEnabled: preferences.pushEnabled,
      emailEnabled: preferences.emailEnabled,
      marketingEmailEnabled: preferences.marketingEmailEnabled,
    };
  }

  // ============================================================================
  // Member Management (tenant-scoped)
  // ============================================================================

  /**
   * Get all members of the current tenant
   */
  static async getMembers(context: TenantContext) {
    const members = await SettingsMemberQueries.getMembersWithUserDetails(context.tenant.id);

    return {
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.userName,
        email: m.userEmail,
        role: m.role as "owner" | "admin" | "member",
        joinedAt: m.joinedAt,
        image: m.userImage,
      })),
      currentUserRole: context.membership.role as "owner" | "admin" | "member",
    };
  }

  /**
   * Update a member's role
   * - Only owner/admin can change roles
   * - Cannot promote to owner (ownership transfer is separate)
   * - Cannot change your own role
   */
  static async updateMemberRole(input: UpdateMemberRoleInput, context: TenantContext) {
    const { memberId, role } = input;
    const currentUser = context.user;

    // Find the target member
    const targetMember = await db.query.tenantMembers.findFirst({
      where: eq(tenantMembers.id, memberId),
    });

    if (!targetMember) {
      throwError("NOT_FOUND", "errors:notFound.member");
    }

    // Verify target is in the same tenant
    if (targetMember.tenantId !== context.tenant.id) {
      throwError("NOT_FOUND", "errors:notFound.member");
    }

    // Cannot change your own role
    if (targetMember.userId === currentUser.id) {
      throwError("BAD_REQUEST", "settings:members.errors.cannotChangeOwnRole");
    }

    // Cannot demote an owner (only owner can demote other owners)
    if (targetMember.role === "owner" && context.membership.role !== "owner") {
      throwError("FORBIDDEN", "errors:forbidden.noPermission");
    }

    // Update the role
    await TenantMemberQueries.update(memberId, { role });

    return { success: true };
  }

  /**
   * Remove a member from the tenant
   * - Only owner/admin can remove members
   * - Cannot remove yourself (use leaveGroup)
   * - Cannot remove the last owner
   */
  static async removeMember(input: RemoveMemberInput, context: TenantContext) {
    const { memberId } = input;
    const currentUser = context.user;

    // Find the target member
    const targetMember = await db.query.tenantMembers.findFirst({
      where: eq(tenantMembers.id, memberId),
    });

    if (!targetMember) {
      throwError("NOT_FOUND", "errors:notFound.member");
    }

    // Verify target is in the same tenant
    if (targetMember.tenantId !== context.tenant.id) {
      throwError("NOT_FOUND", "errors:notFound.member");
    }

    // Cannot remove yourself
    if (targetMember.userId === currentUser.id) {
      throwError("BAD_REQUEST", "settings:members.errors.cannotRemoveSelf");
    }

    // Cannot remove an owner if you're not an owner
    if (targetMember.role === "owner" && context.membership.role !== "owner") {
      throwError("FORBIDDEN", "settings:members.errors.cannotRemoveOwner");
    }

    // Check if this is the last owner
    if (targetMember.role === "owner") {
      const ownerCount = await SettingsMemberQueries.countOwners(context.tenant.id);
      if (ownerCount <= 1) {
        throwError("BAD_REQUEST", "settings:members.errors.lastOwner");
      }
    }

    // Remove the member
    await TenantMemberQueries.delete(memberId);

    return { success: true };
  }

  // ============================================================================
  // Tenant/Group Settings (tenant-scoped)
  // ============================================================================

  /**
   * Update tenant name
   * - Only owner/admin can rename
   */
  static async updateTenant(input: UpdateTenantInput, context: TenantContext) {
    const { name } = input;

    const updatedTenant = await TenantQueries.update(context.tenant.id, { name });

    return {
      id: updatedTenant.id,
      name: updatedTenant.name,
    };
  }

  /**
   * Leave the current tenant/group
   * - Anyone can leave except the sole owner
   * - Owner must transfer ownership or delete group first
   */
  static async leaveGroup(context: TenantContext) {
    const currentUser = context.user;

    // Check if user is the only owner
    if (context.membership.role === "owner") {
      const ownerCount = await SettingsMemberQueries.countOwners(context.tenant.id);
      if (ownerCount <= 1) {
        throwError("BAD_REQUEST", "settings:group.leaveGroup.ownerWarning");
      }
    }

    // Remove user from tenant
    await TenantMemberQueries.delete(context.membership.id);

    // If this was the active tenant, clear it
    if (currentUser.activeTenantId === context.tenant.id) {
      // Find another tenant the user is a member of
      const otherMemberships = await TenantMemberQueries.findByUserId(currentUser.id);

      await db
        .update(user)
        .set({
          activeTenantId: otherMemberships.length > 0 ? otherMemberships[0].tenantId : null,
        })
        .where(eq(user.id, currentUser.id));
    }

    return { success: true };
  }
}
