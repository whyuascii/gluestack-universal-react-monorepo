// Analytics event types for type-safe tracking

// JSON-compatible types for analytics properties
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface AnalyticsProperties {
  [key: string]: JsonValue | undefined;
}

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Define your app's events here for type safety
export type AppEvents = {
  // ============================================================================
  // App Lifecycle Events
  // ============================================================================
  app_opened: {
    timestamp: string;
    source: "app_launch" | "deep_link" | "push_notification";
  };
  app_backgrounded: {
    timestamp: string;
  };
  app_foregrounded: {
    timestamp: string;
  };

  // ============================================================================
  // Screen/Page View Events
  // ============================================================================
  screen_viewed: {
    screen_name: string;
    previous_screen?: string;
    path?: string;
  };

  // ============================================================================
  // Authentication Events
  // ============================================================================
  signup_started: {
    method?: "email" | "google" | "apple" | "github";
  };
  signup_completed: {
    user_id: string;
    method: "email" | "google" | "apple" | "github";
  };
  signup_failed: {
    method?: "email" | "google" | "apple" | "github";
    error_message: string;
  };
  login_started: {
    method?: "email" | "google" | "apple" | "github";
  };
  login_completed: {
    user_id: string;
    method: "email" | "google" | "apple" | "github";
  };
  login_failed: {
    method?: "email" | "google" | "apple" | "github";
    error_message: string;
  };
  logout: Record<string, never>;
  password_reset_requested: {
    email: string;
  };
  password_reset_completed: Record<string, never>;
  email_verified: {
    user_id: string;
  };

  // ============================================================================
  // Subscription Events
  // ============================================================================
  paywall_viewed: {
    source: string;
    offering_id?: string;
  };
  subscription_started: {
    plan: string;
    price?: number;
    currency?: string;
    trial_used?: boolean;
    source?: string;
  };
  subscription_renewed: {
    plan: string;
    price?: number;
    currency?: string;
  };
  subscription_cancelled: {
    plan: string;
    reason?: string;
  };
  subscription_expired: {
    plan: string;
  };
  restore_purchases_started: Record<string, never>;
  restore_purchases_completed: {
    restored_count: number;
  };
  restore_purchases_failed: {
    error_message: string;
  };

  // ============================================================================
  // Revenue Events
  // ============================================================================
  purchase: {
    revenue: number;
    currency: string;
    product_id: string;
  };

  // ============================================================================
  // Feature Usage Events
  // ============================================================================
  feature_used: {
    feature: string;
    context?: string;
  };
  button_clicked: {
    button_name: string;
    location: string;
    screen?: string;
  };

  // ============================================================================
  // User Actions
  // ============================================================================
  language_changed: {
    from_language: string;
    to_language: string;
  };
  theme_changed: {
    from_theme: string;
    to_theme: string;
  };
  notification_permission_requested: {
    granted: boolean;
  };
  notification_received: {
    notification_type: string;
    notification_id?: string;
  };
  notification_opened: {
    notification_type: string;
    notification_id?: string;
  };

  // ============================================================================
  // Error Events
  // ============================================================================
  error_occurred: {
    error_type: string;
    error_message: string;
    error_stack?: string | null;
  };
  api_error: {
    endpoint: string;
    method: string;
    status_code: number;
    error_message: string;
  };

  // ============================================================================
  // Group/Tenant Events
  // ============================================================================
  group_created: {
    group_id: string;
    group_name: string;
  };
  group_joined: {
    group_id: string;
    invite_code?: string;
  };
  group_left: {
    group_id: string;
  };
  invite_sent: {
    group_id: string;
    invite_count: number;
  };
  invite_accepted: {
    group_id: string;
    invite_code: string;
  };

  // ============================================================================
  // Search & Navigation
  // ============================================================================
  search_performed: {
    query: string;
    results_count: number;
  };
  deep_link_opened: {
    url: string;
    source: string;
  };

  // ============================================================================
  // Performance Events
  // ============================================================================
  app_cold_start: {
    duration_ms: number;
  };
  api_request_completed: {
    endpoint: string;
    duration_ms: number;
    status_code: number;
  };

  // Generic fallback
  [key: string]: AnalyticsProperties;
};

export interface Analytics {
  /**
   * Initialize the analytics instance
   */
  init(): Promise<void>;

  /**
   * Track an event
   */
  track<K extends keyof AppEvents>(event: K, properties?: AppEvents[K]): void;

  /**
   * Track a generic event (fallback)
   */
  track(event: string, properties?: AnalyticsProperties): void;

  /**
   * Identify a user
   */
  identify(userId: string, properties?: Partial<AnalyticsUser>): void;

  /**
   * Reset the current user (e.g., on logout)
   */
  reset(): void;

  /**
   * Alias for track (PostHog compatibility)
   */
  capture<K extends keyof AppEvents>(event: K, properties?: AppEvents[K]): void;

  capture(event: string, properties?: AnalyticsProperties): void;

  /**
   * Get the underlying PostHog client (mobile only)
   */
  getClient?(): unknown;
}
