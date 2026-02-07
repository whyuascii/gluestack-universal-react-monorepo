# @app/config

Centralized configuration for RBAC (Role-Based Access Control) and subscription management. This package serves as the single source of truth for authorization and entitlements across the application.

## Installation

```bash
pnpm add @app/config
```

## Overview

| Module           | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| **RBAC**         | Two-tier permission system for tenant/member roles |
| **Subscription** | Tier-based feature gating and entitlement checks   |

## Directory Structure

```
src/
├── index.ts              # Main exports
├── rbac/
│   └── index.ts          # Role-based access control
└── subscription/
    └── index.ts          # Subscription tier management
```

## Quick Reference

| Need                       | Package              |
| -------------------------- | -------------------- |
| API route contracts (oRPC) | `@app/core-contract` |
| Auth types and clients     | `@app/auth`          |
| RBAC (roles, permissions)  | `@app/config`        |
| Subscription tier features | `@app/config`        |

---

## RBAC (Role-Based Access Control)

A **two-tier permission system** that separates management roles from functional roles.

### Tier 1: Tenant Roles (Management Level)

Determines overall access level within a tenant.

| Role     | Description                                            | Bypass Member Role |
| -------- | ------------------------------------------------------ | ------------------ |
| `owner`  | Subscription purchaser, full control including billing | Yes                |
| `admin`  | Co-administrator, full feature access                  | Yes                |
| `member` | Regular user, access controlled by Member Role         | No                 |

### Tier 2: Member Roles (Functional Level)

Only applies when `tenantRole === "member"`. Owners and admins have full access automatically.

| Role          | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `editor`      | Full content CRUD - create, read, update, delete               |
| `viewer`      | Read-only access to content                                    |
| `contributor` | Can create and read, limited updates (default for new members) |
| `moderator`   | Can manage and moderate content created by others              |

### Resources

```typescript
tenant |
  member |
  invite |
  task |
  project |
  comment |
  file |
  settings |
  billing |
  analytics |
  audit_log;
```

### Actions

```typescript
create | read | update | delete | manage  // "manage" expands to all actions
```

### Permission Matrix

**Owners & Admins** have full `manage` access to all resources (except audit_log is read-only).

**Members by Role:**

| Resource  | Editor               | Viewer | Contributor          | Moderator            |
| --------- | -------------------- | ------ | -------------------- | -------------------- |
| tenant    | read                 | read   | read                 | read                 |
| member    | read                 | read   | read                 | read                 |
| invite    | -                    | -      | -                    | create, read         |
| task      | CRUD                 | read   | create, read, update | read, update, delete |
| project   | create, read, update | read   | read                 | read, update         |
| comment   | CRUD                 | read   | create, read, update | read, update, delete |
| file      | CRUD                 | read   | create, read         | read, delete         |
| settings  | read                 | read   | read                 | read                 |
| billing   | -                    | -      | -                    | -                    |
| analytics | read                 | -      | -                    | read                 |
| audit_log | -                    | -      | -                    | read                 |

### Usage

```typescript
import {
  // Primary permission check
  canAccess,
  isAdminOrOwner,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,

  // Role utilities
  isRoleAtLeast,
  getHighestRole,

  // Constants
  TENANT_ROLES,
  MEMBER_ROLES,
  RESOURCES,
  ACTIONS,
  DEFAULT_MEMBER_ROLE,

  // Type guards
  isValidRole,
  isValidMemberRole,
  isValidResource,
  isValidAction,

  // Types
  type TenantRole,
  type MemberRole,
  type Resource,
  type Action,
} from "@app/config";
```

### Core Functions

#### `canAccess(tenantRole, memberRole, resource, action)`

Primary permission check. Returns `true` if user can perform action.

```typescript
// Admin/owner have full access
canAccess("admin", null, "task", "delete"); // true
canAccess("owner", null, "billing", "manage"); // true

// Members checked against member role
canAccess("member", "editor", "task", "delete"); // true
canAccess("member", "viewer", "task", "delete"); // false
canAccess("member", "contributor", "task", "create"); // true
```

#### `isAdminOrOwner(tenantRole)`

Quick check for full access roles.

```typescript
if (isAdminOrOwner(user.tenantRole)) {
  // Can manage settings, billing, etc.
}
```

