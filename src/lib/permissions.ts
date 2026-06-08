import type { Role } from "@/lib/types";

const permissions: Record<Role, string[]> = {
  "Super Admin": [
    "manage:all",
    "view:all_dashboards",
    "create:users",
    "edit:users",
    "assign:team_leaders",
    "view:reports",
    "manage:courses"
  ],
  Manager: ["create:courses", "assign:courses", "view:all_teams", "view:reports", "reassign:tasks", "manage:courses"],
  "Team Leader": ["view:team_tasks", "assign:team_courses", "monitor:workload", "view:team_reports"],
  "Team Member": ["view:assigned_tasks", "update:progress", "complete:modules", "complete:courses"]
};

export function can(role: Role, permission: string) {
  return permissions[role].includes("manage:all") || permissions[role].includes(permission);
}

export function visibleNavigation(role: Role) {
  const base = ["Dashboard", "Courses", "Reports"];
  if (role === "Super Admin" || role === "Manager") return [...base, "Users", "Settings"];
  if (role === "Team Leader") return [...base, "Users"];
  return base;
}
