import { useRouter } from "expo-router";
import React from "react";
import { SignupScreen } from "ui";

export default function Signup() {
  const router = useRouter();

  return <SignupScreen onNavigateToLogin={() => router.push("/(auth)/login")} />;
}
