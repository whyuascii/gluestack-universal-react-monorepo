"use client";

import { TodosScreen } from "@app/ui";
import { useSession } from "@app/auth";

export default function TodosPage() {
  const { data: session } = useSession();

  return <TodosScreen session={session} />;
}
