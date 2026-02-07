/**
 * Screen Types
 *
 * Common types for screen components.
 */

/**
 * Base props that all screens can accept
 */
export interface ScreenProps {
  testID?: string;
}

/**
 * Props for screens that need navigation callbacks
 */
export interface NavigationProps {
  onNavigateBack?: () => void;
  onNavigateHome?: () => void;
}
