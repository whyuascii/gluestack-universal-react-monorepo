"use client";

import { LoginScreen } from "@app/ui";
import { useRouter } from "next/navigation";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();

  return <LoginScreen onNavigateToSignup={() => router.push("/signup")} />;
}
