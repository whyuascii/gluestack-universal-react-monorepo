"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InviteAcceptScreen,
  type InviteDetails,
  client,
  ROUTES,
  buildRoute,
  QUERY_PARAMS,
} from "@app/ui";

export default function InviteAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get(QUERY_PARAMS.TOKEN);

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setError("invalid");
        setLoading(false);
        return;
      }

      try {
        // Try to get user data with invite context
        const meData = await client.private.user.me.get({ invite: token });
        setIsAuthenticated(true);

        if (meData.pendingInvite) {
          setInviteDetails({
            token,
            groupName: meData.pendingInvite.tenantName,
            inviterName: meData.pendingInvite.inviterName,
          });
        } else {
          setError("invalid");
        }
      } catch (err: unknown) {
        // If unauthorized, user needs to login first
        const error = err as { code?: string };
        if (error?.code === "UNAUTHORIZED") {
          setIsAuthenticated(false);
        }
        setError("invalid");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleAccept = async (inviteToken: string): Promise<void> => {
    await client.private.workspace.invites.accept({ token: inviteToken });
  };

  const handleSignup = () => {
    router.push(buildRoute(ROUTES.SIGNUP.web, { [QUERY_PARAMS.INVITE_TOKEN]: token ?? undefined }));
  };

  const handleLogin = () => {
    router.push(buildRoute(ROUTES.LOGIN.web, { [QUERY_PARAMS.INVITE_TOKEN]: token ?? undefined }));
  };

  const handleSuccess = () => {
    router.push(ROUTES.DASHBOARD.web);
  };

  if (!token) {
    router.push(ROUTES.DASHBOARD.web);
    return null;
  }

  return (
    <InviteAcceptScreen
      token={token}
      isAuthenticated={isAuthenticated}
      inviteDetails={inviteDetails}
      loading={loading}
      error={error}
      onAccept={handleAccept}
      onSignup={handleSignup}
      onLogin={handleLogin}
      onSuccess={handleSuccess}
    />
  );
}
