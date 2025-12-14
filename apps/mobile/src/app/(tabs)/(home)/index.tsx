import { HomeScreen } from "ui";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <HomeScreen
      onNavigateToLogin={() => router.push("/(auth)/login")}
      onNavigateToSignup={() => router.push("/(auth)/signup")}
    />
  );
}
