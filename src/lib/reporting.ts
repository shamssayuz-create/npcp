import { differenceInCalendarDays, eachDayOfInterval, format, isWithinInterval, parseISO } from "date-fns";
import type { AppData, Course, CourseStatus, ReportFilters } from "@/lib/types";

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function inRange(date: string | null | undefined, filters: ReportFilters) {
  if (!date) return false;
  return isWithinInterval(parseISO(dateOnly(date)), {
    start: parseISO(filters.range.from),
    end: parseISO(filters.range.to)
  });
}

export function filterCourses(data: AppData, filters: ReportFilters) {
  return data.courses.filter((course) => {
    const user = data.users.find((item) => item.id === course.assigned_to);
    if (filters.team && filters.team !== "All" && user?.team_name !== filters.team) return false;
    if (filters.userId && filters.userId !== "All" && course.assigned_to !== filters.userId) return false;
    if (filters.category && filters.category !== "All" && course.category !== filters.category) return false;
    if (filters.subcategory && filters.subcategory !== "All" && course.subcategory !== filters.subcategory) return false;
    if (filters.status && filters.status !== "All" && course.status !== filters.status) return false;
    return true;
  });
}

export function reportingSnapshot(data: AppData, filters: ReportFilters) {
  const courses = filterCourses(data, filters);
  const completedCourses = courses.filter((course) => inRange(course.completion_date, filters));
  const modules = data.modules.filter((module) => {
    const course = courses.find((item) => item.id === module.course_id);
    return Boolean(course) && module.status === "Completed" && inRange(module.completed_date, filters);
  });
  const totalWordCount = completedCourses.reduce((sum, course) => sum + course.actual_word_count, 0);
  const completionDays = completedCourses.map((course) =>
    Math.max(1, differenceInCalendarDays(parseISO(course.completion_date ?? course.due_date), parseISO(course.assigned_date)) + 1)
  );

  return {
    courses,
    completedCourses,
    modules,
    totalWordCount,
    averageWordCountPerCourse: completedCourses.length ? totalWordCount / completedCourses.length : 0,
    averageCompletionTime: completionDays.length ? completionDays.reduce((sum, days) => sum + days, 0) / completionDays.length : 0
  };
}

export function dashboardMetrics(data: AppData, filters: ReportFilters) {
  const snapshot = reportingSnapshot(data, filters);
  const today = filters.range.to;
  const delayedCourses = snapshot.courses.filter((course) => course.status !== "Completed" && course.due_date < today);
  return {
    activeCourses: snapshot.courses.filter((course) => ["Assigned", "In Progress", "Review", "On Hold"].includes(course.status)).length,
    completedToday: snapshot.courses.filter((course) => course.completion_date === today).length,
    completedCourses: snapshot.completedCourses.length,
    delayedCourses: delayedCourses.length,
    modulesCompleted: snapshot.modules.length,
    totalWordCount: snapshot.totalWordCount,
    averageWordCountPerCourse: snapshot.averageWordCountPerCourse,
    averageCompletionTime: snapshot.averageCompletionTime
  };
}

export function dailyTrend(data: AppData, filters: ReportFilters) {
  const courses = filterCourses(data, filters);
  return eachDayOfInterval({ start: parseISO(filters.range.from), end: parseISO(filters.range.to) }).map((date) => {
    const day = format(date, "yyyy-MM-dd");
    const completed = courses.filter((course) => course.completion_date === day);
    return {
      date: format(date, "MMM d"),
      courses: completed.length,
      words: completed.reduce((sum, course) => sum + course.actual_word_count, 0),
      modules: data.modules.filter((module) => module.completed_date === day && courses.some((course) => course.id === module.course_id)).length
    };
  });
}

export function breakdownBy(data: AppData, filters: ReportFilters, key: "team" | "category" | "status" | "member") {
  const courses = filterCourses(data, filters);
  const map = new Map<string, { name: string; courses: number; completed: number; words: number }>();

  for (const course of courses) {
    const user = data.users.find((item) => item.id === course.assigned_to);
    const name =
      key === "team" ? user?.team_name ?? "Unassigned" : key === "member" ? user?.name ?? "Unassigned" : key === "category" ? course.category : course.status;
    const existing = map.get(name) ?? { name, courses: 0, completed: 0, words: 0 };
    existing.courses += 1;
    if (course.status === "Completed") {
      existing.completed += 1;
      existing.words += course.actual_word_count;
    }
    map.set(name, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.words - a.words || b.completed - a.completed);
}

export function workload(data: AppData) {
  return data.users
    .filter((user) => user.role === "Team Member" || user.role === "Team Leader")
    .map((user) => {
      const courses = data.courses.filter((course) => course.assigned_to === user.id);
      return {
        id: user.id,
        name: user.name,
        team: user.team_name,
        active: courses.filter((course) => course.status !== "Completed" && course.status !== "Cancelled").length,
        completed: courses.filter((course) => course.status === "Completed").length,
        words: courses.filter((course) => course.status === "Completed").reduce((sum, course) => sum + course.actual_word_count, 0)
      };
    })
    .sort((a, b) => b.active - a.active);
}

export function courseProgress(course: Course, moduleCount: number, completedModuleCount: number) {
  if (course.status === "Completed") return 100;
  if (moduleCount === 0) return course.status === "Assigned" ? 0 : 20;
  return Math.round((completedModuleCount / moduleCount) * 100);
}

export const courseStatuses: CourseStatus[] = ["Assigned", "In Progress", "Review", "Completed", "On Hold", "Cancelled"];
