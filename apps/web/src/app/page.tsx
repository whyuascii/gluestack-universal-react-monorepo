"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { HomeScreen } from "ui";

export default function Home() {
  const router = useRouter();

  return (
    <HomeScreen
      onNavigateToSignup={() => router.push("/signup")}
      onNavigateToLogin={() => router.push("/login")}
    />
  );
}
