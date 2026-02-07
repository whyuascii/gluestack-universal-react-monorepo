"use client";

import { PostLoginRouter, ROUTES } from "@app/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function PostLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const handleRouteDetermined = useCallback(
    (route: { type: string; token?: string }) => {
      switch (route.type) {
        case "dashboard":
          router.replace(ROUTES.DASHBOARD.web);
          break;
        case "create-group":
          router.replace(ROUTES.CREATE_GROUP.web);
          break;
        case "accept-invite":
          router.replace(`${ROUTES.INVITE_ACCEPT.web}?token=${route.token}`);
          break;
        default:
          router.replace(ROUTES.DASHBOARD.web);
      }
    },
    [router]
  );

  return <PostLoginRouter inviteToken={inviteToken} onRouteDetermined={handleRouteDetermined} />;
}
