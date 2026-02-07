"use client";

/**
 * Private Layout - Authenticated pages
 *
 * Features:
 * - Auth guard (redirects to login if not authenticated)
 * - PrivateSidebar navigation
 * - Real-time notifications via SSE
 * - Inactivity logout for security
 */

import { useSession } from "@app/auth";
import { PrivateSidebar, ROUTES, useLogout, InactivityLogoutProvider } from "@app/ui";
import { NovuNotifications } from "@app/ui/notifications-web";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { logout, isLoggingOut } = useLogout({
    onSuccess: () => router.push(ROUTES.LOGIN.web),
  });

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace(ROUTES.LOGIN.web);
    }
  }, [session, isPending, router]);

  // Show nothing while checking auth
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  return (
    <InactivityLogoutProvider
      isAuthenticated={!!session}
      onLogout={logout}
      timeoutMinutes={15}
      showWarning={true}
      warningSeconds={60}
    >
      <PrivateSidebar
        session={session}
        isLoggingOut={isLoggingOut}
        NotificationComponent={NovuNotifications}
        onNavigateToDashboard={() => router.push(ROUTES.DASHBOARD.web)}
        onNavigateToTodos={() => router.push(ROUTES.TODOS.web)}
        onNavigateToGroup={() => router.push(ROUTES.GROUP.web)}
        onNavigateToSettings={() => router.push(ROUTES.SETTINGS.web)}
        onNavigateToProfile={() => router.push(ROUTES.PROFILE.web)}
        onLogout={logout}
      >
        <main className="min-h-screen bg-gray-50">{children}</main>
      </PrivateSidebar>
    </InactivityLogoutProvider>
  );
}
