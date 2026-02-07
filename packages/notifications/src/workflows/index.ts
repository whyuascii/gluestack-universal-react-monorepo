/**
 * Novu Workflows
 *
 * Programmatic workflow definitions for all notification types.
 * These are synced to Novu via the bridge endpoint.
 *
 * @example
 * // In your API, serve the workflows:
 * import { allWorkflows, serveWorkflows } from "@app/notifications/workflows";
 *
 * // Register the bridge endpoint
 * app.register(serveWorkflows);
 */

export * from "./types";
export * from "./definitions";

// Import all workflows for the serve function
import {
  // Generic
  pushNotificationWorkflow,
  inAppNotificationWorkflow,
  // Onboarding
  welcomeWorkflow,
  // Social
  inviteReceivedWorkflow,
  memberJoinedWorkflow,
  // Tasks
  todoAssignedWorkflow,
  todoNudgeWorkflow,
  todoCompletedWorkflow,
  // Events
  eventCreatedWorkflow,
  eventReminderWorkflow,
  eventChangedWorkflow,
  // Alerts & Limits
  limitAlertWorkflow,
  achievementWorkflow,
  surveyCreatedWorkflow,
  // Engagement
  weeklySummaryWorkflow,
  reminderWorkflow,
  // Communication
  directMessageWorkflow,
  milestoneWorkflow,
  kudosSentWorkflow,
  // System
  settingsChangedWorkflow,
} from "./definitions";

/**
 * All workflows registered with Novu
 */
export const allWorkflows = [
  // Generic
  pushNotificationWorkflow,
  inAppNotificationWorkflow,
  // Onboarding
  welcomeWorkflow,
  // Social
  inviteReceivedWorkflow,
  memberJoinedWorkflow,
  // Tasks
  todoAssignedWorkflow,
  todoNudgeWorkflow,
  todoCompletedWorkflow,
  // Events
  eventCreatedWorkflow,
  eventReminderWorkflow,
  eventChangedWorkflow,
  // Alerts & Limits
  limitAlertWorkflow,
  achievementWorkflow,
  surveyCreatedWorkflow,
  // Engagement
  weeklySummaryWorkflow,
  reminderWorkflow,
  // Communication
  directMessageWorkflow,
  milestoneWorkflow,
  kudosSentWorkflow,
  // System
  settingsChangedWorkflow,
];

/**
 * Workflow ID to workflow mapping
 */
export const workflowMap = {
  "push-notification": pushNotificationWorkflow,
  "in-app-notification": inAppNotificationWorkflow,
  welcome: welcomeWorkflow,
  "invite-received": inviteReceivedWorkflow,
  "member-joined": memberJoinedWorkflow,
  "todo-assigned": todoAssignedWorkflow,
  "todo-nudge": todoNudgeWorkflow,
  "todo-completed": todoCompletedWorkflow,
  "event-created": eventCreatedWorkflow,
  "event-reminder": eventReminderWorkflow,
  "event-changed": eventChangedWorkflow,
  "limit-alert": limitAlertWorkflow,
  achievement: achievementWorkflow,
  "survey-created": surveyCreatedWorkflow,
  "weekly-summary": weeklySummaryWorkflow,
  reminder: reminderWorkflow,
  "direct-message": directMessageWorkflow,
  milestone: milestoneWorkflow,
  "kudos-sent": kudosSentWorkflow,
  "settings-changed": settingsChangedWorkflow,
} as const;

export type WorkflowId = keyof typeof workflowMap;

/**
 * List of all workflow IDs
 */
export const workflowIds = Object.keys(workflowMap) as WorkflowId[];
