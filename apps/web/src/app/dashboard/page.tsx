"use client";

import { DashboardScreen, useSession } from "@app/ui";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    router.replace("/login");
    return null;
  }

  return (
    <DashboardScreen
      session={session}
      onLogoutSuccess={() => {
        router.replace("/login");
      }}
    />
  );
}
