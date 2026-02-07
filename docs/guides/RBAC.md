# Role-Based Access Control (RBAC) Guide

This guide explains how permissions and roles work in the multi-tenant app (web & mobile) and the internal admin portal.

## Overview

The system has two completely separate authorization systems:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Authorization Systems                         │
├─────────────────────────────────┬───────────────────────────────────┤
│     Multi-Tenant App (User)     │     Admin Portal (Internal)       │
│    ─────────────────────────    │    ───────────────────────────    │
│    Web App + Mobile App         │    Internal Dashboard              │
│    localhost:3000 / :8081       │    localhost:3001                  │
│                                 │                                    │
│    Two-tier role system:        │    Single-tier role system:        │
│    • Tenant Role (management)   │    • Admin Role                    │
│    • Member Role (functional)   │      - read_only                   │
│                                 │      - support_rw                  │
│    Stored in: tenant_members    │      - super_admin                 │
│                                 │                                    │
│                                 │    Stored in: user.adminRole       │
└─────────────────────────────────┴───────────────────────────────────┘
```

---

## Part 1: Multi-Tenant App RBAC

### Concept: Two-Tier Roles

Every user in a tenant has **two roles** that work together:

```
┌──────────────────────────────────────────────────────────────────┐
│                     User in Tenant                                │
│                                                                   │
│   ┌─────────────────────┐     ┌─────────────────────────────┐    │
│   │    TENANT ROLE      │     │       MEMBER ROLE           │    │
│   │   (Management)      │     │      (Functional)           │    │
│   │                     │     │                             │    │
│   │   owner             │     │   editor                    │    │
│   │   admin             │     │   viewer                    │    │
│   │   member ──────────────────── contributor (default)     │    │
│   │                     │     │   moderator                 │    │
│   └─────────────────────┘     └─────────────────────────────┘    │
│                                                                   │
│   If owner/admin → bypass member role checks (full access)        │
│   If member → check member role for permissions                   │
└──────────────────────────────────────────────────────────────────┘
```

### Role Hierarchy

```
                    TENANT ROLES                    MEMBER ROLES
                    ────────────                    ────────────

                      ┌───────┐
                      │ owner │ ◄── Subscription purchaser
                      └───┬───┘     Full control + billing
                          │
                      ┌───▼───┐
                      │ admin │ ◄── Co-administrator
                      └───┬───┘     Full features, no billing
                          │
                      ┌───▼────┐        ┌──────────┐
                      │ member │────────│  editor  │ ◄── Full CRUD
                      └────────┘        └────┬─────┘
                          │                  │
                          │             ┌────▼──────┐
                          │             │ moderator │ ◄── Manage content
                          │             └────┬──────┘
                          │                  │
                          │             ┌────▼───────┐
                          └─────────────│contributor │ ◄── Create & read (default)
                                        └────┬───────┘
                                             │
                                        ┌────▼───┐
                                        │ viewer │ ◄── Read only
                                        └────────┘
```

### Database Schema

```sql
-- tenant_members table
┌─────────────────────────────────────────────────────────────────┐
│                      tenant_members                              │
├─────────────┬──────────┬─────────────────────────────────────────┤
│ Column      │ Type     │ Description                             │
├─────────────┼──────────┼─────────────────────────────────────────┤
│ id          │ text     │ Primary key                             │
│ tenant_id   │ text     │ FK → tenants.id                         │
│ user_id     │ text     │ FK → user.id                            │
│ role        │ text     │ "owner" | "admin" | "member"            │
│ member_role │ text     │ "editor" | "viewer" | "contributor" |   │
│             │          │ "moderator" (only used if role=member)  │
│ joined_at   │ timestamp│ When user joined                        │
│ updated_at  │ timestamp│ Last role change                        │
└─────────────┴──────────┴─────────────────────────────────────────┘
```

### Permission Matrix

Resources and what each role can do:

| Resource  | Owner/Admin | Editor | Viewer | Contributor        | Moderator          |
| --------- | ----------- | ------ | ------ | ------------------ | ------------------ |
| tenant    | manage      | read   | read   | read               | read               |
| member    | manage      | read   | read   | read               | read               |
| invite    | manage      | -      | -      | -                  | create/read        |
| task      | manage      | CRUD   | read   | create/read/update | read/update/delete |
| project   | manage      | CRUD   | read   | read               | read/update        |
| comment   | manage      | CRUD   | read   | create/read/update | read/update/delete |
| file      | manage      | CRUD   | read   | create/read        | read/delete        |
| settings  | manage      | read   | read   | read               | read               |
| billing   | manage      | -      | -      | -                  | -                  |
| analytics | manage      | read   | -      | -                  | read               |
| audit_log | read        | -      | -      | -                  | read               |

> **Note:** `manage` = all actions (create, read, update, delete)

### Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        API Request Flow                                  │
└─────────────────────────────────────────────────────────────────────────┘

    Request: POST /rpc/private/todos/create
                    │
                    ▼
    ┌───────────────────────────────┐
    │      1. authMiddleware        │  Verify user is logged in
    │                               │  → Adds context.user
    └───────────────┬───────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │     2. tenantMiddleware       │  Verify user belongs to tenant
    │                               │  → Adds context.membership
    │                               │  → Adds context.tenant
    └───────────────┬───────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │  3. createRBACMiddleware()    │  Check: canAccess("task", "create")
    │     ("task", "create")        │
    │                               │  If tenantRole = owner/admin → pass
    │                               │  If tenantRole = member → check memberRole
    └───────────────┬───────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │         4. Handler            │  Execute business logic
    │                               │  (user has permission)
    └───────────────────────────────┘
```

