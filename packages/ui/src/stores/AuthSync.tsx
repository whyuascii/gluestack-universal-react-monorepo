/**
 * Auth Sync Component
 *
 * Bridges Better Auth's session with Zustand store.
 * Place this component at the root of your app to sync auth state.
 *
 * Usage:
 *   <QueryClientProvider client={queryClient}>
 *     <AuthSync />
 *     <App />
 *   </QueryClientProvider>
 *
 * With subscriptions:
 *   <QueryClientProvider client={queryClient}>
 *     <RevenueCatProvider userId={session?.user?.id}>
 *       <AuthSync enableSubscriptions />
 *       <App />
 *     </RevenueCatProvider>
 *   </QueryClientProvider>
 */

import { useSession } from "@app/auth";
import { useEffect } from "react";
import { useMe } from "../hooks/queries/useMe";
import { useAuthStore } from "./authStore";
import { useTenantStore } from "./tenantStore";

interface AuthSyncProps {
  /**
   * Enable subscription sync with RevenueCat.
   * When true, includes SubscriptionSync component functionality.
   * Requires app to be wrapped in RevenueCatProvider.
   * @default false
   */
  enableSubscriptions?: boolean;
  /**
   * Callback when subscription status changes (only when enableSubscriptions is true)
   */
  onSubscriptionChange?: (isPremium: boolean) => void;
}

export function AuthSync({
  enableSubscriptions = false,
  onSubscriptionChange,
}: AuthSyncProps = {}) {
  const { data: sessionData, isPending } = useSession();
  const setSession = useAuthStore((state) => state.setSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Sync Better Auth session with Zustand
  useEffect(() => {
    setSession(sessionData ?? null, isPending);
  }, [sessionData, isPending, setSession]);

  // Load tenant store from storage on mount
  const loadFromStorage = useTenantStore((state) => state.loadFromStorage);
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Sync tenant data when authenticated
  const { data: meData } = useMe({ enabled: isAuthenticated });
  const syncWithServer = useTenantStore((state) => state.syncWithServer);

  useEffect(() => {
    if (meData?.tenantContext) {
      syncWithServer(meData.tenantContext.activeTenantId, meData.tenantContext.memberships);
    }
  }, [meData, syncWithServer]);

  // Subscription sync is handled by SubscriptionSync component
  // which should be used alongside AuthSync when subscriptions are enabled
  // The SubscriptionSync component reads from useAuthStore for user data

  return null;
}
