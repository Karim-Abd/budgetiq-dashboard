"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SaasMetrics {
  arpu: number;
  ltv: number;
  cac: number;
  ltvCac: number;
  cacPayback: number;
  nrr: number;
  grossMargin: number;
  burn: number;
}

interface MetricDef {
  label: string;
  value: string;
  formula: string;
  health?: "good" | "warn" | "bad";
  note: string;
}

const healthMeta = {
  good: { tone: "growth", icon: CheckCircle2, label: "Healthy" },
  warn: { tone: "info", icon: AlertCircle, label: "Watch" },
  bad: { tone: "critical", icon: AlertCircle, label: "Below target" },
} as const;

export function SaasMetricsPanel({ saas }: { saas: SaasMetrics }) {
  const metrics: MetricDef[] = [
    { label: "ARPU", value: `$${saas.arpu.toFixed(2)}`, formula: "MRR ÷ paying users", note: "Average revenue per user / month" },
    { label: "LTV", value: `$${Math.round(saas.ltv)}`, formula: "ARPU ÷ monthly churn", note: "Lifetime value per customer" },
    { label: "CAC", value: `$${Math.round(saas.cac)}`, formula: "(marketing + sales) ÷ new customers", note: "Cost to acquire a customer" },
    { label: "LTV : CAC", value: `${saas.ltvCac.toFixed(1)} : 1`, formula: "LTV ÷ CAC", health: saas.ltvCac >= 3 ? "good" : saas.ltvCac > 0 ? "bad" : undefined, note: "Target ≥ 3:1" },
    { label: "CAC payback", value: `${saas.cacPayback.toFixed(1)} mo`, formula: "CAC ÷ (ARPU × gross margin)", health: saas.cacPayback > 0 ? (saas.cacPayback <= 12 ? "good" : "warn") : undefined, note: "Months to recover CAC" },
    { label: "NRR", value: `${saas.nrr.toFixed(1)}%`, formula: "(start + expansion − churn) ÷ start", health: saas.nrr > 0 ? (saas.nrr >= 100 ? "good" : "warn") : undefined, note: "Net revenue retention" },
    { label: "Gross margin", value: `${saas.grossMargin.toFixed(0)}%`, formula: "(revenue − COGS) ÷ revenue", note: "Software-level margins" },
    { label: "Monthly burn", value: `$${Math.round(saas.burn).toLocaleString()}`, formula: "total costs − revenue", note: "Net cash out per month" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Key SaaS financial metrics</CardTitle>
        <p className="text-xs text-muted-foreground">Derived from your subscriptions, snapshots and weekly KPIs</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => {
            const health = m.health ? healthMeta[m.health] : null;
            return (
              <div
                key={m.label}
                className={cn(
                  "rounded-xl border bg-background/40 p-4",
                  m.health === "bad" ? "border-critical/30" : m.health === "good" ? "border-growth/20" : "border-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{m.label}</span>
                  {health && <health.icon className={cn("h-4 w-4", m.health === "good" ? "text-growth" : m.health === "warn" ? "text-info" : "text-critical")} />}
                </div>
                <p className="mt-2 font-num text-2xl font-semibold leading-none">{m.value}</p>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground/80">{m.formula}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                {health && <Badge variant={health.tone} className="mt-2">{health.label}</Badge>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
