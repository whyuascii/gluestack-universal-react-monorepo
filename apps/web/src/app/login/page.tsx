"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { LoginScreen } from "ui";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();

  return <LoginScreen onNavigateToSignup={() => router.push("/signup")} />;
}
