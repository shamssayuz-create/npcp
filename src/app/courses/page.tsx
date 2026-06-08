import { AppShell } from "@/components/app/app-shell";
import { CoursesClient } from "@/app/courses/courses-client";
import { requireUser } from "@/lib/auth/require-user";

export default async function CoursesPage() {
  await requireUser();

  return (
    <AppShell>
      <CoursesClient />
    </AppShell>
  );
}
