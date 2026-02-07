/**
 * Privacy-safe event allowlist
 * Only events listed here can be tracked. Properties are strictly validated.
 */

export type AllowedProperty = string;

export interface EventSchema {
  properties: readonly AllowedProperty[];
  requiresAuth?: boolean; // If true, only track for authenticated users
  description?: string;
}

export const ALLOWED_EVENTS = {
  // ============================================================================
  // App Lifecycle (anonymous-safe)
  // ============================================================================
  "app.opened": {
    properties: ["source", "platform"],
    description: "App launched",
  },
  "app.backgrounded": {
    properties: ["platform"],
    description: "App moved to background",
  },
  "session.started": {
    properties: ["platform"],
    description: "New session began",
  },
  "session.ended": {
    properties: ["duration_seconds", "platform"],
    description: "Session ended",
  },

  // ============================================================================
  // Authentication (anonymous until completed)
  // ============================================================================
  "auth.signup_started": {
    properties: ["method"],
    description: "User began signup flow",
  },
  "auth.signup_completed": {
    properties: ["method", "time_to_complete_ms"],
    requiresAuth: true,
    description: "User completed signup",
  },
  "auth.login": {
    properties: ["method"],
    requiresAuth: true,
    description: "User logged in",
  },
  "auth.logout": {
    properties: [],
    requiresAuth: true,
    description: "User logged out",
  },
  "auth.password_reset_requested": {
    properties: [],
    description: "Password reset requested (no email tracked)",
  },
  "auth.password_reset_completed": {
    properties: [],
    description: "Password reset completed",
  },
  "auth.email_verified": {
    properties: [],
    requiresAuth: true,
    description: "Email verification completed",
  },

  // ============================================================================
  // Feature Engagement (requires auth)
  // ============================================================================
  "feature.viewed": {
    properties: ["feature_name", "source"],
    requiresAuth: true,
    description: "User viewed a feature",
  },
  "feature.action": {
    properties: ["feature_name", "action_type"],
    requiresAuth: true,
    description: "User performed action in feature",
  },
  "screen.viewed": {
    properties: ["screen_name", "previous_screen"],
    description: "Screen/page view",
  },

  // ============================================================================
  // Subscription Events (server-side only, from webhooks)
  // ============================================================================
  "subscription.started": {
    properties: ["plan_id", "provider", "trial_used"],
    requiresAuth: true,
    description: "Subscription activated",
  },
  "subscription.renewed": {
    properties: ["plan_id", "provider"],
    requiresAuth: true,
    description: "Subscription renewed",
  },
  "subscription.canceled": {
    properties: ["plan_id", "provider", "reason"],
    requiresAuth: true,
    description: "Subscription canceled",
  },
  "subscription.expired": {
    properties: ["plan_id", "provider"],
    requiresAuth: true,
    description: "Subscription expired",
  },
  "subscription.payment_failed": {
    properties: ["plan_id", "provider"],
    requiresAuth: true,
    description: "Payment failed",
  },
  "paywall.viewed": {
    properties: ["source", "offering_id"],
    description: "Paywall displayed",
  },

  // ============================================================================
  // Group/Tenant Events (requires auth)
  // ============================================================================
  "group.created": {
    properties: [],
    requiresAuth: true,
    description: "Group created",
  },
  "group.joined": {
    properties: ["via_invite"],
    requiresAuth: true,
    description: "User joined group",
  },
  "group.left": {
    properties: [],
    requiresAuth: true,
    description: "User left group",
  },
  "invite.sent": {
    properties: ["count"],
    requiresAuth: true,
    description: "Invites sent",
  },
  "invite.accepted": {
    properties: [],
    requiresAuth: true,
    description: "Invite accepted",
  },

  // ============================================================================
  // Settings Events
  // ============================================================================
  "settings.language_changed": {
    properties: ["from_language", "to_language"],
    description: "Language preference changed",
  },
  "settings.theme_changed": {
    properties: ["from_theme", "to_theme"],
    description: "Theme preference changed",
  },
  "settings.notifications_toggled": {
    properties: ["enabled"],
    description: "Notification settings changed",
  },
  "settings.analytics_consent_changed": {
    properties: ["consent_level"],
    description: "Analytics consent updated",
  },

  // ============================================================================
  // Error Events (server-side tracking only)
  // ============================================================================
  "error.api": {
    properties: ["endpoint", "method", "status_code"],
    description: "API error occurred (no message for privacy)",
  },
} as const satisfies Record<string, EventSchema>;

export type AllowedEventName = keyof typeof ALLOWED_EVENTS;

export function isAllowedEvent(event: string): event is AllowedEventName {
  return event in ALLOWED_EVENTS;
}

export function getEventSchema(event: AllowedEventName): EventSchema {
  return ALLOWED_EVENTS[event];
}