### Code Examples

**Route with permission check:**

```typescript
// apps/api/src/orpc-routes/private/index.ts
const createTodo = os.private.todos.create
  .use(authMiddleware) // 1. Must be logged in
  .use(tenantMiddleware) // 2. Must belong to tenant
  .use(createRBACMiddleware("task", "create")) // 3. Must have permission
  .handler(async ({ input, context }) => {
    // context.user - authenticated user
    // context.membership.tenantRole - "owner" | "admin" | "member"
    // context.membership.memberRole - "editor" | "viewer" | etc
    // context.tenant - current tenant info
    return TodoActions.create(input, context);
  });
```

**Using the permission function directly:**

```typescript
import { canAccess } from "@app/config";

// Check if user can delete a task
const hasPermission = canAccess(
  context.membership.tenantRole, // "owner" | "admin" | "member"
  context.membership.memberRole, // "editor" | "viewer" | etc
  "task", // resource
  "delete" // action
);

if (hasPermission) {
  // Show delete button
}
```

**Helper functions:**

```typescript
import { canAccess, isAdminOrOwner, hasAnyPermission, getRoleDescription } from "@app/config";

// Check if owner or admin (bypass member role checks)
if (isAdminOrOwner(tenantRole)) {
  // Can manage tenant settings
}

// Check multiple actions
const canModify = hasAnyPermission(tenantRole, memberRole, "task", ["update", "delete"]);

// Get human-readable role name
const label = getRoleDescription("member", "editor"); // "Editor"
```

---

## Part 2: Admin Portal (Internal)

### Concept: Single-Tier Roles

The admin portal uses a simpler single-tier system stored on the `user` table:

```
┌──────────────────────────────────────────────────────────────────┐
│                    Admin Portal Access                            │
│                                                                   │
│         ┌─────────────┐                                          │
│         │ super_admin │ ◄── Full access + manage other admins    │
│         └──────┬──────┘                                          │
│                │                                                  │
│         ┌──────▼──────┐                                          │
│         │ support_rw  │ ◄── View + modify user data              │
│         └──────┬──────┘                                          │
│                │                                                  │
│         ┌──────▼──────┐                                          │
│         │  read_only  │ ◄── View only (no modifications)         │
│         └─────────────┘                                          │
│                                                                   │
│         ┌─────────────┐                                          │
│         │    null     │ ◄── No admin access (regular users)      │
│         └─────────────┘                                          │
└──────────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- user table (admin role is ONE column)
┌─────────────────────────────────────────────────────────────────┐
│                          user                                    │
├──────────────────┬──────────┬────────────────────────────────────┤
│ Column           │ Type     │ Description                        │
├──────────────────┼──────────┼────────────────────────────────────┤
│ id               │ text     │ Primary key                        │
│ email            │ text     │ User email (unique)                │
│ name             │ text     │ Display name                       │
│ email_verified   │ boolean  │ Email verification status          │
│ ...              │          │                                    │
│ admin_role       │ text     │ NULL | "read_only" | "support_rw"  │
│                  │          │ | "super_admin"                    │
└──────────────────┴──────────┴────────────────────────────────────┘

-- If admin_role is NULL → user cannot access admin portal
-- If admin_role is set  → user can access admin portal with that role level
```

