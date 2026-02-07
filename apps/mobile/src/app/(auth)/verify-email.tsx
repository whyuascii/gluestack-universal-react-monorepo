import { authClient, useSession } from "@app/auth/client/native";
import { VerifyEmailScreen, VerifyEmailTokenScreen, ROUTES } from "@app/ui";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import React, { useEffect, useCallback } from "react";

export default function VerifyEmail() {
  const router = useRouter();
  const { token, email: emailParam } = useLocalSearchParams<{ token?: string; email?: string }>();
  const { data: session, refetch } = useSession();
  const user = session?.user;

  // Determine the email to use
  const email = emailParam || user?.email;

  // Redirect to login if no email available (must be called before any conditional returns)
  useEffect(() => {
    if (!token && !email) {
      router.push(ROUTES.LOGIN.mobile as Href);
    }
  }, [token, email, router]);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    router.push(ROUTES.LOGIN.mobile as Href);
  }, [router]);

  const handleBackToLogin = useCallback(() => {
    router.push(ROUTES.LOGIN.mobile as Href);
  }, [router]);

  const handleVerificationSuccess = useCallback(async () => {
    // Refetch session to update the auth state before navigating
    await refetch();
    router.push(ROUTES.POST_LOGIN.mobile as Href);
  }, [refetch, router]);

  // If we have a token, show the verification screen
  if (token) {
    return (
      <VerifyEmailTokenScreen
        token={token}
        onSuccess={handleVerificationSuccess}
        onError={() => router.push(ROUTES.LOGIN.mobile as Href)}
      />
    );
  }

  // If no email available, show nothing (redirect will happen via useEffect)
  if (!email) {
    return null;
  }

  // If we have an email parameter (from signup), show verify screen without sign out
  if (emailParam && !user) {
    return <VerifyEmailScreen email={emailParam} onSignOut={handleBackToLogin} />;
  }

  return <VerifyEmailScreen email={email} onSignOut={handleSignOut} />;
}
