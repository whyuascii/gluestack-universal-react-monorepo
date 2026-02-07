"use client";

import { HomeScreen } from "@app/ui";
import { ROUTES } from "@app/ui";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <HomeScreen
      onNavigateToLogin={() => router.push(ROUTES.LOGIN.web)}
      onNavigateToSignup={() => router.push(ROUTES.SIGNUP.web)}
      onNavigateToFeatures={() => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
      }}
      onNavigateToPricing={() => {
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      }}
      onNavigateToAbout={() => {
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
      }}
      onNavigateToPrivacy={() => router.push(ROUTES.PRIVACY.web)}
      onNavigateToTerms={() => router.push(ROUTES.TERMS.web)}
    />
  );
}
