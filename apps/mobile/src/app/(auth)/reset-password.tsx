import { ResetPasswordScreen, ROUTES } from "@app/ui";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import React from "react";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  // If no token, redirect to login
  React.useEffect(() => {
    if (!token) {
      router.push(ROUTES.LOGIN.mobile as Href);
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  const handleSuccess = () => {
    // Show success message briefly, then redirect to login
    setTimeout(() => {
      router.push(ROUTES.LOGIN.mobile as Href);
    }, 2000);
  };

  return <ResetPasswordScreen token={token} onSuccess={handleSuccess} />;
}
