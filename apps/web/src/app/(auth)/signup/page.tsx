"use client";

import { SignupScreen, ROUTES } from "@app/ui";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <SignupScreen
      onNavigateToLogin={() => router.push(ROUTES.LOGIN.web)}
      onSignupSuccess={() => router.push(ROUTES.VERIFY_EMAIL.web)}
    />
  );
}
