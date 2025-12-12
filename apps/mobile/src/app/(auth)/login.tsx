import { useRouter } from "expo-router";
import React from "react";
import { LoginScreen } from "ui";

export default function Login() {
  const router = useRouter();

  return <LoginScreen onNavigateToSignup={() => router.push("/(auth)/signup")} />;
}
