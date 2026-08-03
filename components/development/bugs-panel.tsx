"use client";

import { bugs, type Bug } from "@/lib/mock-data";
import { formatShortDate } from "@/lib/format";
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

const severityTone: Record<Bug["severity"], "critical" | "info" | "muted" | "secondary"> = {
  critical: "critical",
  high: "critical",
  medium: "info",
  low: "muted",
};
const statusTone: Record<Bug["status"], "critical" | "info" | "growth" | "muted"> = {
  open: "critical",
  in_progress: "info",
  resolved: "growth",
  wont_fix: "muted",
};
const statusLabel: Record<Bug["status"], string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

export function BugsPanel() {
  const open = bugs.filter((b) => b.status === "open" || b.status === "in_progress").length;
  const critical = bugs.filter((b) => b.severity === "critical").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Open" value={String(open)} accent="info" />
        <StatTile label="Critical" value={String(critical)} accent={critical ? "muted" : "growth"} />
        <StatTile label="Resolved (wk)" value="3" accent="growth" />
        <StatTile label="Avg time to fix" value="1.8d" accent="muted" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Bug & issue log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reported by</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bugs.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="max-w-[320px]">
                    <p className="truncate text-sm font-medium">{b.title}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityTone[b.severity]} className="capitalize">
                      {b.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.reportedBy}</TableCell>
                  <TableCell>
                    <Badge variant={statusTone[b.status]}>{statusLabel[b.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatShortDate(b.date)}
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
