# Admin Portal (apps/admin)

Internal dashboard at `:3001` for support/DevOps.

## Routes

- `/dashboard` - Metrics overview
- `/dashboard/users` - User management
- `/dashboard/tenants` - Tenant management

## Roles

- `read_only` - View-only access
- `support_rw` - Read/write for support operations
- `super_admin` - Full access including impersonation

## Features

User/tenant search, impersonation with audit logging, webhook debugging, support flags.
