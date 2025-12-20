"use client";

import { SignupScreen } from "@app/ui";
import { useRouter } from "next/navigation";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function SignupPage() {
  const router = useRouter();

  return <SignupScreen onNavigateToLogin={() => router.push("/login")} />;
}
