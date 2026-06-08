import { Badge } from "@/components/ui/badge";
import type { CourseStatus, ModuleStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: CourseStatus | ModuleStatus }) {
  const tone =
    status === "Completed"
      ? "green"
      : status === "In Progress" || status === "Review"
        ? "blue"
        : status === "On Hold"
          ? "amber"
          : status === "Cancelled"
            ? "red"
            : "grey";

  return <Badge tone={tone}>{status}</Badge>;
}
