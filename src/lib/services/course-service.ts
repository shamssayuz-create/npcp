import type { ActivityLog, Course, CourseModule, CourseStatus } from "@/lib/types";

export function createActivityLog(userId: string, courseId: string, action: ActivityLog["action"], details: ActivityLog["details"] = {}) {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    course_id: courseId,
    action,
    details,
    created_at: new Date().toISOString()
  } satisfies ActivityLog;
}

export function nextCourseStatusAfterModule(modules: CourseModule[]): CourseStatus {
  return modules.every((module) => module.status === "Completed") ? "Review" : "In Progress";
}

export function isDelayed(course: Course, today: string) {
  return course.status !== "Completed" && course.status !== "Cancelled" && course.due_date < today;
}