#### `hasAnyPermission(tenantRole, memberRole, resource, actions[])`

Check if user can perform ANY of the specified actions.

```typescript
if (hasAnyPermission("member", "contributor", "task", ["update", "delete"])) {
  // Can do at least one
}
```

#### `hasAllPermissions(tenantRole, memberRole, resource, actions[])`

Check if user can perform ALL of the specified actions.

```typescript
if (hasAllPermissions("member", "editor", "file", ["create", "delete"])) {
  // Can do both
}
```

#### `getPermissions(tenantRole, memberRole, resource)`

Get all allowed actions for a role on a resource.

```typescript
const actions = getPermissions("member", "editor", "task");
// ["create", "read", "update", "delete"]
```

#### `isRoleAtLeast(role, minimumRole)`

Check if role meets minimum level in hierarchy.

```typescript
isRoleAtLeast("admin", "member"); // true
isRoleAtLeast("member", "admin"); // false
isRoleAtLeast("owner", "owner"); // true
```

#### `getHighestRole(roles[])`

Find highest role from an array.

```typescript
getHighestRole(["member", "admin", "member"]); // "admin"
```

### UI Utilities

#### `getPermissionSummary(tenantRole, memberRole)`

Get all permissions for display in UI.

```typescript
const summary = getPermissionSummary("member", "editor");
// { task: ["create", "read", "update", "delete"], file: [...], ... }
```

#### `getRoleDescription(tenantRole, memberRole?)`

Human-readable role description.

```typescript
getRoleDescription("member", "editor");
// "Editor - Can create, edit, and delete content"
```

### Type Guards

```typescript
isValidRole("admin"); // true
isValidRole("superuser"); // false
isValidMemberRole("editor"); // true
isValidResource("task"); // true
isValidAction("delete"); // true
```

---

## Subscription Tiers

Feature gating based on subscription tier with grace period support.

### Tiers

| Tier         | Description                                  |
| ------------ | -------------------------------------------- |
| `free`       | Basic features, ads enabled, limited members |
| `pro`        | Full features, no ads, unlimited members     |
| `enterprise` | Pro features + SSO, audit logs, API access   |

### Feature Comparison

| Feature           | Free     | Pro       | Enterprise |
| ----------------- | -------- | --------- | ---------- |
| `adsEnabled`      | true     | false     | false      |
| `maxMembers`      | 5        | unlimited | unlimited  |
| `exportLimit`     | 10/month | unlimited | unlimited  |
| `bulkExport`      | false    | true      | true       |
| `prioritySupport` | false    | true      | true       |
| `analytics`       | false    | true      | true       |
| `sso`             | false    | false     | true       |
| `auditLogs`       | false    | false     | true       |
| `apiAccess`       | false    | false     | true       |

> **Note:** `-1` means unlimited for numeric features.

### Constants

```typescript
import {
  GRACE_PERIOD_DAYS, // 7 days
  FREE_TIER_ENTITLEMENTS,
  PRO_TIER_ENTITLEMENTS,
  ENTERPRISE_TIER_ENTITLEMENTS,
  SUBSCRIPTION_TIERS,
  TIER_FEATURES,
} from "@app/config";
```

### Usage

```typescript
import {
  // Tier checks
  requireEntitlement,
  requireFeature,
  hasActiveAccess,
  isFreeTier,
  isProOrHigher,

  // Feature limits
  getExportLimit,
  getMemberLimit,

  // Status checks
  isInGracePeriod,
  isCancelledButActive,
  getDaysUntilExpiry,

  // Feature checks
  hasFeature,
  getTierFeatures,
} from "@app/config";
```

### Core Functions

#### `requireEntitlement(entitlements, requiredTier)`

Throws `FORBIDDEN` if tenant doesn't have required tier.

```typescript
// In API route
requireEntitlement(entitlements, "pro"); // Throws if free tier
```

#### `requireFeature(entitlements, feature)`

Throws `FORBIDDEN` if feature is not available.

```typescript
requireFeature(entitlements, "bulkExport"); // Throws if not pro+
```

#### `hasActiveAccess(entitlements)`

Check if subscription is active (not expired/cancelled).

```typescript
if (hasActiveAccess(entitlements)) {
  // Subscription is valid
}
```

