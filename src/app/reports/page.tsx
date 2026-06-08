import { AppShell } from "@/components/app/app-shell";
import { ReportsClient } from "@/app/reports/reports-client";
import { requireUser } from "@/lib/auth/require-user";

export default async function ReportsPage() {
  await requireUser();

  return (
    <AppShell>
      <ReportsClient />
    </AppShell>
  );
}
