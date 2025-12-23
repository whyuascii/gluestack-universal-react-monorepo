import { DashboardScreen, useSession } from "@app/ui";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <DashboardScreen
      session={session}
      onLogoutSuccess={() => {
        router.replace("/(auth)/login");
      }}
    />
  );
}
