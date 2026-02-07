import { InviteMembersScreen, ROUTES, client, useActiveTenant } from "@app/ui";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";

export default function InviteMembers() {
  const router = useRouter();
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const activeTenant = useActiveTenant();

  // If no tenantId, redirect to dashboard
  if (!tenantId) {
    router.replace(ROUTES.DASHBOARD.mobile as Href);
    return null;
  }

  const handleSubmit = async (emails: string[]): Promise<void> => {
    await client.private.workspace.tenants.sendInvites({ id: tenantId, emails });
  };

  const handleSkip = () => {
    router.replace(ROUTES.DASHBOARD.mobile as Href);
  };

  const handleSuccess = () => {
    router.replace(ROUTES.DASHBOARD.mobile as Href);
  };

  return (
    <InviteMembersScreen
      tenantName={activeTenant?.tenantName}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onSkip={handleSkip}
      onBack={() => {
        router.back();
      }}
    />
  );
}
