"use client";

import { ResetPasswordScreen, ROUTES } from "@app/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ResetPasswordPage() {
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
    <ResetPasswordScreen
      token={token}
      onSuccess={() => {
        setTimeout(() => {
          router.push(ROUTES.LOGIN.web);
        }, 2000);
      }}
    />
  );
}
