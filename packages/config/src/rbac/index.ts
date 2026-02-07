/**
 * RBAC (Role-Based Access Control) Configuration
 *
 * ============================================================================
 * SINGLE SOURCE OF TRUTH FOR ALL ROLES AND PERMISSIONS
 * ============================================================================
 *
 * This file defines the complete authorization model for the application.
 * Edit this file to add new roles, resources, or permissions.
 *
 * KEY CONCEPTS:
 *
 * 1. TENANT ROLES (Management Level)
 *    - owner: Subscription purchaser, full control, can delete tenant
 *    - admin: Co-administrators, full feature access, can manage members
 *    - member: Basic users, access controlled by their MEMBER ROLE
 *
 * 2. MEMBER ROLES (Functional Level - for members only)
 *    - editor: Can create, read, update content
 *    - viewer: Read-only access
 *    - contributor: Can create and read, limited updates
 *    - moderator: Can manage content created by others
 *
 * 3. RESOURCES (What can be accessed)
 *    - tenant, member, invite, task, project, comment, file, settings, billing, analytics
 *
 * 4. ACTIONS (What can be done)
 *    - create, read, update, delete, manage (full control)
 *
 * AUTHORIZATION FLOW:
 *    1. Check tenant role (owner/admin = full access, skip to step 4)
 *    2. If member, check member role permissions
 *    3. Check resource + action against permission matrix
 *    4. Allow or deny
 *
 * @example
 * // In middleware
 * import { canAccess, RESOURCES, ACTIONS } from "@app/config";
 * if (!canAccess(userTenantRole, userMemberRole, "task", "create")) {
 *   throw new ForbiddenError();
 * }
 */

// =============================================================================
// SECTION 1: TENANT ROLES (Management Level)
// =============================================================================
// These roles determine overall access level within a tenant.
// Owner and Admin have FULL ACCESS to all features.
// Members have access based on their assigned member role.

export const TENANT_ROLES = {
  /** Subscription purchaser - full control including billing and deletion */
  OWNER: "owner",
  /** Co-administrator - full feature access, can manage members */
  ADMIN: "admin",
  /** Regular member - access controlled by member role */
  MEMBER: "member",
} as const;

export type TenantRole = (typeof TENANT_ROLES)[keyof typeof TENANT_ROLES];

/** Tenant role hierarchy - higher index = more permissions */
export const TENANT_ROLE_HIERARCHY: TenantRole[] = ["member", "admin", "owner"];

// Legacy export for backward compatibility
export const ROLES = TENANT_ROLES;
export type Role = TenantRole;
export const ROLE_HIERARCHY = TENANT_ROLE_HIERARCHY;

// =============================================================================
// SECTION 2: MEMBER ROLES (Functional Level)
// =============================================================================
// These roles define what a MEMBER can do within the application.
// Only applies when tenant role is "member".
// Owners and Admins bypass these checks (they have full access).

export const MEMBER_ROLES = {
  /** Can create, read, update most content */
  EDITOR: "editor",
  /** Read-only access to content */
  VIEWER: "viewer",
  /** Can create and read, limited update capabilities */
  CONTRIBUTOR: "contributor",
  /** Can manage/moderate content created by others */
  MODERATOR: "moderator",
} as const;

export type MemberRole = (typeof MEMBER_ROLES)[keyof typeof MEMBER_ROLES];

/** Default member role for new members */
export const DEFAULT_MEMBER_ROLE: MemberRole = "contributor";

// =============================================================================
// SECTION 3: RESOURCES (What can be accessed)
// =============================================================================
// Add new resources here when adding new features.

