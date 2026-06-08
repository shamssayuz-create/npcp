"use client";

import { Select } from "@/components/ui/input";
import type { AppData, CourseStatus, ReportFilters } from "@/lib/types";
import { courseStatuses } from "@/lib/reporting";

export function ReportFilterBar({
  data,
  filters,
  onChange,
  includeStatus = true
}: {
  data: AppData;
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  includeStatus?: boolean;
}) {
  const teams = ["All", ...Array.from(new Set(data.users.map((user) => user.team_name)))];
  const categories = ["All", ...Array.from(new Set(data.courses.map((course) => course.category)))];
  const subcategories = ["All", ...Array.from(new Set(data.courses.map((course) => course.subcategory)))];
  const users = ["All", ...data.users.filter((user) => user.role !== "Super Admin").map((user) => user.id)];

  return (
    <div className="mb-4 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
      <input
        className="focus-ring h-9 rounded-md border px-3 text-sm"
        type="date"
        value={filters.range.from}
        onChange={(event) => onChange({ ...filters, range: { ...filters.range, from: event.target.value } })}
      />
      <input
        className="focus-ring h-9 rounded-md border px-3 text-sm"
        type="date"
        value={filters.range.to}
        onChange={(event) => onChange({ ...filters, range: { ...filters.range, to: event.target.value } })}
      />
      <Select value={filters.team ?? "All"} onChange={(event) => onChange({ ...filters, team: event.target.value })}>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </Select>
      <Select value={filters.userId ?? "All"} onChange={(event) => onChange({ ...filters, userId: event.target.value })}>
        {users.map((userId) => {
          const user = data.users.find((item) => item.id === userId);
          return (
            <option key={userId} value={userId}>
              {user?.name ?? userId}
            </option>
          );
        })}
      </Select>
      <Select value={filters.category ?? "All"} onChange={(event) => onChange({ ...filters, category: event.target.value })}>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      {includeStatus ? (
        <Select
          value={filters.status ?? "All"}
          onChange={(event) => onChange({ ...filters, status: event.target.value as CourseStatus | "All" })}
        >
          {["All", ...courseStatuses].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      ) : (
        <Select value={filters.subcategory ?? "All"} onChange={(event) => onChange({ ...filters, subcategory: event.target.value })}>
          {subcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