### Admin Permissions

| Feature                | read_only | support_rw | super_admin |
| ---------------------- | --------- | ---------- | ----------- |
| View metrics/dashboard | ✓         | ✓          | ✓           |
| View user details      | ✓         | ✓          | ✓           |
| View tenant details    | ✓         | ✓          | ✓           |
| View audit logs        | ✓         | ✓          | ✓           |
| Add notes to users     | -         | ✓          | ✓           |
| Modify user flags      | -         | ✓          | ✓           |
| Impersonate users      | -         | ✓          | ✓           |
| Replay webhook events  | -         | ✓          | ✓           |
| Manage admin users     | -         | -          | ✓           |
| Revoke impersonation   | -         | -          | ✓           |

### Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Admin API Request Flow                                │
└─────────────────────────────────────────────────────────────────────────┘

    Request: GET /rpc/admin/users/search
                    │
                    ▼
    ┌───────────────────────────────┐
    │   1. adminAuthMiddleware      │
    │                               │  1. Get Better Auth session
    │                               │  2. Load user from database
    │                               │  3. Check user.adminRole != null
    │                               │  → Adds context.adminUser
    └───────────────┬───────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │   2. requireReadOnly (or      │  Check: role >= required level
    │      requireSupportRW or      │
    │      requireSuperAdmin)       │  read_only < support_rw < super_admin
    └───────────────┬───────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │         3. Handler            │  Execute admin logic
    └───────────────────────────────┘
```

### Code Examples

**Admin route with role check:**

```typescript
// apps/api/src/orpc-routes/admin/index.ts
import {
  adminAuthMiddleware,
  requireReadOnly,
  requireSupportRW,
  requireSuperAdmin,
} from "../../middleware";

// Read-only access (any admin can view)
const usersSearch = os.admin.users.search
  .use(adminAuthMiddleware)
  .use(requireReadOnly)
  .handler(async ({ input }) => {
    return adminUsers.searchUsers(input);
  });

// Support access (can modify)
const usersAddNote = os.admin.users.addNote
  .use(adminAuthMiddleware)
  .use(requireSupportRW)
  .handler(async ({ input, context }) => {
    return adminUsers.addUserNote(
      input.userId,
      input.note,
      context.adminUser.id // Track who added the note
    );
  });

// Super admin only
const createAdminUser = os.admin.identity.createAdminUser
  .use(adminAuthMiddleware)
  .use(requireSuperAdmin)
  .handler(async ({ input, context }) => {
    return adminIdentity.createAdminUser(input, context.adminUser.id);
  });
```

**Admin login flow (apps/admin):**

```typescript
// apps/admin/src/app/page.tsx
import { authClient } from "@app/auth";

