import { CreateGroupScreen, ROUTES, client } from "@app/ui";
import { useRouter, type Href } from "expo-router";

export default function CreateGroup() {
  const router = useRouter();

  const handleSubmit = async (name: string): Promise<void> => {
    await client.private.workspace.tenants.create({ name });
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
