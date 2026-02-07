"use client";

import { DashboardScreen } from "@app/ui";
import { useSession } from "@app/auth";

export default function DashboardPage() {
  const { data: session } = useSession();

  return <DashboardScreen session={session} />;
}
