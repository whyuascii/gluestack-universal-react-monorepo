/**
 * Workflow Payload Types
 *
 * Re-exports for convenience. Actual types are inferred from Zod schemas
 * defined in definitions.ts.
 */

// Export workflow IDs for type safety
export const WORKFLOW_IDS = [
  "push-notification",
  "in-app-notification",
  "welcome",
  "invite-received",
  "member-joined",
  "todo-assigned",
  "todo-nudge",
  "todo-completed",
  "event-created",
  "event-reminder",
  "event-changed",
  "limit-alert",
  "achievement",
  "survey-created",
  "weekly-summary",
  "reminder",
  "direct-message",
  "milestone",
  "kudos-sent",
  "settings-changed",
] as const;

export type WorkflowId = (typeof WORKFLOW_IDS)[number];
