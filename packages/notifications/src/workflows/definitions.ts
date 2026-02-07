/**
 * Novu Workflow Definitions
 *
 * Programmatic workflow definitions for IN-APP NOTIFICATIONS ONLY.
 * These are synced to Novu via the bridge endpoint.
 *
 * Channel Architecture:
 * - In-app notifications: Novu (these workflows)
 * - Push notifications: Expo Push + Firebase (via PushProvider)
 * - Emails: Resend (via @app/mailer)
 *
 * Note: Due to Zod version compatibility issues with @novu/framework,
 * we use explicit type annotations for payload access.
 */

import { workflow } from "@novu/framework";
import { z } from "zod";

// =============================================================================
// Base Schema
// =============================================================================

/**
 * Base schema with common fields for all workflows
 */
const baseSchema = z.object({
  recipientId: z.string(),
  locale: z.string().default("en"),
  deepLink: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type BasePayload = z.infer<typeof baseSchema>;

// =============================================================================
// Generic Workflows
// =============================================================================

const pushNotificationSchema = baseSchema.extend({
  title: z.string(),
  body: z.string(),
});
export type PushNotificationPayload = z.infer<typeof pushNotificationSchema>;

/**
 * Generic notification workflow (in-app only)
 */
export const pushNotificationWorkflow = workflow(
  "push-notification",
  async ({ step, payload }) => {
    const p = payload as PushNotificationPayload;
    await step.inApp("in-app", async () => ({
      subject: p.title,
      body: p.body,
    }));
  },
  { payloadSchema: pushNotificationSchema }
);

const inAppNotificationSchema = baseSchema.extend({
  title: z.string(),
  body: z.string(),
});
export type InAppNotificationPayload = z.infer<typeof inAppNotificationSchema>;

/**
 * In-app only notification workflow
 */
export const inAppNotificationWorkflow = workflow(
  "in-app-notification",
  async ({ step, payload }) => {
    const p = payload as InAppNotificationPayload;
    await step.inApp("in-app", async () => ({
      subject: p.title,
      body: p.body,
    }));
  },
  { payloadSchema: inAppNotificationSchema }
);

// =============================================================================
// Onboarding & Authentication Workflows
// =============================================================================

const welcomeSchema = baseSchema.extend({
  userName: z.string(),
  appName: z.string().default("App"),
});
export type WelcomePayload = z.infer<typeof welcomeSchema>;

/**
 * Welcome notification workflow (in-app)
 * Note: Welcome email is sent separately via @app/mailer
 */
export const welcomeWorkflow = workflow(
  "welcome",
  async ({ step, payload }) => {
    const p = payload as WelcomePayload;
    await step.inApp("in-app", async () => ({
      subject: `Welcome to ${p.appName}!`,
      body: `Hi ${p.userName}, we're excited to have you! Let's get started.`,
    }));
  },
  { payloadSchema: welcomeSchema }
);

// =============================================================================
// Social & Membership Workflows
// =============================================================================

const inviteReceivedSchema = baseSchema.extend({
  inviterName: z.string(),
  tenantName: z.string(),
});
export type InviteReceivedPayload = z.infer<typeof inviteReceivedSchema>;

/**
 * Invite received workflow (in-app)
 * Note: Invite email is sent separately via @app/mailer
 */
export const inviteReceivedWorkflow = workflow(
  "invite-received",
  async ({ step, payload }) => {
    const p = payload as InviteReceivedPayload;
    await step.inApp("in-app", async () => ({
      subject: "You've been invited!",
      body: `${p.inviterName} invited you to join ${p.tenantName}`,
    }));
  },
  { payloadSchema: inviteReceivedSchema }
);

const memberJoinedSchema = baseSchema.extend({
  memberName: z.string(),
  tenantName: z.string(),
});
export type MemberJoinedPayload = z.infer<typeof memberJoinedSchema>;

/**
 * Member joined workflow (in-app)
 */
export const memberJoinedWorkflow = workflow(
  "member-joined",
  async ({ step, payload }) => {
    const p = payload as MemberJoinedPayload;
    await step.inApp("in-app", async () => ({
      subject: "New member joined!",
      body: `${p.memberName} has joined ${p.tenantName}`,
    }));
  },
  { payloadSchema: memberJoinedSchema }
);

// =============================================================================
// Task & Todo Workflows
// =============================================================================

const todoAssignedSchema = baseSchema.extend({
  assignerName: z.string(),
  todoTitle: z.string(),
  dueDate: z.string().optional(),
});
export type TodoAssignedPayload = z.infer<typeof todoAssignedSchema>;

/**
 * Todo assigned workflow (in-app)
 */
export const todoAssignedWorkflow = workflow(
  "todo-assigned",
  async ({ step, payload }) => {
    const p = payload as TodoAssignedPayload;
    await step.inApp("in-app", async () => ({
      subject: "New task assigned",
      body: `${p.assignerName} assigned you: ${p.todoTitle}`,
    }));
  },
  { payloadSchema: todoAssignedSchema }
);

const todoNudgeSchema = baseSchema.extend({
  nudgerName: z.string(),
  todoTitle: z.string(),
  message: z.string().optional(),
});
export type TodoNudgePayload = z.infer<typeof todoNudgeSchema>;

/**
 * Todo nudge workflow (in-app)
 * Note: Push/SMS for urgent nudges sent via Expo Push
 */
export const todoNudgeWorkflow = workflow(
  "todo-nudge",
  async ({ step, payload }) => {
    const p = payload as TodoNudgePayload;
    await step.inApp("in-app", async () => ({
      subject: "Friendly reminder",
      body: `${p.nudgerName} is nudging you about: ${p.todoTitle}`,
    }));
  },
  { payloadSchema: todoNudgeSchema }
);

const todoCompletedSchema = baseSchema.extend({
  completerName: z.string(),
  todoTitle: z.string(),
});
export type TodoCompletedPayload = z.infer<typeof todoCompletedSchema>;

/**
 * Todo completed workflow (in-app)
 */
export const todoCompletedWorkflow = workflow(
  "todo-completed",
  async ({ step, payload }) => {
    const p = payload as TodoCompletedPayload;
    await step.inApp("in-app", async () => ({
      subject: "Task completed!",
      body: `${p.completerName} completed: ${p.todoTitle}`,
    }));
  },
  { payloadSchema: todoCompletedSchema }
);

// =============================================================================
// Event Workflows
// =============================================================================

const eventCreatedSchema = baseSchema.extend({
  creatorName: z.string(),
  eventTitle: z.string(),
  eventDate: z.string(),
  eventLocation: z.string().optional(),
});
export type EventCreatedPayload = z.infer<typeof eventCreatedSchema>;

/**
 * Event created workflow (in-app)
 */
export const eventCreatedWorkflow = workflow(
  "event-created",
  async ({ step, payload }) => {
    const p = payload as EventCreatedPayload;
    await step.inApp("in-app", async () => ({
      subject: "New event created",
      body: `${p.creatorName} created: ${p.eventTitle} on ${p.eventDate}`,
    }));
  },
  { payloadSchema: eventCreatedSchema }
);

const eventReminderSchema = baseSchema.extend({
  eventTitle: z.string(),
  eventDate: z.string(),
  timeUntil: z.string(),
});
export type EventReminderPayload = z.infer<typeof eventReminderSchema>;

/**
 * Event reminder workflow (in-app)
 * Note: Push notification for reminders sent via Expo Push
 */
export const eventReminderWorkflow = workflow(
  "event-reminder",
  async ({ step, payload }) => {
    const p = payload as EventReminderPayload;
    await step.inApp("in-app", async () => ({
      subject: "Event reminder",
      body: `${p.eventTitle} is in ${p.timeUntil}`,
    }));
  },
  { payloadSchema: eventReminderSchema }
);

const eventChangedSchema = baseSchema.extend({
  changerName: z.string(),
  eventTitle: z.string(),
  changeDescription: z.string(),
});
export type EventChangedPayload = z.infer<typeof eventChangedSchema>;

/**
 * Event changed workflow (in-app)
 */
export const eventChangedWorkflow = workflow(
  "event-changed",
  async ({ step, payload }) => {
    const p = payload as EventChangedPayload;
    await step.inApp("in-app", async () => ({
      subject: "Event updated",
      body: `${p.changerName} updated ${p.eventTitle}: ${p.changeDescription}`,
    }));
  },
  { payloadSchema: eventChangedSchema }
);

// =============================================================================
// Alerts & Limits Workflows
// =============================================================================

const limitAlertSchema = baseSchema.extend({
  limitName: z.string(),
  percentUsed: z.number(),
  remaining: z.string(),
});
export type LimitAlertPayload = z.infer<typeof limitAlertSchema>;

/**
 * Limit/threshold alert workflow (in-app)
 * Use for any quota, budget, or usage limit alerts
 */
export const limitAlertWorkflow = workflow(
  "limit-alert",
  async ({ step, payload }) => {
    const p = payload as LimitAlertPayload;
    const isOver = p.percentUsed >= 100;
    const alertLevel = isOver ? "Alert" : p.percentUsed >= 90 ? "Warning" : "Notice";

    await step.inApp("in-app", async () => ({
      subject: `${alertLevel}: ${p.limitName}`,
      body: `${p.percentUsed}% used (${p.remaining} remaining)`,
    }));
  },
  { payloadSchema: limitAlertSchema }
);

const achievementSchema = baseSchema.extend({
  achieverName: z.string(),
  achievementTitle: z.string(),
});
export type AchievementPayload = z.infer<typeof achievementSchema>;

/**
 * Achievement/goal completed workflow (in-app)
 */
export const achievementWorkflow = workflow(
  "achievement",
  async ({ step, payload }) => {
    const p = payload as AchievementPayload;
    await step.inApp("in-app", async () => ({
      subject: "Achievement unlocked!",
      body: `${p.achieverName} completed: ${p.achievementTitle}`,
    }));
  },
  { payloadSchema: achievementSchema }
);

const surveyCreatedSchema = baseSchema.extend({
  creatorName: z.string(),
  surveyQuestion: z.string(),
  expiresAt: z.string().optional(),
});
export type SurveyCreatedPayload = z.infer<typeof surveyCreatedSchema>;

/**
 * Survey/poll created workflow (in-app)
 */
export const surveyCreatedWorkflow = workflow(
  "survey-created",
  async ({ step, payload }) => {
    const p = payload as SurveyCreatedPayload;
    await step.inApp("in-app", async () => ({
      subject: "New survey",
      body: `${p.creatorName} asks: ${p.surveyQuestion}`,
    }));
  },
  { payloadSchema: surveyCreatedSchema }
);

// =============================================================================
// Engagement Workflows
// =============================================================================

const weeklySummarySchema = baseSchema.extend({
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  completedTasks: z.number(),
  upcomingEvents: z.number(),
  highlights: z.array(z.string()).optional(),
});
export type WeeklySummaryPayload = z.infer<typeof weeklySummarySchema>;

/**
 * Weekly summary workflow (in-app)
 * Note: Email summary sent separately via @app/mailer
 */
export const weeklySummaryWorkflow = workflow(
  "weekly-summary",
  async ({ step, payload }) => {
    const p = payload as WeeklySummaryPayload;
    await step.inApp("in-app", async () => ({
      subject: "Your Week in Review",
      body: `${p.weekStartDate} - ${p.weekEndDate}: ${p.completedTasks} tasks completed, ${p.upcomingEvents} upcoming events`,
    }));
  },
  { payloadSchema: weeklySummarySchema }
);

const reminderSchema = baseSchema.extend({
  reminderTitle: z.string(),
  reminderBody: z.string(),
  actionUrl: z.string().optional(),
});
export type ReminderPayload = z.infer<typeof reminderSchema>;

/**
 * Reminder workflow (in-app)
 */
export const reminderWorkflow = workflow(
  "reminder",
  async ({ step, payload }) => {
    const p = payload as ReminderPayload;
    await step.inApp("in-app", async () => ({
      subject: p.reminderTitle,
      body: p.reminderBody,
    }));
  },
  { payloadSchema: reminderSchema }
);

// =============================================================================
// Communication & Recognition Workflows
// =============================================================================

const directMessageSchema = baseSchema.extend({
  senderName: z.string(),
  message: z.string(),
});
export type DirectMessagePayload = z.infer<typeof directMessageSchema>;

/**
 * Direct message workflow (in-app)
 */
export const directMessageWorkflow = workflow(
  "direct-message",
  async ({ step, payload }) => {
    const p = payload as DirectMessagePayload;
    await step.inApp("in-app", async () => ({
      subject: `Message from ${p.senderName}`,
      body: p.message,
    }));
  },
  { payloadSchema: directMessageSchema }
);

const milestoneSchema = baseSchema.extend({
  milestoneName: z.string(),
  description: z.string(),
});
export type MilestonePayload = z.infer<typeof milestoneSchema>;

/**
 * Milestone reached workflow (in-app)
 */
export const milestoneWorkflow = workflow(
  "milestone",
  async ({ step, payload }) => {
    const p = payload as MilestonePayload;
    await step.inApp("in-app", async () => ({
      subject: `Milestone: ${p.milestoneName}`,
      body: p.description,
    }));
  },
  { payloadSchema: milestoneSchema }
);

const kudosSentSchema = baseSchema.extend({
  senderName: z.string(),
  message: z.string(),
  category: z.string().optional(),
});
export type KudosSentPayload = z.infer<typeof kudosSentSchema>;

/**
 * Kudos/recognition sent workflow (in-app)
 */
export const kudosSentWorkflow = workflow(
  "kudos-sent",
  async ({ step, payload }) => {
    const p = payload as KudosSentPayload;
    await step.inApp("in-app", async () => ({
      subject: `Kudos from ${p.senderName}`,
      body: p.message,
    }));
  },
  { payloadSchema: kudosSentSchema }
);

// =============================================================================
// System Workflows
// =============================================================================

const settingsChangedSchema = baseSchema.extend({
  changerName: z.string(),
  settingName: z.string(),
  changeDescription: z.string(),
});
export type SettingsChangedPayload = z.infer<typeof settingsChangedSchema>;

/**
 * Settings changed workflow (in-app)
 */
export const settingsChangedWorkflow = workflow(
  "settings-changed",
  async ({ step, payload }) => {
    const p = payload as SettingsChangedPayload;
    await step.inApp("in-app", async () => ({
      subject: "Settings updated",
      body: `${p.changerName} changed ${p.settingName}: ${p.changeDescription}`,
    }));
  },
  { payloadSchema: settingsChangedSchema }
);
