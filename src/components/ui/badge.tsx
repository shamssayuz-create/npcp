import * as React from "react";
import { cn } from "@/lib/utils";

const tones = {
  blue: "bg-teal-50 text-teal-700 ring-teal-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  grey: "bg-slate-50 text-slate-600 ring-slate-200"
};

export function Badge({
  className,
  tone = "grey",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return <span className={cn("inline-flex rounded px-2 py-0.5 text-xs font-medium ring-1", tones[tone], className)} {...props} />;
}
