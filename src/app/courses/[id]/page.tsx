import { AppShell } from "@/components/app/app-shell";
import { CourseDetailClient } from "@/app/courses/[id]/course-detail-client";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <CourseDetailClient courseId={id} />
    </AppShell>
  );
}
