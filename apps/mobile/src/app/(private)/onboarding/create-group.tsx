import { useState } from "react";
import { CreateGroupScreen, ROUTES, client } from "@app/ui";
import { useRouter, type Href } from "expo-router";

export default function CreateGroup() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);

  const handleSubmit = async (name: string): Promise<void> => {
    const data = await client.private.workspace.tenants.create({ name });
    setTenantId(data.tenantId);
  };

  const handleSuccess = (id: string) => {
    // Navigate to invite members with tenantId
    router.push(`${ROUTES.INVITE_MEMBERS.mobile}?tenantId=${id}` as Href);
  };

  return (
    <CreateGroupScreen
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onSkip={() => {
        router.replace(ROUTES.DASHBOARD.mobile as Href);
      }}
      onBack={() => {
        router.back();
      }}
    />
  );
}
