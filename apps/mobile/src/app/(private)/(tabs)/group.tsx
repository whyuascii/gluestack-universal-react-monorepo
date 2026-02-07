import { useSession } from "@app/auth/client/native";
import { GroupScreen, useActiveTenant, ROUTES } from "@app/ui";
import { useRouter, type Href } from "expo-router";

export default function Group() {
  const { data: session } = useSession();
  const router = useRouter();
  const activeTenant = useActiveTenant();

  return (
    <GroupScreen
      session={session as any}
      tenantName={activeTenant?.tenantName}
      tenantId={activeTenant?.tenantId}
      userRole={activeTenant?.role}
      onNavigateToInvite={() => {
        router.push(ROUTES.GROUP_INVITE_MEMBERS.mobile as Href);
      }}
      onNavigateToSettings={() => {
        router.push(ROUTES.SETTINGS.mobile as Href);
      }}
      onNavigateToCreateGroup={() => {
        router.push(ROUTES.CREATE_GROUP.mobile as Href);
      }}
    />
  );
}
