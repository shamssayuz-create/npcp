import { AppShell } from "@/components/app/app-shell";
import { DashboardClient } from "@/app/dashboard/dashboard-client";
import { requireUser } from "@/lib/auth/require-user";

export default async function DashboardPage() {
  await requireUser();

  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
