"use client";

import { HomeScreen } from "@app/ui/web";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <HomeScreen
      onNavigateToLogin={() => router.push("/login")}
      onNavigateToSignup={() => router.push("/signup")}
    />
  );
}
