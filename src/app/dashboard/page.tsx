import { AppShell } from "@/components/app/app-shell";
import { DashboardClient } from "@/app/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
