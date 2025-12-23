"use client";

import { LoginScreen } from "@app/ui";
import { useRouter } from "next/navigation";
import React from "react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginScreen
      onNavigateToSignup={() => router.push("/signup")}
      onLoginSuccess={() => router.push("/dashboard")}
    />
  );
}
