"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TrendChart } from "@/components/charts/trend-chart";
import { chartColors } from "@/lib/colors";
import { StatTile } from "@/components/shared/stat-tile";

interface PnlRow {
  month: string;
  revenue: number;
  costs: number;
  net: number;
}

export function PnlPanel({
  pnl,
  cashOnHand,
  burn,
}: {
  pnl: PnlRow[];
  cashOnHand: number;
  burn: number;
}) {
  const [cash, setCash] = useState(cashOnHand);
  const [monthlyBurn, setMonthlyBurn] = useState(burn);
  const runway = monthlyBurn > 0 ? cash / monthlyBurn : 0;

  const lastMonth = pnl[pnl.length - 1] ?? { month: "—", revenue: 0, costs: 0, net: 0 };
  const ytdRevenue = pnl.reduce((s, m) => s + m.revenue, 0);
  const ytdCosts = pnl.reduce((s, m) => s + m.costs, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Total revenue" value={formatCurrency(ytdRevenue, { compact: true })} accent="growth" sub="all entries" />
        <StatTile label="Total costs" value={formatCurrency(ytdCosts, { compact: true })} accent="info" sub="all entries" />
        <StatTile
          label="Latest net"
          value={`${lastMonth.net >= 0 ? "" : "-"}${formatCurrency(Math.abs(lastMonth.net))}`}
          accent={lastMonth.net >= 0 ? "growth" : "muted"}
          sub={lastMonth.month + " · " + (lastMonth.net >= 0 ? "profit" : "loss")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm">Profit & loss</CardTitle>
              <p className="text-xs text-muted-foreground">Revenue − costs = net</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-growth" /> Revenue</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-info" /> Costs</span>
            </div>
          </CardHeader>
          <CardContent>
            {pnl.length > 0 ? (
              <TrendChart
                data={pnl}
                xKey="month"
                valuePrefix="$"
                series={[
                  { key: "revenue", name: "Revenue", color: chartColors.growth },
                  { key: "costs", name: "Costs", color: chartColors.info },
                ]}
              />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Add revenue and expenses to build the P&amp;L.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calculator className="h-4 w-4 text-info" /> Runway calculator
            </CardTitle>
            <p className="text-xs text-muted-foreground">Cash on hand ÷ monthly burn</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cash">Cash on hand</Label>
              <Input id="cash" type="number" value={cash} onChange={(e) => setCash(Number(e.target.value))} className="font-mono" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="burn">Monthly burn</Label>
              <Input id="burn" type="number" value={monthlyBurn} onChange={(e) => setMonthlyBurn(Number(e.target.value))} className="font-mono" />
            </div>
            <div
              className={cn(
                "rounded-lg border p-4 text-center",
                runway >= 9 ? "border-growth/30 bg-growth/5" : runway >= 4 ? "border-info/30 bg-info/5" : "border-critical/30 bg-critical/5",
              )}
            >
              <span className="eyebrow">Estimated runway</span>
              <p className={cn("mt-1 font-num text-3xl font-semibold", runway >= 9 ? "text-growth" : runway >= 4 ? "text-info" : "text-critical")}>
                {monthlyBurn > 0 ? runway.toFixed(1) : "—"} mo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
