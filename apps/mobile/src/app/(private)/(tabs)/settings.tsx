import { useSession, signOut } from "@app/auth/client/native";
import { SettingsScreen, useActiveTenant, useHasTenants, ROUTES } from "@app/ui";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";

export default function Settings() {
  const { data: session } = useSession();
  const router = useRouter();
  const activeTenant = useActiveTenant();
  const hasTenants = useHasTenants();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace(ROUTES.LOGIN.mobile as Href);
    } catch (error) {
      console.error("[Settings] Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SettingsScreen
      userId={session?.user?.id}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
      activeTenantName={activeTenant?.tenantName}
      currentUserRole={activeTenant?.role}
      hasTenant={hasTenants}
      onNavigateToInvite={() => {
        router.push(ROUTES.GROUP_INVITE_MEMBERS.mobile as Href);
      }}
      onLeaveGroupSuccess={() => {
        router.replace(ROUTES.DASHBOARD.mobile as Href);
      }}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    />
  );
}
