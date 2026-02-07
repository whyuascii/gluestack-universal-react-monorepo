/**
 * Admin Routes
 *
 * Admin-only endpoints for platform management.
 * Requires admin auth + role-based access.
 */
import { AdminMetricsActions } from "../../actions/admin-metrics";
import * as adminIdentity from "../../actions/admin-identity";
import * as adminAudit from "../../actions/admin-audit";
import * as adminTenants from "../../actions/admin-tenants";
import * as adminUsers from "../../actions/admin-users";
import * as adminFlags from "../../actions/admin-flags";
import * as adminImpersonation from "../../actions/admin-impersonation";
import * as adminDebug from "../../actions/admin-debug";
import {
  adminAuthMiddleware,
  requireReadOnly,
  requireSupportRW,
  requireSuperAdmin,
} from "../../middleware";
import { os } from "../_implementer";

const adminActions = new AdminMetricsActions();

// =============================================================================
// Middleware Chains
// =============================================================================

// read_only+ access
const readOnlyAuth = adminAuthMiddleware.concat(requireReadOnly);

// support_rw+ access
const supportRWAuth = adminAuthMiddleware.concat(requireSupportRW);

// super_admin only
const superAdminAuth = adminAuthMiddleware.concat(requireSuperAdmin);

// =============================================================================
// Metrics Routes (read_only+)
// =============================================================================

const metricsOverview = os.admin.metrics.overview.use(readOnlyAuth).handler(async () => {
  return adminActions.getOverview();
});

const metricsEngagement = os.admin.metrics.engagement
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminActions.getEngagement(input.period);
  });

const metricsRevenue = os.admin.metrics.revenue.use(readOnlyAuth).handler(async () => {
  return adminActions.getRevenue();
});

const metricsCohorts = os.admin.metrics.cohorts.use(readOnlyAuth).handler(async ({ input }) => {
  return adminActions.getCohorts(input.months);
});

// =============================================================================
// Identity Routes (super_admin only for write, read_only+ for read)
// =============================================================================

const identityListAdminUsers = os.admin.identity.listAdminUsers
  .use(superAdminAuth)
  .handler(async ({ input }) => {
    return adminIdentity.listAdminUsers(input.page, input.limit);
  });

const identityGetAdminUser = os.admin.identity.getAdminUser
  .use(superAdminAuth)
  .handler(async ({ input }) => {
    return adminIdentity.getAdminUser(input.adminUserId);
  });

const identityCreateAdminUser = os.admin.identity.createAdminUser
  .use(superAdminAuth)
  .handler(async ({ input, context }) => {
    return adminIdentity.createAdminUser(input, context.adminUser.id);
  });

const identityUpdateAdminUserRoles = os.admin.identity.updateAdminUserRoles
  .use(superAdminAuth)
  .handler(async ({ input, context }) => {
    return adminIdentity.updateAdminUserRoles(
      input.adminUserId,
      input.roles,
      input.reason,
      context.adminUser.id
    );
  });

const identityUpdateAdminUserStatus = os.admin.identity.updateAdminUserStatus
  .use(superAdminAuth)
  .handler(async ({ input, context }) => {
    return adminIdentity.updateAdminUserStatus(
      input.adminUserId,
      input.status,
      input.reason,
      context.adminUser.id
    );
  });

const identityListRoles = os.admin.identity.listRoles.use(superAdminAuth).handler(async () => {
  return adminIdentity.listAdminRoles();
});

const identityMe = os.admin.identity.me.use(readOnlyAuth).handler(async ({ context }) => {
  // Return admin user info from context (populated by adminAuthMiddleware)
  return {
    id: context.adminUser.id,
    email: context.adminUser.email,
    name: context.adminUser.name,
    adminRole: context.adminUser.adminRole,
  };
});

const identityResendInvite = os.admin.identity.resendInvite
  .use(superAdminAuth)
  .handler(async ({ input, context }) => {
    await adminIdentity.resendAdminInvite(input.adminUserId, context.adminUser.id);
    return { success: true };
  });