const handleLogin = async (email: string, password: string) => {
  // 1. Sign in with Better Auth (same as regular users)
  const result = await authClient.signIn.email({ email, password });
  if (result.error) throw new Error("Login failed");

  // 2. Check if user has admin role by calling API
  const response = await fetch(`${API_URL}/rpc/admin/identity/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    // User logged in but doesn't have admin access
    await authClient.signOut();
    throw new Error("You don't have admin access");
  }

  // 3. Redirect to admin dashboard
  router.push("/dashboard");
};
```

### Creating New Admin Users

Admin users are created through an **invitation flow** (not self-registration):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Admin User Creation Flow                              │
└─────────────────────────────────────────────────────────────────────────────┘

    Super Admin                      System                         New Admin
        │                              │                                │
        │  1. Create admin user        │                                │
        │     (email, name, role)      │                                │
        ├─────────────────────────────►│                                │
        │                              │                                │
        │                              │  2. Create user record         │
        │                              │     admin_role = 'support_rw'  │
        │                              │     email_verified = false     │
        │                              │                                │
        │                              │  3. Generate invite token      │
        │                              │     (stored in verification)   │
        │                              │                                │
        │                              │  4. Send invite email          │
        │                              ├───────────────────────────────►│
        │                              │                                │
        │                              │     5. Click invite link       │
        │                              │◄───────────────────────────────┤
        │                              │                                │
        │                              │  6. Set password page          │
        │                              ├───────────────────────────────►│
        │                              │                                │
        │                              │     7. Submit password         │
        │                              │◄───────────────────────────────┤
        │                              │                                │
        │                              │  8. email_verified = true      │
        │                              │     Create session             │
        │                              │                                │
        │                              │  9. Check if has tenant        │
        │                              │     No → Redirect to onboarding│
        │                              │     Yes → Redirect to dashboard│
        │                              ├───────────────────────────────►│
        │                              │                                │
        │                              │     10. Create workspace       │
        │                              │         (becomes owner)        │
        │                              │◄───────────────────────────────┤
        │                              │                                │
        │                              │  11. Redirect to admin portal  │
        │                              ├───────────────────────────────►│
```

**Key Points:**

- Only `super_admin` can create new admin users
- Admin users are regular users with `admin_role` set
- They use the same Better Auth system as regular users
- On first login, they can create their own workspace (becoming owner)
- They can then access both the user app AND the admin portal

**Code Example (Creating Admin User):**

```typescript
// apps/api/src/actions/admin-identity.ts
export async function createAdminUser(
  input: { email: string; name?: string; role: AdminRole },
  createdByAdminId: string
) {
  // 1. Check if user already exists
  const existing = await db.query.user.findFirst({
    where: eq(user.email, input.email),
  });

  if (existing) {
    // Update existing user with admin role
    await db.update(user).set({ adminRole: input.role }).where(eq(user.id, existing.id));
    return existing;
  }

  // 2. Create new user with admin role
  const newUser = await db
    .insert(user)
    .values({
      id: generateId(),
      email: input.email,
      name: input.name || input.email.split("@")[0],
      emailVerified: false,
      adminRole: input.role,
    })
    .returning();

  // 3. Generate invite token
  const token = generateSecureToken();
  await db.insert(verification).values({
    id: generateId(),
    identifier: `admin-invite:${input.email}`,
    value: token,
    expiresAt: addDays(new Date(), 7),
  });

  // 4. Send invite email
  await sendEmail({
    to: input.email,
    template: "admin-invite",
    data: {
      inviteLink: `${APP_URL}/admin-invite?token=${token}`,
      adminRole: input.role,
    },
  });

  // 5. Log audit entry
  await logAuditEntry({
    adminUserId: createdByAdminId,
    action: "admin_user_created",
    targetType: "user",
    targetId: newUser[0].id,
  });

  return newUser[0];
}
```

**Admin Portal Form (apps/admin):**

```typescript
// apps/admin/src/app/(dashboard)/dashboard/admins/create/page.tsx
function CreateAdminPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('read_only');

  const handleSubmit = async () => {
    await fetch(`${API_URL}/rpc/admin/identity/createAdminUser`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email, name, role }),
    });
    // Show success message
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Email" value={email} onChange={setEmail} />
      <Input label="Name" value={name} onChange={setName} />
      <Select label="Role" value={role} onChange={setRole}>
        <Option value="read_only">Read Only</Option>
        <Option value="support_rw">Support (Read/Write)</Option>
        <Option value="super_admin">Super Admin</Option>
      </Select>
      <Button type="submit">Send Invitation</Button>
    </form>
  );
}
```

**Accept Invite Page (apps/web):**

```typescript
// apps/web/src/app/(auth)/admin-invite/page.tsx
function AdminInvitePage() {
  const token = useSearchParams().get('token');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    // 1. Verify token and set password
    await fetch(`${API_URL}/api/auth/admin-invite/accept`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    // 2. Check if user has a tenant
    const session = await authClient.getSession();
    if (!session.user.activeTenantId) {
      // Redirect to onboarding to create workspace
      router.push('/onboarding');
    } else {
      // Redirect to admin portal
      window.location.href = 'http://localhost:3001/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Welcome to the Admin Team!</h1>
      <p>Set your password to complete setup.</p>
      <Input type="password" value={password} onChange={setPassword} />
      <Button type="submit">Complete Setup</Button>
    </form>
  );
}
```

---

## Part 3: Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Complete RBAC Architecture                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   Database   │
                              └──────┬───────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           │                                                   │
           ▼                                                   ▼
    ┌──────────────┐                                   ┌──────────────┐
    │     user     │                                   │tenant_members│
    │              │                                   │              │
    │ • id         │◄──────────────────────────────────│ • user_id    │
    │ • email      │                                   │ • tenant_id  │
    │ • name       │                                   │ • role       │
    │ • admin_role │ ◄── Admin portal access           │ • member_role│
    └──────┬───────┘                                   └──────┬───────┘
           │                                                   │
           │                                                   │
    ┌──────┴──────────────────────────────────────────────────┴──────┐
    │                                                                 │
    ▼                                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────────┐
│        ADMIN PORTAL           │         │         USER APPS                  │
│       (localhost:3001)        │         │    (localhost:3000 / :8081)        │
│                               │         │                                    │
│   ┌───────────────────────┐   │         │   ┌───────────────────────────┐    │
│   │ adminAuthMiddleware   │   │         │   │     authMiddleware        │    │
│   │ Checks: user.adminRole│   │         │   │  Checks: logged in        │    │
│   └───────────┬───────────┘   │         │   └───────────┬───────────────┘    │
│               │               │         │               │                    │
│   ┌───────────▼───────────┐   │         │   ┌───────────▼───────────────┐    │
│   │ requireReadOnly/      │   │         │   │    tenantMiddleware       │    │
│   │ requireSupportRW/     │   │         │   │ Checks: tenant membership │    │
│   │ requireSuperAdmin     │   │         │   └───────────┬───────────────┘    │
│   └───────────┬───────────┘   │         │               │                    │
│               │               │         │   ┌───────────▼───────────────┐    │
│               ▼               │         │   │   createRBACMiddleware    │    │
│         Admin APIs            │         │   │  Checks: canAccess()      │    │
│   • /rpc/admin/users          │         │   │  (tenantRole + memberRole)│    │
│   • /rpc/admin/tenants        │         │   └───────────┬───────────────┘    │
│   • /rpc/admin/metrics        │         │               │                    │
│   • /rpc/admin/impersonation  │         │               ▼                    │
│   • /rpc/admin/audit          │         │         Private APIs               │
│                               │         │   • /rpc/private/todos             │
└───────────────────────────────┘         │   • /rpc/private/settings          │
                                          │   • /rpc/private/workspace         │
                                          │   • /rpc/private/notifications     │
                                          └────────────────────────────────────┘
```

---

## Quick Reference

### Multi-Tenant App (Mobile & Web)

| Question                      | Answer                                                |
| ----------------------------- | ----------------------------------------------------- |
| Where are roles stored?       | `tenant_members` table (role + member_role columns)   |
| Who has full access?          | Tenant owners and admins                              |
| Default role for new members? | `member` + `contributor`                              |
| How to check permissions?     | `canAccess(tenantRole, memberRole, resource, action)` |
| Config location               | `packages/config/src/rbac/index.ts`                   |

### Admin Portal

| Question                   | Answer                                   |
| -------------------------- | ---------------------------------------- |
| Where is role stored?      | `user.admin_role` column                 |
| Who can access admin?      | Users with non-null `admin_role`         |
| Highest permission level?  | `super_admin`                            |
| How to grant admin access? | Via admin portal (preferred) or database |
| Uses same auth as users?   | Yes, Better Auth sessions                |
| Can admins have tenants?   | Yes, they're regular users + admin role  |

### Creating Admin Users

**Recommended: Via Admin Portal**

1. Login to admin portal as `super_admin`
2. Go to Dashboard → Create Admin User
3. Enter email, name, and select role
4. Click "Send Invitation"
5. New admin receives email → sets password → creates workspace

**Alternative: Direct Database (First Admin Only)**

```sql
-- Create first super_admin (bootstrap only)
-- User must already exist (sign up via web app first)
UPDATE "user"
SET admin_role = 'super_admin'
WHERE email = 'founder@company.com';
```

### Admin Role Levels

| Role          | Access                            | Use Case              |
| ------------- | --------------------------------- | --------------------- |
| `read_only`   | View all data, no modifications   | Analysts, auditors    |
| `support_rw`  | View + modify data, impersonate   | Customer support      |
| `super_admin` | Full access + manage other admins | Engineering, founders |

### Revoking Admin Access

```sql
-- Remove admin access (user keeps their tenant/data)
UPDATE "user"
SET admin_role = NULL
WHERE email = 'former-admin@example.com';
```

---

## Summary

1. **User Apps (Web/Mobile)** use a two-tier RBAC system:
   - Tenant Role (owner/admin/member) for management-level access
   - Member Role (editor/viewer/contributor/moderator) for functional-level access
   - Stored in `tenant_members` table

2. **Admin Portal** uses a single-tier system:
   - Admin Role (read_only/support_rw/super_admin)
   - Stored in `user.admin_role` column
   - Uses same Better Auth session as regular users

3. Both systems share the same authentication (Better Auth) but have completely separate authorization logic.
