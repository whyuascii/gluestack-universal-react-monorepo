import { useSession } from "@app/ui";
import { Redirect } from "expo-router";

export default function Index() {
  const { data: session, isPending } = useSession();

  // Show nothing while loading session
  if (isPending) {
    return null;
  }

  // Mobile goes directly to login or dashboard (no marketing home page)
  if (session) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
