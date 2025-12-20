import { SignupScreen } from "@app/ui";
import { useRouter } from "expo-router";
import React from "react";

export default function Signup() {
  const router = useRouter();

  return <SignupScreen onNavigateToLogin={() => router.push("/(auth)/login")} />;
}
