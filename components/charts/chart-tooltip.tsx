"use client";

import type { TooltipProps } from "recharts";

// Shared dark tooltip for all recharts surfaces. Labels + values in mono.
export function ChartTooltip({
  active,
  payload,
  label,
  valuePrefix = "",
  valueSuffix = "",
}: TooltipProps<number, string> & {
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-md backdrop-blur">
      {label != null && (
        <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="capitalize text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
              {valuePrefix}
              {typeof entry.value === "number"
                ? entry.value.toLocaleString("en-US")
                : entry.value}
              {valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
