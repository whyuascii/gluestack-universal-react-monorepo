# Config (packages/config)

RBAC permissions, subscription tiers, and shared constants.

## RBAC

Two-tier permission system:

- **Tier 1 - Tenant Roles:** `owner`, `admin`, `member`
- **Tier 2 - Member Roles:** `editor`, `viewer`, `contributor`, `moderator`

```typescript
import { canAccess, isAdminOrOwner } from "@app/config";

if (canAccess(tenantRole, memberRole, "task", "delete")) {
  /* allowed */
}
if (isAdminOrOwner(tenantRole)) {
  /* manage settings */
}
```

**Resources:** `tenant`, `member`, `invite`, `task`, `project`, `comment`, `file`, `settings`, `billing`, `analytics`, `audit_log`
**Actions:** `create`, `read`, `update`, `delete`, `manage`

## Subscription Tiers

| Feature       | Free     | Pro       | Enterprise |
| ------------- | -------- | --------- | ---------- |
| `adsEnabled`  | true     | false     | false      |
| `maxMembers`  | 5        | unlimited | unlimited  |
| `exportLimit` | 10/month | unlimited | unlimited  |
| `bulkExport`  | false    | true      | true       |
| `sso`         | false    | false     | true       |
| `auditLogs`   | false    | false     | true       |

```typescript
import { requireFeature, getMemberLimit } from "@app/config";

requireFeature(entitlements, "bulkExport"); // Throws if not allowed
const limit = getMemberLimit(entitlements); // -1 = unlimited
```
