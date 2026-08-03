"use client";

import { Download, AlertTriangle } from "lucide-react";

import { subscriptions, type Subscription } from "@/lib/mock-data";
import { formatCurrency, formatShortDate, daysUntil } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const renewalTone: Record<Subscription["renewal"], "growth" | "info" | "critical" | "muted"> = {
  active: "growth",
  at_risk: "info",
  past_due: "critical",
  canceled: "muted",
};
const renewalLabel: Record<Subscription["renewal"], string> = {
  active: "Active",
  at_risk: "At risk",
  past_due: "Past due",
  canceled: "Canceled",
};

export function BillingPanel() {
  const upcoming = subscriptions.filter(
    (s) => s.renewal !== "canceled" && daysUntil(s.billingDate) <= 7,
  );

  function exportCsv() {
    downloadCsv(
      "budgetiq-subscriptions.csv",
      subscriptions.map((s) => ({
        payer: s.payer,
        plan: s.plan,
        price: s.price,
        billing_date: s.billingDate,
        renewal: renewalLabel[s.renewal],
      })),
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Subscription & billing manager</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {subscriptions.length} subscriptions · {upcoming.length} renewing within 7 days
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {upcoming.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-info/20 bg-info/5 px-3 py-2 text-xs text-info">
            <AlertTriangle className="h-3.5 w-3.5" />
            {upcoming.length} renewal{upcoming.length > 1 ? "s" : ""} upcoming — confirm payment methods.
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Next billing</TableHead>
              <TableHead>Renewal</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((s) => {
              const days = daysUntil(s.billingDate);
              const soon = s.renewal !== "canceled" && days <= 7;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.payer}</TableCell>
                  <TableCell>
                    <Badge variant={s.plan === "Pro" ? "growth" : "info"}>{s.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{formatShortDate(s.billingDate)}</span>
                      {soon && (
                        <span className="font-mono text-[10px] text-info">in {days}d</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={renewalTone[s.renewal]}>{renewalLabel[s.renewal]}</Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm tabular-nums",
                      s.renewal === "canceled" && "text-muted-foreground line-through",
                    )}
                  >
                    {formatCurrency(s.price, { decimals: 2 })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
