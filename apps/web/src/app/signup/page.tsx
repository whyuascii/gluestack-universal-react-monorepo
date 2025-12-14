"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { SignupScreen } from "ui";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function SignupPage() {
  const router = useRouter();

  return <SignupScreen onNavigateToLogin={() => router.push("/login")} />;
}