export const RESOURCES = {
  // Tenant Management
  TENANT: "tenant",
  MEMBER: "member",
  INVITE: "invite",

  // Core Features
  TASK: "task",
  PROJECT: "project",
  COMMENT: "comment",
  FILE: "file",

  // Settings & Admin
  SETTINGS: "settings",
  BILLING: "billing",
  ANALYTICS: "analytics",
  AUDIT_LOG: "audit_log",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

// =============================================================================
// SECTION 4: ACTIONS (What can be done)
// =============================================================================

export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  /** Full control - grants all actions */
  MANAGE: "manage",
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

// =============================================================================
// SECTION 5: PERMISSION MATRICES
// =============================================================================

/**
 * ADMIN PERMISSIONS
 *
 * Owners and Admins have FULL ACCESS to everything.
 * This matrix defines exactly what "full access" means per resource.
 * Both owner and admin use this same permission set.
 */
export const ADMIN_PERMISSIONS: Record<Resource, Action[]> = {
  // Tenant Management - full control
  tenant: ["manage"],
  member: ["manage"],
  invite: ["manage"],

  // Core Features - full control
  task: ["manage"],
  project: ["manage"],
  comment: ["manage"],
  file: ["manage"],

  // Settings & Admin - full control
  settings: ["manage"],
  billing: ["manage"], // Only owner can actually modify, but admin can view
  analytics: ["manage"],
  audit_log: ["read"], // Audit logs are read-only for everyone
};

/**
 * MEMBER ROLE PERMISSIONS
 *
 * Defines what each member role can do on each resource.
 * Only checked when tenant role is "member".
 *
 * TO ADD A NEW MEMBER ROLE:
 * 1. Add the role to MEMBER_ROLES above
 * 2. Add the role's permissions here
 * 3. Update documentation
 */
export const MEMBER_PERMISSIONS: Record<MemberRole, Record<Resource, Action[]>> = {
  // -------------------------------------------------------------------------
  // EDITOR: Can create, read, update most content
  // -------------------------------------------------------------------------
  editor: {
    tenant: ["read"],
    member: ["read"],
    invite: [], // Cannot invite (admin only)

    task: ["create", "read", "update", "delete"], // Full task access
    project: ["create", "read", "update"], // Can create/edit projects
    comment: ["create", "read", "update", "delete"], // Full comment access
    file: ["create", "read", "update", "delete"], // Full file access

    settings: ["read"],
    billing: [], // No billing access
    analytics: ["read"], // Can view analytics
    audit_log: [],
  },

  // -------------------------------------------------------------------------
  // VIEWER: Read-only access
  // -------------------------------------------------------------------------
  viewer: {
    tenant: ["read"],
    member: ["read"],
    invite: [],

    task: ["read"],
    project: ["read"],
    comment: ["read"],
    file: ["read"],

    settings: ["read"],
    billing: [],
    analytics: [],
    audit_log: [],
  },

  // -------------------------------------------------------------------------
  // CONTRIBUTOR: Can create and read, limited updates
  // -------------------------------------------------------------------------
  contributor: {
    tenant: ["read"],
    member: ["read"],
    invite: [],

    task: ["create", "read", "update"], // Can create/update own tasks
    project: ["read"], // Can view projects only
    comment: ["create", "read", "update"], // Can comment
    file: ["create", "read"], // Can upload and view files

    settings: ["read"],
    billing: [],
    analytics: [],
    audit_log: [],
  },

  // -------------------------------------------------------------------------
  // MODERATOR: Can manage content created by others
  // -------------------------------------------------------------------------
  moderator: {
    tenant: ["read"],
    member: ["read"],
    invite: ["create", "read"], // Can send invites

    task: ["read", "update", "delete"], // Can moderate tasks
    project: ["read", "update"], // Can moderate projects
    comment: ["read", "update", "delete"], // Can moderate comments
    file: ["read", "delete"], // Can remove files

    settings: ["read"],
    billing: [],
    analytics: ["read"],
    audit_log: ["read"], // Can view audit logs
  },
};

// Legacy export for backward compatibility
export const PERMISSION_MATRIX: Record<TenantRole, Record<Resource, Action[]>> = {
  owner: ADMIN_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  member: MEMBER_PERMISSIONS.contributor, // Default member permissions
};

// =============================================================================
// SECTION 6: PERMISSION CHECKING FUNCTIONS
// =============================================================================

/**
 * Check if a user can access a resource with a specific action.
 *
 * This is the PRIMARY function for authorization checks.
 *
 * @param tenantRole - The user's role in the tenant (owner/admin/member)
 * @param memberRole - The user's member role (only used if tenantRole is "member")
 * @param resource - The resource being accessed
 * @param action - The action being performed
 * @returns true if access is allowed
 *
 * @example
 * // Admin always has access
 * canAccess("admin", null, "task", "delete") // true
 *
 * // Member access depends on member role
 * canAccess("member", "viewer", "task", "delete") // false
 * canAccess("member", "editor", "task", "delete") // true
 */
export function canAccess(
  tenantRole: TenantRole,
  memberRole: MemberRole | null | undefined,
  resource: Resource,
  action: Action
): boolean {
  // Owners and Admins have full access
  if (tenantRole === "owner" || tenantRole === "admin") {
    return checkPermissions(ADMIN_PERMISSIONS[resource], action);
  }

  // Members need a member role
  if (!memberRole || !isValidMemberRole(memberRole)) {
    return false;
  }

  // Check member role permissions
  const permissions = MEMBER_PERMISSIONS[memberRole]?.[resource] || [];
  return checkPermissions(permissions, action);
}

/**
 * Legacy function - Check permission using only tenant role.
 * For backward compatibility. Prefer canAccess() for new code.
 */
export function hasPermission(role: TenantRole, resource: Resource, action: Action): boolean {
  // For owner/admin, use admin permissions
  if (role === "owner" || role === "admin") {
    return checkPermissions(ADMIN_PERMISSIONS[resource], action);
  }

  // For member, use default contributor permissions
  return checkPermissions(MEMBER_PERMISSIONS.contributor[resource], action);
}

/**
 * Check if permissions array includes the action (or "manage")
 */
function checkPermissions(permissions: Action[] | undefined, action: Action): boolean {
  if (!permissions) return false;
  if (permissions.includes("manage")) return true;
  return permissions.includes(action);
}

/**
 * Check if a role can perform any of the given actions
 */
export function hasAnyPermission(
  tenantRole: TenantRole,
  memberRole: MemberRole | null,
  resource: Resource,
  actions: Action[]
): boolean {
  return actions.some((action) => canAccess(tenantRole, memberRole, resource, action));
}

/**
 * Check if a role can perform all of the given actions
 */
export function hasAllPermissions(
  tenantRole: TenantRole,
  memberRole: MemberRole | null,
  resource: Resource,
  actions: Action[]
): boolean {
  return actions.every((action) => canAccess(tenantRole, memberRole, resource, action));
}

/**
 * Get all permissions for a role on a resource
 */
export function getPermissions(
  tenantRole: TenantRole,
  memberRole: MemberRole | null,
  resource: Resource
): Action[] {
  if (tenantRole === "owner" || tenantRole === "admin") {
    return expandPermissions(ADMIN_PERMISSIONS[resource]);
  }

  if (!memberRole) return [];
  return expandPermissions(MEMBER_PERMISSIONS[memberRole]?.[resource]);
}

/**
 * Expand "manage" to all actions
 */
function expandPermissions(permissions: Action[] | undefined): Action[] {
  if (!permissions) return [];
  if (permissions.includes("manage")) {
    return ["create", "read", "update", "delete", "manage"];
  }
  return [...permissions];
}

/**
 * Check if tenant role meets minimum level
 */
export function isRoleAtLeast(role: TenantRole, minimumRole: TenantRole): boolean {
  const roleIndex = TENANT_ROLE_HIERARCHY.indexOf(role);
  const minIndex = TENANT_ROLE_HIERARCHY.indexOf(minimumRole);
  return roleIndex >= minIndex;
}

/**
 * Check if user is admin or owner (has full access)
 */
export function isAdminOrOwner(tenantRole: TenantRole): boolean {
  return tenantRole === "owner" || tenantRole === "admin";
}

/**
 * Get the highest role from an array
 */
export function getHighestRole(roles: TenantRole[]): TenantRole | null {
  if (roles.length === 0) return null;
  return roles.reduce((highest, role) => {
    return isRoleAtLeast(role, highest) ? role : highest;
  }, roles[0]);
}

// =============================================================================
// SECTION 7: SUBSCRIPTION TIERS & FEATURES
// =============================================================================

export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS];

