"use client";

import { GroupScreen, ROUTES } from "@app/ui";
import { useSession } from "@app/auth";
import { useRouter } from "next/navigation";

export default function GroupPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // TODO: Get these from tenant context
  const tenantName = "My Group"; // Replace with actual tenant data
  const tenantId = "tenant-123"; // Replace with actual tenant ID
  const memberCount = 3; // Replace with actual count
  const userRole = "owner" as const; // Replace with actual role

  return (
    <GroupScreen
      session={session}
      tenantName={tenantName}
      tenantId={tenantId}
      memberCount={memberCount}
      userRole={userRole}
      onNavigateToInvite={() => router.push(ROUTES.INVITE_MEMBERS.web)}
      onNavigateToSettings={() => router.push(ROUTES.SETTINGS.web)}
      onNavigateToCreateGroup={() => router.push(ROUTES.CREATE_GROUP.web)}
    />
  );
}
