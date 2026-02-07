"use client";

import { AdminInviteScreen, ROUTES } from "@app/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AdminInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      router.push(ROUTES.LOGIN.web);
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <AdminInviteScreen
      token={token}
      onSuccess={() => {
        // After setting password, redirect to login to authenticate
        setTimeout(() => {
          router.push(ROUTES.LOGIN.web);
        }, 2000);
      }}
      onError={(error) => {
        console.error("[AdminInvite] Error:", error);
      }}
    />
  );
}
