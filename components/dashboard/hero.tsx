"use client";

import { TrendingUp, Users, Timer } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { DeltaChip } from "@/components/shared/delta-chip";

export interface HeroData {
  totalUsers: number;
  mrr: number;
  arr: number;
  runway: number;
  cashOnHand: number;
  burn: number;
  stickiness: number;
  mrrDelta: number;
  criticalCount: number;
}

export function DashboardHero({ data }: { data: HeroData }) {
  const headlines = [
    {
      label: "Total users",
      icon: Users,
      value: data.totalUsers,
      delta: 0,
      trend: "neutral" as const,
      beamFrom: "#3b82f6",
      beamTo: "#34d399",
      caption: "registered accounts",
    },
    {
      label: "MRR",
      icon: TrendingUp,
      value: data.mrr,
      prefix: "$",
      delta: data.mrrDelta,
      trend: (data.mrrDelta > 0 ? "up" : data.mrrDelta < 0 ? "down" : "neutral") as
        | "up"
        | "down"
        | "neutral",
      beamFrom: "#34d399",
      beamTo: "#3b82f6",
      caption: `$${(data.arr / 1000).toFixed(1)}K ARR run-rate`,
    },
    {
      label: "Runway",
      icon: Timer,
      value: data.runway,
      suffix: " mo",
      decimals: 1,
      delta: 0,
      trend: "neutral" as const,
      beamFrom: "#38bdf8",
      beamTo: "#34d399",
      caption: `$${(data.cashOnHand / 1000).toFixed(1)}K cash · $${(data.burn / 1000).toFixed(1)}K burn`,
    },
  ];

  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card/50">
      <AnimatedGridPattern
        numSquares={26}
        maxOpacity={0.07}
        duration={4}
        repeatDelay={0.8}
        className={cn(
          "inset-0 h-full w-full skew-y-0 text-info/40",
          "[mask-image:radial-gradient(520px_circle_at_top_right,white,transparent)]",
        )}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-info/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-growth/10 blur-3xl" />

      <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
        <div className="max-w-xl">
          <p className="eyebrow">BudgetIQ · Command Center</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
            Everything that runs BudgetIQ, in one place.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.totalUsers > 0 || data.mrr > 0 ? (
              <>
                Stickiness sits at{" "}
                <span className="font-mono text-growth">{data.stickiness.toFixed(1)}%</span> and MRR
                is{" "}
                <span className={cn("font-mono", data.mrrDelta >= 0 ? "text-growth" : "text-critical")}>
                  {data.mrrDelta >= 0 ? "+" : ""}
                  {data.mrrDelta.toFixed(1)}%
                </span>{" "}
                week-over-week.
                {data.criticalCount > 0 && (
                  <>
                    {" "}
                    <span className="text-critical">{data.criticalCount} critical flag{data.criticalCount > 1 ? "s" : ""}</span> need attention.
                  </>
                )}
              </>
            ) : (
              <>Start by entering your metrics — every card below fills in as you add data.</>
            )}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-[560px]">
          {headlines.map((h, i) => {
            const Icon = h.icon;
            return (
              <div
                key={h.label}
                className="relative overflow-hidden rounded-xl border border-border bg-background/60 p-4 backdrop-blur"
              >
                <BorderBeam size={56} duration={7 + i} delay={i * 2} colorFrom={h.beamFrom} colorTo={h.beamTo} borderWidth={1.5} />
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <DeltaChip delta={h.delta} trend={h.trend} />
                </div>
                <div className="mt-3 font-num text-2xl font-semibold leading-none">
                  <NumberTicker value={h.value} prefix={h.prefix ?? ""} suffix={h.suffix ?? ""} decimalPlaces={h.decimals ?? 0} delay={0.15 * i} />
                </div>
                <p className="mt-1.5 eyebrow truncate normal-case tracking-normal">{h.label}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{h.caption}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
