import { client, InviteAcceptScreen, type InviteDetails, ROUTES } from "@app/ui";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import { useState, useEffect } from "react";

export default function InviteAccept() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

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
          // Map API response to InviteDetails type
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
    router.push(ROUTES.SIGNUP.mobile as Href);
  };

  const handleLogin = () => {
    router.push(ROUTES.LOGIN.mobile as Href);
  };

  const handleSuccess = () => {
    router.replace(ROUTES.DASHBOARD.mobile as Href);
  };

  if (!token) {
    router.replace(ROUTES.DASHBOARD.mobile as Href);
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
