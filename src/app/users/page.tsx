import { AppShell } from "@/components/app/app-shell";
import { UsersClient } from "@/app/users/users-client";

export default function UsersPage() {
  return (
    <AppShell>
      <UsersClient />
    </AppShell>
  );
}
