"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { SignupScreen } from "ui";

export default function SignupPage() {
  const router = useRouter();

  return <SignupScreen onNavigateToLogin={() => router.push("/login")} />;
}
