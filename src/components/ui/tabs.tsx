"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-md border bg-white p-1", className)}>
      {options.map((option) => (
        <button
          key={option}
          className={cn(
            "focus-ring h-7 rounded px-3 text-xs font-medium text-muted-foreground",
            value === option && "bg-primary text-primary-foreground"
          )}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
