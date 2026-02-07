import { useEffect, useState } from "react";
import { useMe } from "../queries/useMe";

export type PostLoginRoute =
  | { type: "dashboard" }
  | { type: "accept-invite"; token: string }
  | { type: "create-group" };

interface UsePostLoginRouterOptions {
  inviteToken?: string | null;
}

export function usePostLoginRouter({ inviteToken }: UsePostLoginRouterOptions = {}) {
  const [route, setRoute] = useState<PostLoginRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the existing useMe hook which uses oRPC properly
  // Always refetch on mount to get fresh data after tenant creation
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError,
  } = useMe({
    inviteToken: inviteToken ?? undefined,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    // If there's an error or no data, fallback to dashboard
    if (isError || !userData) {
      setRoute({ type: "dashboard" });
      setIsLoading(false);
      return;
    }

    // Routing decision logic
    const { tenantContext } = userData;

    // Priority 1: Handle invite token
    if (inviteToken) {
      setRoute({ type: "accept-invite", token: inviteToken });
      setIsLoading(false);
      return;
    }

    // Priority 2: Check if user has any tenant membership
    // User should go to dashboard if they have any membership OR an active tenant
    const hasMemberships = (tenantContext?.memberships?.length ?? 0) > 0;
    const hasActiveTenant = !!tenantContext?.activeTenantId;

    if (hasMemberships || hasActiveTenant) {
      setRoute({ type: "dashboard" });
      setIsLoading(false);
      return;
    }

    // Priority 3: User needs to create a group (no memberships at all)
    setRoute({ type: "create-group" });
    setIsLoading(false);
  }, [userData, isLoadingUser, isError, inviteToken]);

  return {
    route,
    isLoading,
  };
}
