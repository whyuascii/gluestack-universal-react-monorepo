/**
 * Workspace Contracts
 *
 * Authenticated endpoints for group/team management.
 * - tenants: Create and manage groups
 * - invites: Send and accept invitations
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

// =============================================================================
// Tenants - Group Management
// =============================================================================

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["family", "organization"]),
});

export const InviteSkipReasonSchema = z.enum([
  "already_member",
  "already_invited",
  "email_failed",
  "invalid_format",
]);

export const tenantsContract = {
  create: oc
    .route({ method: "POST", path: "/private/workspace/tenants" })
    .input(
      z.object({
        name: z.string().min(1, "validation:name.required").max(100, "validation:name.maxLength"),
      })
    )
    .output(
      z.object({
        tenantId: z.string(),
        name: z.string(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      INTERNAL_ERROR: {},
    }),

  sendInvites: oc
    .route({ method: "POST", path: "/private/workspace/tenants/{id}/invites" })
    .input(
      z.object({
        id: z.string(),
        emails: z.array(z.string().email()).min(1).max(10),
      })
    )
    .output(
      z.object({
        invited: z.array(z.string()),
        skipped: z.array(
          z.object({
            email: z.string(),
            reason: InviteSkipReasonSchema,
          })
        ),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      FORBIDDEN: {},
      NOT_FOUND: {},
    }),
};

// =============================================================================
// Invites - Invitation Management
// =============================================================================

export const InviteDetailsSchema = z.object({
  token: z.string(),
  tenantName: z.string(),
  inviterName: z.string(),
  email: z.string().email(),
  expiresAt: z.coerce.date(),
});

export const invitesContract = {
  getDetails: oc
    .route({ method: "GET", path: "/private/workspace/invites/{token}" })
    .input(
      z.object({
        token: z.string(),
      })
    )
    .output(InviteDetailsSchema)
    .errors({
      NOT_FOUND: {},
      BAD_REQUEST: {},
    }),

  accept: oc
    .route({ method: "POST", path: "/private/workspace/invites/{token}/accept" })
    .input(
      z.object({
        token: z.string(),
      })
    )
    .output(
      z.object({
        tenantId: z.string(),
        tenantName: z.string(),
      })
    )
    .errors({
      UNAUTHORIZED: {},
      NOT_FOUND: {},
      CONFLICT: {},
    }),
};

// =============================================================================
// Combined Workspace Contract
// =============================================================================

export const workspaceContract = {
  tenants: tenantsContract,
  invites: invitesContract,
};

export type WorkspaceContract = typeof workspaceContract;
