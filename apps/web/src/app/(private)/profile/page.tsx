"use client";

import { ProfileScreen } from "@app/ui";
import { useSession } from "@app/auth";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <ProfileScreen
      session={session}
      onEditProfile={() => {
        // TODO: Implement edit profile modal/page
        console.log("Edit profile");
      }}
      onChangePassword={() => {
        // TODO: Implement change password modal/page
        console.log("Change password");
      }}
    />
  );
}
