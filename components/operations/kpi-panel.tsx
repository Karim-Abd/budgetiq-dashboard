"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { DeltaChip } from "@/components/shared/delta-chip";
import type { Trend } from "@/lib/mock-data";

const GROWTH = "hsl(158 64% 52%)";
const INFO = "hsl(217 91% 60%)";

export interface KpiWeekRow {
  week: string;
  growth: number;
  activation: number;
  retentionD7: number;
  churn: number;
  nps: number;
  supportResolution: number;
}

interface KpiDef {
  key: keyof Omit<KpiWeekRow, "week">;
  label: string;
  suffix: string;
  inverse?: boolean;
}

const defs: KpiDef[] = [
  { key: "growth", label: "User growth WoW", suffix: "%" },
  { key: "activation", label: "Activation rate", suffix: "%" },
  { key: "retentionD7", label: "Day-7 retention", suffix: "%" },
  { key: "churn", label: "Monthly churn", suffix: "%", inverse: true },
  { key: "nps", label: "NPS", suffix: "" },
  { key: "supportResolution", label: "Support resolution", suffix: "%" },
];

export function KpiPanel({ series }: { series: KpiWeekRow[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Operational KPIs</CardTitle>
        <p className="text-xs text-muted-foreground">
          Trends from your weekly KPI entries
        </p>
      </CardHeader>
      <CardContent>
        {series.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No weekly KPIs yet — add them under the “Weekly KPIs” tab.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {defs.map((d) => {
              const data = series.map((w) => w[d.key]);
              const latest = data[data.length - 1] ?? 0;
              const prev = data[data.length - 2] ?? 0;
              const deltaRaw = prev ? ((latest - prev) / prev) * 100 : 0;
              const improving = d.inverse ? deltaRaw < 0 : deltaRaw > 0;
              const trend: Trend = deltaRaw === 0 ? "neutral" : improving ? "up" : "down";
              const color = d.inverse ? INFO : GROWTH;
              return (
                <div key={d.key} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow truncate">{d.label}</span>
                    <DeltaChip delta={deltaRaw} trend={trend} />
                  </div>
                  <p className="mt-2 font-num text-2xl font-semibold leading-none">
                    {latest}
                    {d.suffix}
                  </p>
                  <div className={cn("mt-2 h-9 opacity-80")}>
                    <Sparkline data={data.length ? data : [0, 0]} color={color} height={36} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
