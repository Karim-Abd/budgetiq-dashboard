import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** semantic direction of a change, independent of its sign */
export type Trend = "up" | "down" | "neutral";

interface DeltaChipProps {
  delta: number;
  /** semantic direction: up=good(green), down=bad(red), neutral=info(blue) */
  trend: Trend;
  className?: string;
  suffix?: string;
}

// Arrow direction follows the sign of the change; color follows whether the
// movement is good (green), bad/critical (red) or merely informational (blue).
export function DeltaChip({ delta, trend, className, suffix = "%" }: DeltaChipProps) {
  const Arrow = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : ArrowRight;
  const tone =
    trend === "up"
      ? "text-growth bg-growth/10"
      : trend === "down"
        ? "text-critical bg-critical/10"
        : "text-info bg-info/10";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums",
        tone,
        className,
      )}
    >
      <Arrow className="h-3 w-3" />
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)}
      {suffix}
    </span>
  );
}
