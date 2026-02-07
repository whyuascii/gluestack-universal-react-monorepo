"use client";

export const dynamic = "force-dynamic";

import { InviteMembersScreen, ROUTES, useActiveTenant, client } from "@app/ui";
import { useRouter, useSearchParams } from "next/navigation";

export default function InviteMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const activeTenant = useActiveTenant();

  // Use passed tenantId or active tenant
  const effectiveTenantId = tenantId || activeTenant?.tenantId;
  const tenantName = activeTenant?.tenantName || "Your Group";

  const handleSubmit = async (emails: string[]): Promise<void> => {
    if (!effectiveTenantId) return;
    await client.private.workspace.tenants.sendInvites({ id: effectiveTenantId, emails });
  };

  return (
    <InviteMembersScreen
      tenantName={tenantName}
      onSubmit={handleSubmit}
      onSuccess={() => router.push(ROUTES.DASHBOARD.web)}
      onSkip={() => router.push(ROUTES.DASHBOARD.web)}
      onBack={() => router.back()}
    />
  );
}
