import { AppShell } from "@/components/app/app-shell";
import { ReportsClient } from "@/app/reports/reports-client";

export default function ReportsPage() {
  return (
    <AppShell>
      <ReportsClient />
    </AppShell>
  );
}
