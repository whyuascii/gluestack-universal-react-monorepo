"use client";

import { SignupScreen } from "@app/ui";
import { useRouter } from "next/navigation";
import React from "react";

export default function SignupPage() {
  const router = useRouter();

  return (
    <SignupScreen
      onNavigateToLogin={() => router.push("/login")}
      onSignupSuccess={() => router.push("/dashboard")}
    />
  );
}
