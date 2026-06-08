import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  title,
  value,
  detail,
  icon: Icon
}: {
  title: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs text-muted-foreground">{title}</div>
          <div className="mt-0.5 text-xl font-semibold">{value}</div>
          {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
