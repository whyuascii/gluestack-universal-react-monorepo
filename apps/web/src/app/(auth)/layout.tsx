"use client";

/**
 * Auth Layout - Login/signup pages
 *
 * Minimal layout with AuthNavbar styled like PublicNavbar.
 */

import { AuthNavbar, ROUTES } from "@app/ui";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <AuthNavbar
        showBack={false}
        showLanguageSwitcher={true}
        onNavigateToHome={() => router.push(ROUTES.HOME.web)}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
