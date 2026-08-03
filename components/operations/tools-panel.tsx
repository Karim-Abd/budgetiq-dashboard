"use client";

import { AlertTriangle } from "lucide-react";

import { tools, type Tool } from "@/lib/mock-data";
import { formatCurrency, formatShortDate, daysUntil } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/shared/stat-tile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusTone: Record<Tool["status"], "growth" | "info" | "muted"> = {
  active: "growth",
  trial: "info",
  canceled: "muted",
};

export function ToolsPanel() {
  const totalSpend = tools.filter((t) => t.status === "active").reduce((s, t) => s + t.cost, 0);
  const renewingSoon = tools.filter((t) => t.status !== "canceled" && daysUntil(t.billingDate) <= 7);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Monthly tool spend" value={formatCurrency(totalSpend)} accent="info" sub={`${tools.length} tools`} />
        <StatTile label="Renewing ≤ 7d" value={String(renewingSoon.length)} accent={renewingSoon.length ? "muted" : "growth"} sub="needs review" />
        <StatTile label="On trial" value={String(tools.filter((t) => t.status === "trial").length)} accent="info" />
        <StatTile label="Annualized" value={formatCurrency(totalSpend * 12, { compact: true })} accent="muted" sub="run-rate" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tool stack tracker</CardTitle>
          <p className="text-xs text-muted-foreground">Renewals within 7 days are flagged</p>
        </CardHeader>
        <CardContent>
          {renewingSoon.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-info/20 bg-info/5 px-3 py-2 text-xs text-info">
              <AlertTriangle className="h-3.5 w-3.5" />
              {renewingSoon.map((t) => t.name).join(", ")} renew within 7 days.
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Next billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cost / mo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((t) => {
                const days = daysUntil(t.billingDate);
                const soon = t.status !== "canceled" && days <= 7;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="muted">{t.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{formatShortDate(t.billingDate)}</span>
                        {soon && <span className="font-mono text-[10px] text-info">in {days}d</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusTone[t.status]} className="capitalize">{t.status}</Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm tabular-nums",
                        t.cost === 0 && "text-muted-foreground",
                      )}
                    >
                      {t.cost === 0 ? "Free" : formatCurrency(t.cost)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
