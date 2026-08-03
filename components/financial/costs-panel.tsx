"use client";

import { Flame } from "lucide-react";

import { expenses, costByCategory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryDonut, donutPalette } from "@/components/charts/category-donut";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CostsPanel() {
  const monthlyBurn = costByCategory.reduce((s, c) => s + c.amount, 0);
  const sorted = costByCategory.slice().sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-info" /> Burn by category
            </CardTitle>
            <p className="text-xs text-muted-foreground">Monthly run-rate</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <CategoryDonut data={sorted} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="eyebrow">Monthly burn</span>
                <span className="font-num text-xl font-semibold">{formatCurrency(monthlyBurn)}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {sorted.map((c, i) => (
                <div key={c.category} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: donutPalette[i % donutPalette.length] }}
                  />
                  <span className="flex-1 truncate text-muted-foreground">{c.category}</span>
                  <span className="font-mono tabular-nums">{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cost & expense log</CardTitle>
            <p className="text-xs text-muted-foreground">All recorded expenses</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{e.vendor}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{e.notes}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="muted">{e.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{e.cycle}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatCurrency(e.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
