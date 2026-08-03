"use client";

import { FileText, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";

import { formatNumber, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/shared/stat-tile";

interface PostRow {
  title?: unknown;
  status?: unknown;
  format?: unknown;
  engagement_rate?: unknown;
  reach?: unknown;
}
interface HookRow {
  text?: unknown;
  performance_score?: unknown;
}

const num = (v: unknown) => Number(v) || 0;

export function WeeklyReportPanel({ posts, hooks }: { posts: PostRow[]; hooks: HookRow[] }) {
  const published = posts.filter((p) => p.status === "published");
  const sorted = [...published].sort((a, b) => num(b.engagement_rate) - num(a.engagement_rate));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const topHook = [...hooks].sort((a, b) => num(b.performance_score) - num(a.performance_score))[0];
  const avgEr = published.length
    ? Math.round((published.reduce((s, p) => s + num(p.engagement_rate), 0) / published.length) * 10) / 10
    : 0;

  // most common format among published
  const formatCounts = published.reduce<Record<string, number>>((acc, p) => {
    const f = String(p.format ?? "—");
    acc[f] = (acc[f] ?? 0) + 1;
    return acc;
  }, {});
  const bestFormat = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const scheduled = posts.filter((p) => p.status === "scheduled").length;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-info/10 blur-3xl" />
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-info" /> Weekly optimization report
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Auto-generated from your posts &amp; hooks</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {published.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Publish some posts (set status to “published”) to generate the report.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Avg engagement" value={formatPercent(avgEr)} accent="growth" sub={`${published.length} published`} />
              <StatTile label="Best format" value={bestFormat} accent="info" sub="most used" />
              <StatTile label="Posts shipped" value={String(published.length)} accent="muted" sub={`${scheduled} scheduled`} />
              <StatTile label="Hooks tested" value={String(hooks.length)} accent="muted" sub="in library" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-growth/25 bg-growth/5 p-3">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-growth" />
                  <span className="eyebrow">Best post</span>
                </div>
                <p className="mt-1.5 truncate text-sm font-medium">{String(best?.title ?? "—")}</p>
                <p className="mt-1 font-mono text-xs text-growth">
                  {formatPercent(num(best?.engagement_rate))} ER · {formatNumber(num(best?.reach), true)} reach
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  <span className="eyebrow">Weakest post</span>
                </div>
                <p className="mt-1.5 truncate text-sm font-medium">{String(worst?.title ?? "—")}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {formatPercent(num(worst?.engagement_rate))} ER · {formatNumber(num(worst?.reach), true)} reach
                </p>
              </div>
            </div>

            {topHook && (
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <span className="eyebrow">Recommendation</span>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lean into your top hook — &ldquo;{String(topHook.text)}&rdquo; scored{" "}
                  {num(topHook.performance_score).toFixed(1)}. Test more variations of it next week.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
