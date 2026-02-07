/**
 * UI configuration constants
 */

// ============================================================================
// Default URLs (fallbacks when env vars are not set)
// ============================================================================

export const DEFAULT_URLS = {
  API: "http://localhost:3030",
  WEB_APP: "http://localhost:3000",
} as const;

// ============================================================================
// Query Parameters
// ============================================================================

export const QUERY_PARAMS = {
  INVITE_TOKEN: "inviteToken",
  TOKEN: "token",
  EMAIL: "email",
  INVITE: "invite",
} as const;

// ============================================================================
// OG Image Dimensions
// ============================================================================

export const OG_IMAGE = {
  WIDTH: 1200,
  HEIGHT: 630,
  TWITTER_WIDTH: 1200,
  TWITTER_HEIGHT: 600,
  LOGO_WIDTH: 512,
  LOGO_HEIGHT: 512,
} as const;

// ============================================================================
// OG Image Layout
// ============================================================================

export const OG_LAYOUT = {
  PADDING: "40px 80px",
  DECORATIVE_BAR_HEIGHT: "8px",
  LOGO_BOX_SIZE: "60px",
  LOGO_MARGIN_BOTTOM: "40px",
  LOGO_MARGIN_RIGHT: "20px",
  ICON_SIZE: 36,
  BRAND_FONT_SIZE: "36px",
  TITLE_FONT_SIZE_LARGE: "64px",
  TITLE_FONT_SIZE_SMALL: "48px",
  TITLE_LENGTH_THRESHOLD: 30,
  SUBTITLE_FONT_SIZE: "24px",
  SUBTITLE_MAX_LENGTH: 100,
  FOOTER_FONT_SIZE: "18px",
} as const;
