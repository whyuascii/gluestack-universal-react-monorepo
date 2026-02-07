"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/stores/admin-auth";

/**
 * Root page - redirects based on auth state
 */
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAdminAuthStore();

  useEffect(() => {
    const verify = async () => {
      const isValid = await checkAuth();
      if (isValid) {
        // Already authenticated, go to dashboard
        router.replace("/overview");
      } else {
        // Not authenticated, go to login
        router.replace("/login");
      }
    };
    verify();
  }, [checkAuth, router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  );
}
