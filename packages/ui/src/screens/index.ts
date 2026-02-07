/**
 * UI Screens - Restructured organization
 *
 * Structure:
 * - public/   - Web-only marketing pages (unauthenticated)
 * - auth/     - Login/signup screens (shared, unauthenticated)
 * - private/  - All authenticated screens (shared)
 *   - onboarding/    - Post-login setup flow
 *   - dashboard/     - Main dashboard
 *   - todos/         - Todo management
 *   - settings/      - User/group settings
 *   - profile/       - User profile
 *   - notifications/ - Notifications list
 *   - group/         - Group/tenant management
 */

// Public screens (web-only marketing)
export * from "./public";

// Auth screens (shared login/signup)
export * from "./auth";

// Private screens (all authenticated)
export * from "./private";
