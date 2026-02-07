import { PostLoginRouter, ROUTES } from "@app/ui";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";

/**
 * Post-login router - Determines where to send user after login
 *
 * - If user has an invite → Accept invite screen
 * - If user has no tenants → Create group screen
 * - If user has tenants → Dashboard
 */
export default function PostLogin() {
  const router = useRouter();
  const { invite } = useLocalSearchParams<{ invite?: string }>();

  const handleRouteDetermined = (route: { type: string; token?: string }) => {
    switch (route.type) {
      case "invite":
        router.replace(`${ROUTES.INVITE_ACCEPT.mobile}?token=${route.token}` as Href);
        break;
      case "createGroup":
        router.replace(ROUTES.CREATE_GROUP.mobile as Href);
        break;
      case "dashboard":
      default:
        router.replace(ROUTES.DASHBOARD.mobile as Href);
        break;
    }
  };

  return <PostLoginRouter inviteToken={invite} onRouteDetermined={handleRouteDetermined} />;
}
