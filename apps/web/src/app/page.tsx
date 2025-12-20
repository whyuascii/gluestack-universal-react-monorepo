"use client";

import { HomeScreen } from "@app/ui";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <HomeScreen
      onNavigateToSignup={() => router.push("/signup")}
      onNavigateToLogin={() => router.push("/login")}
    />
  );
}
