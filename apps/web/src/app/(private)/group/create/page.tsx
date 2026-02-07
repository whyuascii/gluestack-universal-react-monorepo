"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { CreateGroupScreen, ROUTES, useCreateTenant } from "@app/ui";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();
  const createTenant = useCreateTenant();
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);

  const handleSubmit = async (name: string): Promise<void> => {
    const result = await createTenant.mutateAsync({ name });
    setCreatedTenantId(result.tenantId);
  };

  const handleSuccess = (tenantId: string) => {
    router.push(`${ROUTES.INVITE_MEMBERS.web}?tenantId=${tenantId}`);
  };

  return (
    <CreateGroupScreen
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onSkip={() => router.push(ROUTES.DASHBOARD.web)}
      onBack={() => router.back()}
    />
  );
}
