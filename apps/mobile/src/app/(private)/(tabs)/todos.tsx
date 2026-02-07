import type { Session } from "@app/auth";
import { useSession } from "@app/auth/client/native";
import { TodosScreen } from "@app/ui";

export default function Todos() {
  const { data: session } = useSession();

  // Cast to Session type to handle ipAddress: null vs undefined mismatch
  return <TodosScreen session={session as Session | null} />;
}
