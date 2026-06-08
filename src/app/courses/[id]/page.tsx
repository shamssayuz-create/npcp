import { AppShell } from "@/components/app/app-shell";
import { CourseDetailClient } from "@/app/courses/[id]/course-detail-client";
import { requireUser } from "@/lib/auth/require-user";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  return (
    <AppShell>
      <CourseDetailClient courseId={id} />
    </AppShell>
  );
}
