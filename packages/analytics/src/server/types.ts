/**
 * Server-side Analytics Types
 */

export interface ServerAnalyticsConfig {
  apiKey: string;
  host?: string;
  flushAt?: number;
  flushInterval?: number;
}

export interface ServerAnalyticsContext {
  traceId: string;
  distinctId: string;
  sessionId?: string;
  timestamp?: number;
}

export interface ServerEventProperties {
  traceId?: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
}

export interface ServerUserProperties {
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | null | undefined;
}
