/**
 * Icon Colors - For use in icon `color` props where Tailwind classes don't work
 *
 * These values are derived from the theme in @app/tailwind-config.
 * When you change themes, update these to match.
 *
 * Usage:
 *   import { iconColors } from "@app/ui";
 *   <Icon color={iconColors.active} />
 *
 * IMPORTANT: Prefer Tailwind classes when possible (e.g., `className="text-primary-500"`).
 * Only use these constants for props that require color strings.
 */

// Import from your active theme
// eslint-disable-next-line @typescript-eslint/no-require-imports
const theme = require("@app/tailwind-config/themes/starter");

export const iconColors = {
  /** Active/selected state - primary brand color */
  active: theme.colors.primary[500] as string,
  /** Inactive/default state - muted content */
  inactive: theme.colors.typography[500] as string,
  /** Muted/disabled state */
  muted: theme.colors.typography[400] as string,
  /** Error state */
  error: theme.colors.error.icon as string,
  /** Success state */
  success: theme.colors.success.icon as string,
  /** Warning state */
  warning: theme.colors.warning.icon as string,
  /** Info state */
  info: theme.colors.info.icon as string,
} as const;

export type IconColorKey = keyof typeof iconColors;
