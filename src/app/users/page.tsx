import { AppShell } from "@/components/app/app-shell";
import { UsersClient } from "@/app/users/users-client";
import { requireUser } from "@/lib/auth/require-user";

export default async function UsersPage() {
  await requireUser();

  return (
    <AppShell>
      <UsersClient />
    </AppShell>
  );
}
