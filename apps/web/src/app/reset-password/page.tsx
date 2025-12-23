"use client";

import { ResetPasswordScreen } from "@app/ui";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If no token, redirect to login
  React.useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  const handleSuccess = () => {
    // Show success message briefly, then redirect to login
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return <ResetPasswordScreen token={token} onSuccess={handleSuccess} />;
}