// =============================================================================
// Tenants Routes (read_only+ for read, support_rw+ for write)
// =============================================================================

const tenantsList = os.admin.tenants.list.use(readOnlyAuth).handler(async ({ input }) => {
  return adminTenants.listTenants(input);
});

const tenantsGet = os.admin.tenants.get.use(readOnlyAuth).handler(async ({ input }) => {
  return adminTenants.getTenantDetail(input.tenantId);
});

const tenantsAddNote = os.admin.tenants.addNote
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminTenants.addTenantNote(input.tenantId, input.note, context.adminUser.id);
  });

const tenantsDeleteNote = os.admin.tenants.deleteNote
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminTenants.deleteTenantNote(input.tenantId, input.noteId, context.adminUser.id);
  });

const tenantsGetActivity = os.admin.tenants.getActivity
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminTenants.getTenantActivity(input.tenantId, input.days);
  });

const tenantsGetSubscriptions = os.admin.tenants.getSubscriptions
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminTenants.getTenantSubscriptions(input.tenantId);
  });

// =============================================================================
// Users Routes (read_only+ for read, support_rw+ for write)
// =============================================================================

const usersSearch = os.admin.users.search.use(readOnlyAuth).handler(async ({ input }) => {
  return adminUsers.searchUsers(input);
});

const usersGet = os.admin.users.get.use(readOnlyAuth).handler(async ({ input }) => {
  return adminUsers.getUserDetail(input.userId);
});

const usersGetActivityTimeline = os.admin.users.getActivityTimeline
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminUsers.getUserActivityTimeline(input);
  });

const usersGetSubscriptions = os.admin.users.getSubscriptions
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminUsers.getUserSubscriptions(input.userId);
  });

const usersAddNote = os.admin.users.addNote
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminUsers.addUserNote(input.userId, input.note, context.adminUser.id);
  });

const usersDeleteNote = os.admin.users.deleteNote
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminUsers.deleteUserNote(input.userId, input.noteId, context.adminUser.id);
  });

const usersResendVerificationEmail = os.admin.users.resendVerificationEmail
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminUsers.resendVerificationEmail(input.userId, input.reason, context.adminUser.id);
  });

// =============================================================================
// Flags Routes (read_only+ for read, support_rw+ for write)
// =============================================================================

const flagsList = os.admin.flags.list.use(readOnlyAuth).handler(async ({ input }) => {
  return adminFlags.listFlags(input);
});

const flagsSet = os.admin.flags.set.use(supportRWAuth).handler(async ({ input, context }) => {
  return adminFlags.setFlag(input, context.adminUser.id);
});

const flagsRemove = os.admin.flags.remove.use(supportRWAuth).handler(async ({ input, context }) => {
  return adminFlags.removeFlag(input.flagId, input.reason, context.adminUser.id);
});

const flagsGetForTarget = os.admin.flags.getForTarget
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminFlags.getFlagsForTarget(input.targetType, input.targetId);
  });

// =============================================================================
// Impersonation Routes (support_rw+ for start/stop, super_admin for list/revoke)
// =============================================================================

const impersonationStart = os.admin.impersonation.start
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminImpersonation.startImpersonation(input, context.adminUser.id);
  });

const impersonationStop = os.admin.impersonation.stop
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminImpersonation.stopImpersonation(
      input.sessionId,
      input.reason,
      context.adminUser.id
    );
  });

const impersonationStatus = os.admin.impersonation.status
  .use(supportRWAuth)
  .handler(async ({ context }) => {
    return adminImpersonation.getImpersonationStatus(context.adminUser.id);
  });

const impersonationListActive = os.admin.impersonation.listActive
  .use(superAdminAuth)
  .handler(async () => {
    return adminImpersonation.listActiveSessions();
  });

const impersonationRevoke = os.admin.impersonation.revoke
  .use(superAdminAuth)
  .handler(async ({ input, context }) => {
    return adminImpersonation.revokeSession(input.sessionId, input.reason, context.adminUser.id);
  });

