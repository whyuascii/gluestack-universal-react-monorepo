"use client";

import { SettingsScreen, ROUTES, useActiveTenant, useHasTenants } from "@app/ui";
import { useSession, authClient } from "@app/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const activeTenant = useActiveTenant();
  const hasTenants = useHasTenants();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push(ROUTES.LOGIN.web);
    } catch (error) {
      console.error("[Settings] Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SettingsScreen
      userId={userId}
      userName={userName}
      userEmail={userEmail}
      activeTenantName={activeTenant?.tenantName}
      currentUserRole={activeTenant?.role}
      hasTenant={hasTenants}
      onNavigateToInvite={() => router.push(ROUTES.INVITE_MEMBERS.web)}
      onLeaveGroupSuccess={() => router.push(ROUTES.DASHBOARD.web)}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    />
  );
}
