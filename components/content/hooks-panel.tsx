"use client";

import { Trophy } from "lucide-react";

import { hooks, hookAbTest, type HookCategory } from "@/lib/mock-data";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categoryLabel: Record<HookCategory, string> = {
  curiosity: "Curiosity",
  pain_point: "Pain point",
  number_based: "Number",
  question: "Question",
  bold_claim: "Bold claim",
};
const categoryTone: Record<HookCategory, "info" | "growth" | "muted" | "secondary" | "default"> = {
  curiosity: "info",
  pain_point: "default",
  number_based: "growth",
  question: "secondary",
  bold_claim: "muted",
};

export function HooksPanel() {
  const aWins = hookAbTest.a.score >= hookAbTest.b.score;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      {/* A/B test */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            A/B hook test
            <Badge variant={hookAbTest.status === "complete" ? "growth" : "info"} className="capitalize">
              {hookAbTest.status}
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">{hookAbTest.name}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { ...hookAbTest.a, win: aWins, key: "A" },
            { ...hookAbTest.b, win: !aWins, key: "B" },
          ].map((v) => (
            <div
              key={v.key}
              className={cn(
                "rounded-lg border p-3",
                v.win ? "border-growth/30 bg-growth/5" : "border-border bg-background/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">
                  <span className="mr-2 font-mono text-xs text-muted-foreground">{v.key}</span>
                  &ldquo;{v.text}&rdquo;
                </p>
                {v.win && <Trophy className="h-4 w-4 shrink-0 text-growth" />}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Progress
                  value={v.score * 10}
                  indicatorClassName={v.win ? "bg-growth" : "bg-info"}
                  className="h-2"
                />
                <span
                  className={cn(
                    "w-10 shrink-0 text-right font-mono text-sm tabular-nums",
                    v.win ? "text-growth" : "text-foreground",
                  )}
                >
                  {v.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
          <p className="font-mono text-[11px] text-muted-foreground">
            Metric: {hookAbTest.metric}
          </p>
        </CardContent>
      </Card>

      {/* Library */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Hook script library</CardTitle>
          <p className="text-xs text-muted-foreground">
            Tagged by category, scored by performance
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hook</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Tested</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hooks
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="max-w-[240px]">
                      <p className="truncate text-sm">{h.text}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{h.format}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={categoryTone[h.category]}>{categoryLabel[h.category]}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatShortDate(h.dateTested)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm font-medium tabular-nums",
                        h.score >= 9 ? "text-growth" : h.score < 7 ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {h.score.toFixed(1)}
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
