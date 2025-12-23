"use client";

import { authClient } from "@app/auth";
import { VerifyEmailScreen, useSession } from "@app/ui";
import { useRouter } from "next/navigation";
import React from "react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  // If no user, redirect to login
  React.useEffect(() => {
    if (!user?.email) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user?.email) {
    return null;
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return <VerifyEmailScreen email={user.email} onSignOut={handleSignOut} />;
}
