"use client";

import { MessageSquare } from "lucide-react";

import { features, type Feature } from "@/lib/mock-data";
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

const priorityTone = { P0: "critical", P1: "info", P2: "muted" } as const;
const statusTone: Record<Feature["status"], "muted" | "info" | "growth" | "secondary" | "critical"> = {
  proposed: "muted",
  planned: "info",
  in_progress: "info",
  shipped: "growth",
  rejected: "critical",
};
const statusLabel: Record<Feature["status"], string> = {
  proposed: "Proposed",
  planned: "Planned",
  in_progress: "In Progress",
  shipped: "Shipped",
  rejected: "Rejected",
};

export function BacklogPanel() {
  const ordered = features
    .slice()
    .sort((a, b) => a.priority.localeCompare(b.priority) || b.linkedFeedback - a.linkedFeedback);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Feature backlog</CardTitle>
        <p className="text-xs text-muted-foreground">
          Prioritized by impact and demand from linked feedback
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Effort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="max-w-[320px]">
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{f.description}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityTone[f.priority]}>{f.priority}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{f.effort}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusTone[f.status]}>{statusLabel[f.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1 font-mono text-sm tabular-nums text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {f.linkedFeedback}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
