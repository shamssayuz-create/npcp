import { seedData } from "@/lib/seed-data";
import type { AppData } from "@/lib/types";

export function normalizeDemoData(value: unknown): AppData {
  const data = value as Partial<AppData>;
  return {
    users: (data.users ?? seedData.users).map((user) => ({
      ...user,
      invitation_status: user.invitation_status ?? "Active",
      invited_at: user.invited_at ?? user.created_at ?? null,
      joined_at: user.joined_at ?? user.created_at ?? null
    })),
    courses: data.courses ?? seedData.courses,
    modules: data.modules ?? seedData.modules,
    activityLogs: data.activityLogs ?? seedData.activityLogs,
    notifications: data.notifications ?? seedData.notifications,
    customFields: data.customFields ?? seedData.customFields,
    customFieldValues: data.customFieldValues ?? seedData.customFieldValues
  };
}

export function readDemoData() {
  const saved = window.localStorage.getItem("cpos-demo-data");
  if (!saved) return seedData;
  try {
    return normalizeDemoData(JSON.parse(saved));
  } catch {
    return seedData;
  }
}
