import { LoginScreen } from "@app/ui";
import { useRouter } from "expo-router";
import React from "react";

export default function Login() {
  const router = useRouter();

  return <LoginScreen onNavigateToSignup={() => router.push("/(auth)/signup")} />;
}