const impersonationHistory = os.admin.impersonation.history
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminImpersonation.getImpersonationHistory(input);
  });

// =============================================================================
// Debug Routes (read_only+ for read, support_rw+ for replay)
// =============================================================================

const debugListWebhookEvents = os.admin.debug.listWebhookEvents
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminDebug.listWebhookEvents(input);
  });

const debugGetWebhookEvent = os.admin.debug.getWebhookEvent
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminDebug.getWebhookEvent(input.eventId);
  });

const debugReplayWebhookEvent = os.admin.debug.replayWebhookEvent
  .use(supportRWAuth)
  .handler(async ({ input, context }) => {
    return adminDebug.replayWebhookEvent(input.eventId, input.reason, context.adminUser.id);
  });

const debugSystemStatus = os.admin.debug.systemStatus.use(readOnlyAuth).handler(async () => {
  return adminDebug.getSystemStatus();
});

const debugHealthCheck = os.admin.debug.healthCheck.use(readOnlyAuth).handler(async () => {
  return adminDebug.healthCheck();
});

// =============================================================================
// Audit Routes (read_only+)
// =============================================================================

const auditList = os.admin.audit.list.use(readOnlyAuth).handler(async ({ input }) => {
  return adminAudit.listAuditLogs(input);
});

const auditGet = os.admin.audit.get.use(readOnlyAuth).handler(async ({ input }) => {
  return adminAudit.getAuditLog(input.logId);
});

const auditGetForTarget = os.admin.audit.getForTarget
  .use(readOnlyAuth)
  .handler(async ({ input }) => {
    return adminAudit.getAuditLogsForTarget(
      input.targetType,
      input.targetId,
      input.page,
      input.limit
    );
  });

const auditSummary = os.admin.audit.summary.use(readOnlyAuth).handler(async ({ input }) => {
  return adminAudit.getAuditSummary(input.from, input.to);
});

// =============================================================================
// Export Combined Admin Routes
// =============================================================================

export const adminRoutes = {
  // No auth routes needed - using Better Auth
  metrics: {
    overview: metricsOverview,
    engagement: metricsEngagement,
    revenue: metricsRevenue,
    cohorts: metricsCohorts,
  },
  identity: {
    listAdminUsers: identityListAdminUsers,
    getAdminUser: identityGetAdminUser,
    createAdminUser: identityCreateAdminUser,
    updateAdminUserRoles: identityUpdateAdminUserRoles,
    updateAdminUserStatus: identityUpdateAdminUserStatus,
    listRoles: identityListRoles,
    me: identityMe,
    resendInvite: identityResendInvite,
  },
  tenants: {
    list: tenantsList,
    get: tenantsGet,
    addNote: tenantsAddNote,
    deleteNote: tenantsDeleteNote,
    getActivity: tenantsGetActivity,
    getSubscriptions: tenantsGetSubscriptions,
  },
  users: {
    search: usersSearch,
    get: usersGet,
    getActivityTimeline: usersGetActivityTimeline,
    getSubscriptions: usersGetSubscriptions,
    addNote: usersAddNote,
    deleteNote: usersDeleteNote,
    resendVerificationEmail: usersResendVerificationEmail,
  },
  flags: {
    list: flagsList,
    set: flagsSet,
    remove: flagsRemove,
    getForTarget: flagsGetForTarget,
  },
  impersonation: {
    start: impersonationStart,
    stop: impersonationStop,
    status: impersonationStatus,
    listActive: impersonationListActive,
    revoke: impersonationRevoke,
    history: impersonationHistory,
  },
  debug: {
    listWebhookEvents: debugListWebhookEvents,
    getWebhookEvent: debugGetWebhookEvent,
    replayWebhookEvent: debugReplayWebhookEvent,
    systemStatus: debugSystemStatus,
    healthCheck: debugHealthCheck,
  },
  audit: {
    list: auditList,
    get: auditGet,
    getForTarget: auditGetForTarget,
    summary: auditSummary,
  },
};
