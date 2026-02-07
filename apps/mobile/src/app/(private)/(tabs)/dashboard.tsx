import type { Session } from "@app/auth";
import { useSession } from "@app/auth/client/native";
import { DashboardScreen } from "@app/ui";

export default function Dashboard() {
  const { data: session } = useSession();

  // Cast to Session type to handle ipAddress: null vs undefined mismatch
  return <DashboardScreen session={session as Session | null} />;
}
