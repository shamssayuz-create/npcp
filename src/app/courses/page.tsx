import { AppShell } from "@/components/app/app-shell";
import { CoursesClient } from "@/app/courses/courses-client";

export default function CoursesPage() {
  return (
    <AppShell>
      <CoursesClient />
    </AppShell>
  );
}
