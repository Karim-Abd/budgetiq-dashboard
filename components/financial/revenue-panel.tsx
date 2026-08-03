"use client";

import { payments, mrrTrend, months } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "@/components/charts/trend-chart";
import { chartColors } from "@/lib/colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusTone: Record<string, "growth" | "info" | "muted" | "critical"> = {
  Paid: "growth",
  Pending: "info",
  Refunded: "muted",
  Failed: "critical",
};

// Revenue by signup cohort (illustrative): later cohorts monetize faster.
const cohortRevenue = months.slice(0, 6).map((m, i) => ({
  month: m,
  revenue: Math.round(420 + i * 260 + (i % 2) * 120),
}));
const maxCohort = Math.max(...cohortRevenue.map((c) => c.revenue));

export function RevenuePanel() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">MRR trend</CardTitle>
            <p className="text-xs text-muted-foreground">Monthly recurring revenue · ARR = MRR × 12</p>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={mrrTrend}
              xKey="month"
              valuePrefix="$"
              series={[{ key: "mrr", name: "MRR", color: chartColors.growth }]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cohort revenue</CardTitle>
            <p className="text-xs text-muted-foreground">By signup month</p>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {cohortRevenue.map((c) => (
              <div key={c.month} className="flex items-center gap-3">
                <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">{c.month}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-info to-growth"
                    style={{ width: `${(c.revenue / maxCohort) * 100}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums">
                  {formatCurrency(c.revenue)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Revenue tracker</CardTitle>
          <p className="text-xs text-muted-foreground">Recent payments</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.payer}</TableCell>
                  <TableCell>
                    <Badge variant={p.plan === "Pro" ? "growth" : "info"}>{p.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.method}</TableCell>
                  <TableCell>
                    <Badge variant={statusTone[p.status]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm tabular-nums",
                      p.status === "Refunded" || p.status === "Failed"
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {formatCurrency(p.amount, { decimals: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
