"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { LoginScreen } from "ui";

export default function LoginPage() {
  const router = useRouter();

  return <LoginScreen onNavigateToSignup={() => router.push("/signup")} />;
}
