"use client";

import { TrendingUp } from "lucide-react";

import { scrapedAccounts } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ScraperPanel() {
  const top = scrapedAccounts.slice().sort((a, b) => b.engagementRate - a.engagementRate)[0];
  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">ConnectScraper · competitor log</CardTitle>
          <p className="text-xs text-muted-foreground">
            Inspiration accounts, hooks and estimated performance
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Hook</TableHead>
                <TableHead className="text-right">Reach</TableHead>
                <TableHead className="text-right">ER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scrapedAccounts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-mono text-xs text-info">{s.account}</p>
                    <span className="text-[10px] text-muted-foreground">{s.postType}</span>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="truncate text-sm">{s.hook}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{s.notes}</p>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {formatNumber(s.estReach, true)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm font-medium tabular-nums",
                      s.engagementRate >= 12 ? "text-growth" : "text-foreground",
                    )}
                  >
                    {s.engagementRate}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-b from-growth/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-growth" /> Weekly top performer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-mono text-lg text-info">{top.account}</p>
          <p className="text-sm">&ldquo;{top.hook}&rdquo;</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="growth">{top.engagementRate}% ER</Badge>
            <Badge variant="muted">{formatNumber(top.estReach, true)} reach</Badge>
            <Badge variant="secondary">{top.postType}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{top.notes}</p>
          <div className="rounded-lg border border-border bg-background/40 p-3 text-xs text-muted-foreground">
            <span className="eyebrow">Takeaway</span>
            <p className="mt-1">
              Contrarian, result-first hooks are outperforming setup-style openers across the
              tracked set. Test a &ldquo;stop budgeting&rdquo; angle next week.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
