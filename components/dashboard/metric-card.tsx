"use client";

import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/mock-data";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Sparkline } from "@/components/charts/sparkline";
import { DeltaChip } from "@/components/shared/delta-chip";

const GROWTH = "hsl(158 64% 52%)";
const INFO = "hsl(217 91% 60%)";

function tickerProps(kpi: Kpi): {
  prefix: string;
  suffix: string;
  decimals: number;
} {
  switch (kpi.format) {
    case "currency":
      return { prefix: "$", suffix: "", decimals: kpi.decimals ?? 0 };
    case "percent":
      return { prefix: "", suffix: "%", decimals: kpi.decimals ?? 1 };
    case "ratio":
      return { prefix: "", suffix: " : 1", decimals: kpi.decimals ?? 1 };
    case "months":
      return { prefix: "", suffix: " mo", decimals: kpi.decimals ?? 1 };
    case "x":
      return { prefix: "", suffix: "×", decimals: kpi.decimals ?? 1 };
    default:
      return { prefix: "", suffix: "", decimals: kpi.decimals ?? 0 };
  }
}

interface MetricCardProps {
  kpi: Kpi;
  delay?: number;
  className?: string;
}

/**
 * The signature instrument module: a mono count-up readout, a micro-sparkline,
 * and a WoW delta chip. Reused across the whole OS.
 */
export function MetricCard({ kpi, delay = 0, className }: MetricCardProps) {
  const { prefix, suffix, decimals } = tickerProps(kpi);
  const sparkColor = kpi.trend === "down" ? "hsl(350 89% 60%)" : kpi.positive ? GROWTH : INFO;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/15",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="eyebrow truncate">{kpi.label}</p>
          {kpi.target && (
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">
              {kpi.target}
            </p>
          )}
        </div>
        <DeltaChip delta={kpi.delta} trend={kpi.trend} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="font-num text-3xl font-semibold leading-none">
          <NumberTicker
            value={kpi.value}
            prefix={prefix}
            suffix={suffix}
            decimalPlaces={decimals}
            delay={delay}
          />
        </div>
      </div>

      <div className="mt-2 h-10 opacity-80">
        <Sparkline data={kpi.spark} color={sparkColor} height={40} />
      </div>
    </div>
  );
}
