import type { AppData, ActivityLog, Course, CourseModule, CustomFieldDefinition, CustomFieldValue, Notification, User } from "@/lib/types";

export const users: User[] = [];
export const courses: Course[] = [];
export const modules: CourseModule[] = [];
export const activityLogs: ActivityLog[] = [];
export const notifications: Notification[] = [];
export const customFields: CustomFieldDefinition[] = [];
export const customFieldValues: CustomFieldValue[] = [];

export const seedData: AppData = {
  users,
  courses,
  modules,
  activityLogs,
  notifications,
  customFields,
  customFieldValues
};
