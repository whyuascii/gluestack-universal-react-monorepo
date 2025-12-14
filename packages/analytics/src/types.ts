// Analytics event types for type-safe tracking

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Define your app's events here for type safety
export type AppEvents = {
  // Screen views
  screen_viewed: {
    screen_name: string;
    previous_screen?: string;
  };

  // Authentication
  signup_started: {
    method?: "email" | "google" | "apple";
  };
  signup_completed: {
    user_id: string;
    method: "email" | "google" | "apple";
  };
  login_started: {
    method?: "email" | "google" | "apple";
  };
  login_completed: {
    user_id: string;
    method: "email" | "google" | "apple";
  };
  logout: Record<string, never>;

  // User actions
  button_clicked: {
    button_name: string;
    location: string;
  };
  language_changed: {
    from_language: string;
    to_language: string;
  };

  // Add more events as needed
  [key: string]: AnalyticsProperties;
};

export interface Analytics {
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
}
