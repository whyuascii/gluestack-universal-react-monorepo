"use client";

import { VerifyEmailScreen, VerifyEmailTokenScreen, ROUTES } from "@app/ui";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // If we have a token, show token verification screen
  if (token) {
    return (
      <VerifyEmailTokenScreen
        token={token}
        onSuccess={() => router.push(ROUTES.POST_LOGIN.web)}
        onError={() => router.push(ROUTES.LOGIN.web)}
      />
    );
  }

  // Otherwise show the verify email screen (e.g., after signup)
  return (
    <VerifyEmailScreen
      email={email ?? undefined}
      onBackToLogin={() => router.push(ROUTES.LOGIN.web)}
    />
  );
}
