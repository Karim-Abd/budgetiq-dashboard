"use client";

import Link from "next/link";
import { ArrowUpRight, Flame, FileText, Sparkles } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { dashboardData } from "@/lib/compute";
import { formatNumber, formatPercent } from "@/lib/format";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardHero } from "@/components/dashboard/hero";
import { AlertsFeed } from "@/components/dashboard/alerts-feed";
import { TrendChart } from "@/components/charts/trend-chart";
import { chartColors } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CrudTable } from "@/components/data/crud-table";
import { alertsEntity } from "@/lib/entities";

function SectionHeading({ title, hint, href }: { title: string; hint?: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {hint && <span className="eyebrow">{hint}</span>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground">
          Open <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data } = useLive();
  const d = dashboardData(data);

  return (
    <div className="animate-fade-up">
      <DashboardHero data={{ ...d.headline, criticalCount: d.criticalCount }} />

      <section className="mb-8">
        <SectionHeading title="User metrics" hint="9 signals · WoW" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {d.userKpis.map((kpi, i) => (
            <MetricCard key={kpi.id} kpi={kpi} delay={i * 0.06} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <section>
            <SectionHeading title="Financial snapshot" hint="SaaS metrics" href="/financial" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {d.financialKpis.map((kpi, i) => (
                <MetricCard key={kpi.id} kpi={kpi} delay={i * 0.06} />
              ))}
            </div>
          </section>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm">Revenue vs. costs</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">From your revenue & expense entries</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-growth" /> Revenue</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-info" /> Costs</span>
              </div>
            </CardHeader>
            <CardContent>
              {d.revenueTrend.length > 0 ? (
                <TrendChart
                  data={d.revenueTrend}
                  xKey="month"
                  valuePrefix="$"
                  series={[
                    { key: "revenue", name: "Revenue", color: chartColors.growth },
                    { key: "costs", name: "Costs", color: chartColors.info },
                  ]}
                />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Add revenue and expenses to see the trend.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-critical/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-critical" />
                </span>
                Alerts feed
              </CardTitle>
              {d.criticalCount > 0 && <Badge variant="critical">{d.criticalCount} critical</Badge>}
            </CardHeader>
            <CardContent className="pt-0">
              <AlertsFeed alerts={d.alerts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <SectionHeading title="Content snapshot" href="/content" />
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-info" />
                  <span className="eyebrow">Top post this week</span>
                </div>
                {d.topPost ? (
                  <>
                    <p className="mt-1.5 truncate text-sm font-medium">{String(d.topPost.title)}</p>
                    <div className="mt-2 flex items-center gap-3 font-mono text-xs text-muted-foreground">
                      <span className="text-growth">{formatPercent(Number(d.topPost.engagement_rate) || 0)} ER</span>
                      <span>{formatNumber(Number(d.topPost.reach) || 0, true)} reach</span>
                      <Badge variant="muted">{String(d.topPost.format)}</Badge>
                    </div>
                  </>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">No posts yet.</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-growth" />
                  <span className="eyebrow">Top hook</span>
                </div>
                {d.topHook ? (
                  <>
                    <p className="mt-1.5 text-sm font-medium">&ldquo;{String(d.topHook.text)}&rdquo;</p>
                    <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                      <span className="text-growth">{(Number(d.topHook.performance_score) || 0).toFixed(1)} score</span>
                      {Boolean(d.topHook.category) && <Badge variant="muted">{String(d.topHook.category).replace("_", " ")}</Badge>}
                    </div>
                  </>
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">No hooks yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <SectionHeading title="Manage alerts" hint="edit the feed" />
        <CrudTable config={alertsEntity} />
      </section>
    </div>
  );
}