#### `isInGracePeriod(entitlements)`

Check if past_due but still has access (7-day grace).

```typescript
if (isInGracePeriod(entitlements)) {
  // Show warning: "Payment overdue, update billing info"
}
```

#### `isCancelledButActive(entitlements)`

Check if cancelled but still has access until period end.

```typescript
if (isCancelledButActive(entitlements)) {
  const days = getDaysUntilExpiry(entitlements);
  // Show: "Subscription ends in X days"
}
```

#### `getExportLimit(entitlements)` / `getMemberLimit(entitlements)`

Get numeric limits. Returns `-1` for unlimited.

```typescript
const exportLimit = getExportLimit(entitlements);
if (exportLimit !== -1 && currentExports >= exportLimit) {
  // Show upgrade prompt
}
```

### RBAC Tier Features

```typescript
import { hasFeature, getTierFeatures, TIER_FEATURES } from "@app/config";

// Check if tier has feature
hasFeature("pro", "analytics_dashboard"); // true
hasFeature("free", "analytics_dashboard"); // false

// Get all features for tier
getTierFeatures("pro");
// ["basic_tasks", "unlimited_tenants", "analytics_dashboard", ...]
```

### Subscription Status Handling

| Status     | Access           | Description               |
| ---------- | ---------------- | ------------------------- |
| `active`   | Full             | Normal subscription       |
| `trialing` | Full             | Trial period              |
| `past_due` | Grace (7 days)   | Payment failed            |
| `canceled` | Until period end | `cancelAtPeriodEnd: true` |
| `expired`  | None             | Reverts to free tier      |
| `paused`   | None             | Subscription paused       |

---

## Middleware Usage

### RBAC Middleware (API Routes)

```typescript
import { createRBACMiddleware } from "@app/api/middleware";

// In oRPC route
const deleteTask = os.tasks.delete
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(createRBACMiddleware("task", "delete")) // Throws FORBIDDEN if not allowed
  .handler(({ input, context }) => {
    // User has permission
  });
```

### Feature Gate Middleware

```typescript
import { requireFeature } from "@app/config";

const bulkExport = os.exports.bulk
  .use(authMiddleware)
  .use(tenantMiddleware)
  .use(async ({ context, next }) => {
    requireFeature(context.entitlements, "bulkExport");
    return next();
  })
  .handler(({ input }) => {
    // User has pro+ subscription
  });
```

---

## Adding New Roles/Resources

Edit `src/rbac/index.ts`:

### Add a Resource

```typescript
// 1. Add to RESOURCES constant
export const RESOURCES = {
  // ... existing
  REPORT: "report",
} as const;

// 2. Add permissions to ADMIN_PERMISSIONS
[RESOURCES.REPORT]: [ACTIONS.MANAGE],

// 3. Add to MEMBER_PERMISSIONS for each role
[MEMBER_ROLES.EDITOR]: {
  // ... existing
  [RESOURCES.REPORT]: [ACTIONS.CREATE, ACTIONS.READ],
},
```

### Add a Member Role

```typescript
// 1. Add to MEMBER_ROLES constant
export const MEMBER_ROLES = {
  // ... existing
  ANALYST: "analyst",
} as const;

// 2. Add permissions matrix
[MEMBER_ROLES.ANALYST]: {
  [RESOURCES.ANALYTICS]: [ACTIONS.READ, ACTIONS.CREATE],
  [RESOURCES.REPORT]: [ACTIONS.MANAGE],
  // ... other resources
},
```

---

## Types

```typescript
type TenantRole = "owner" | "admin" | "member";
type MemberRole = "editor" | "viewer" | "contributor" | "moderator";
type Resource =
  | "tenant"
  | "member"
  | "invite"
  | "task"
  | "project"
  | "comment"
  | "file"
  | "settings"
  | "billing"
  | "analytics"
  | "audit_log";
type Action = "create" | "read" | "update" | "delete" | "manage";
type SubscriptionTier = "free" | "pro" | "enterprise";
```

---

## Package Architecture

```
@app/core-contract  →  oRPC API schemas (input/output types)
        ↓
@app/config         →  RBAC rules, subscription tiers
        ↓
@app/auth           →  Better Auth config, clients
        ↓
@app/ui             →  Screens, hooks using permissions
```
