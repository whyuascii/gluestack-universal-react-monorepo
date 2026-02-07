import { ALLOWED_EVENTS, isAllowedEvent, type AllowedEventName } from "./allowlist";

/**
 * PII patterns to strip from any property value
 */
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
];

/**
 * Check if a value contains potential PII
 */
function containsPII(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return PII_PATTERNS.some((pattern) => pattern.test(value));
}

export interface ScrubResult {
  success: true;
  event: AllowedEventName;
  properties: Record<string, unknown>;
}

export interface ScrubError {
  success: false;
  error: string;
}

/**
 * Validate event against allowlist and scrub properties
 * Returns only allowed properties, strips any containing PII
 */
export function scrubEvent(
  event: string,
  properties: Record<string, unknown> = {}
): ScrubResult | ScrubError {
  // Validate event is in allowlist
  if (!isAllowedEvent(event)) {
    return {
      success: false,
      error: `Event "${event}" is not in the allowlist`,
    };
  }

  const schema = ALLOWED_EVENTS[event];
  const allowedProps = new Set<string>(schema.properties as readonly string[]);
  const scrubbedProperties: Record<string, unknown> = {};

  // Only include allowed properties
  for (const [key, value] of Object.entries(properties)) {
    // Skip if property not in allowlist
    if (!allowedProps.has(key)) {
      continue;
    }

    // Skip if value contains PII
    if (containsPII(value)) {
      console.warn(`[Analytics] Stripped PII from property "${key}" in event "${event}"`);
      continue;
    }

    scrubbedProperties[key] = value;
  }

  return {
    success: true,
    event,
    properties: scrubbedProperties,
  };
}

/**
 * Check if event requires authentication
 */
export function eventRequiresAuth(event: AllowedEventName): boolean {
  const schema = ALLOWED_EVENTS[event] as { requiresAuth?: boolean };
  return schema.requiresAuth ?? false;
}