/**
 * Features available per subscription tier.
 * Used by feature flag middleware to gate premium features.
 */
export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ["basic_tasks", "single_tenant", "email_notifications", "max_5_members"],
  pro: [
    "basic_tasks",
    "unlimited_tenants",
    "unlimited_members",
    "email_notifications",
    "push_notifications",
    "analytics_dashboard",
    "file_uploads",
    "custom_themes",
    "priority_support",
  ],
  enterprise: [
    "basic_tasks",
    "unlimited_tenants",
    "unlimited_members",
    "email_notifications",
    "push_notifications",
    "analytics_dashboard",
    "file_uploads",
    "custom_themes",
    "priority_support",
    "sso",
    "audit_logs",
    "api_access",
    "dedicated_support",
    "custom_integrations",
    "advanced_permissions",
  ],
};

export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  return TIER_FEATURES[tier]?.includes(feature) ?? false;
}

export function getTierFeatures(tier: SubscriptionTier): string[] {
  return TIER_FEATURES[tier] || [];
}

// =============================================================================
// SECTION 8: TYPE GUARDS & VALIDATION
// =============================================================================

export function isValidRole(role: string): role is TenantRole {
  return Object.values(TENANT_ROLES).includes(role as TenantRole);
}

export function isValidMemberRole(role: string): role is MemberRole {
  return Object.values(MEMBER_ROLES).includes(role as MemberRole);
}

export function isValidResource(resource: string): resource is Resource {
  return Object.values(RESOURCES).includes(resource as Resource);
}

export function isValidAction(action: string): action is Action {
  return Object.values(ACTIONS).includes(action as Action);
}

export function isValidTier(tier: string): tier is SubscriptionTier {
  return Object.values(SUBSCRIPTION_TIERS).includes(tier as SubscriptionTier);
}

// =============================================================================
// SECTION 9: PERMISSION SUMMARY (for UI/debugging)
// =============================================================================

/**
 * Get a summary of all permissions for a user.
 * Useful for displaying in UI or debugging.
 */
export function getPermissionSummary(
  tenantRole: TenantRole,
  memberRole: MemberRole | null
): Record<Resource, Action[]> {
  const summary: Partial<Record<Resource, Action[]>> = {};

  for (const resource of Object.values(RESOURCES)) {
    summary[resource] = getPermissions(tenantRole, memberRole, resource);
  }

  return summary as Record<Resource, Action[]>;
}

/**
 * Get human-readable role description
 */
export function getRoleDescription(tenantRole: TenantRole, memberRole?: MemberRole | null): string {
  if (tenantRole === "owner") {
    return "Owner - Full control including billing and tenant deletion";
  }
  if (tenantRole === "admin") {
    return "Admin - Full feature access, can manage members";
  }

  // Member with role
  switch (memberRole) {
    case "editor":
      return "Editor - Can create, edit, and delete content";
    case "viewer":
      return "Viewer - Read-only access";
    case "contributor":
      return "Contributor - Can create content and comment";
    case "moderator":
      return "Moderator - Can manage and moderate content";
    default:
      return "Member - Limited access";
  }
}
