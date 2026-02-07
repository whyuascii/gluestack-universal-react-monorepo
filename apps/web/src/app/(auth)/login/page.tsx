"use client";

import { LoginScreen, ROUTES } from "@app/ui";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginScreen
      onNavigateToSignup={() => router.push(ROUTES.SIGNUP.web)}
      onLoginSuccess={() => router.push(ROUTES.POST_LOGIN.web)}
    />
  );
}
