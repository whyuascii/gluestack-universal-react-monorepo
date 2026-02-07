/**
 * Notification Provider (Base)
 *
 * Platform-agnostic provider interface.
 * Platform-specific implementations are in:
 * - NotificationProvider.web.tsx
 * - NotificationProvider.native.tsx
 */

import type { ReactNode } from "react";

export interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}
