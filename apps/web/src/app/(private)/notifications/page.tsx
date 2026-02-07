"use client";

import { NotificationsScreen, ROUTES } from "@app/ui";
import { useSession } from "@app/auth";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <NotificationsScreen
      session={session}
      onNotificationPress={(notification) => {
        if (notification.deepLink) {
          router.push(notification.deepLink);
        }
      }}
    />
  );
}
