import { cn } from "@/lib/utils";
import type { Trend } from "@/lib/mock-data";
import { DeltaChip } from "@/components/shared/delta-chip";
import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  delta?: number;
  trend?: Trend;
  accent?: "growth" | "info" | "muted";
  className?: string;
}

// Compact, non-animated metric tile for secondary stats inside component pages.
export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  delta,
  trend = "neutral",
  accent = "muted",
  className,
}: StatTileProps) {
  const accentText =
    accent === "growth" ? "text-growth" : accent === "info" ? "text-info" : "text-muted-foreground";
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/15",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow truncate">{label}</p>
        {Icon ? (
          <Icon className={cn("h-4 w-4", accentText)} />
        ) : delta !== undefined ? (
          <DeltaChip delta={delta} trend={trend} />
        ) : null}
      </div>
      <p className="mt-2 font-num text-2xl font-semibold leading-none">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
