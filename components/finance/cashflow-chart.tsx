"use client";

import { useMemo, useState } from "react";
import { Table2, BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MonthBucket } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PLOT_HEIGHT = 200;
const TICKS = 4;

// Nice tick intervals, as multiples of a power of ten.
const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/**
 * Axis maximum derived from a clean tick *interval*, not a clean maximum.
 * Rounding the max alone gives tidy-looking bounds with ugly ticks in between
 * (a max of 2,500 over 4 ticks steps by 625 → "$1.9K"). Sizing the interval
 * first keeps every label round: 600 / 1.2K / 1.8K / 2.4K.
 */
function axisMax(value: number, ticks: number): number {
  if (value <= 0) return 100;
  const raw = value / ticks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const scaled = raw / magnitude;
  const step = STEPS.find((s) => scaled <= s) ?? 10;
  return step * magnitude * ticks;
}

function Swatch({ className }: { className: string }) {
  return <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", className)} />;
}

export function CashflowChart({ series }: { series: MonthBucket[] }) {
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const max = useMemo(
    () => axisMax(Math.max(...series.map((m) => Math.max(m.income, m.expense)), 0), TICKS),
    [series],
  );
  const empty = series.every((m) => m.income === 0 && m.expense === 0);

  // Descending, so they render top-to-bottom in document order.
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => (max / TICKS) * (TICKS - i));

  const summary = series
    .map((m) => `${m.label}: in ${formatCurrency(m.income)}, out ${formatCurrency(m.expense)}`)
    .join("; ");

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Cash flow</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Money in against money out, last {series.length} months
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Two series, so the legend is always present — identity is never colour alone. */}
          <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
            <span className="flex items-center gap-1.5">
              <Swatch className="bg-money-in" /> In
            </span>
            <span className="flex items-center gap-1.5">
              <Swatch className="bg-money-out" /> Out
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowTable((v) => !v)}
            aria-label={showTable ? "Show chart" : "Show as table"}
          >
            {showTable ? <BarChart3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {empty ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No transactions in this period yet.
          </div>
        ) : showTable ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">In</TableHead>
                <TableHead className="text-right">Out</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((m) => (
                <TableRow key={m.key}>
                  <TableCell className="text-sm">{m.label}</TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {formatCurrency(m.income)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {formatCurrency(m.expense)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm tabular-nums",
                      m.net < 0 && "text-critical",
                    )}
                  >
                    {formatCurrency(m.net)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex gap-3" role="img" aria-label={`Cash flow by month. ${summary}`}>
            {/* Y axis */}
            <div
              className="flex w-14 shrink-0 flex-col justify-between text-right"
              style={{ height: PLOT_HEIGHT }}
              aria-hidden
            >
              {ticks.map((t, i) => (
                <span key={i} className="font-mono text-[10px] leading-none text-muted-foreground">
                  {formatCurrency(t, { compact: true })}
                </span>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <div className="relative" style={{ height: PLOT_HEIGHT }}>
                {/* Recessive hairline gridlines, solid — never dashed. */}
                {ticks.map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-0 h-px bg-border"
                    style={{ top: `${(i / TICKS) * 100}%` }}
                    aria-hidden
                  />
                ))}

                <div className="absolute inset-0 flex items-end justify-between">
                  {series.map((m) => {
                    const isHovered = hovered === m.key;
                    return (
                      <div
                        key={m.key}
                        className="relative flex h-full flex-1 items-end justify-center"
                        onMouseEnter={() => setHovered(m.key)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        {/* Hover tooltip, anchored above the pair. */}
                        {isHovered && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-36 -translate-x-1/2 rounded-lg border border-border bg-popover p-2.5 shadow-xl">
                            <p className="mb-1.5 text-xs font-medium">{m.label}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Swatch className="bg-money-in" /> In
                                </span>
                                <span className="font-mono tabular-nums">
                                  {formatCurrency(m.income)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Swatch className="bg-money-out" /> Out
                                </span>
                                <span className="font-mono tabular-nums">
                                  {formatCurrency(m.expense)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 border-t border-border pt-1 text-[11px]">
                                <span className="text-muted-foreground">Net</span>
                                <span
                                  className={cn(
                                    "font-mono tabular-nums",
                                    m.net < 0 ? "text-critical" : "text-foreground",
                                  )}
                                >
                                  {formatCurrency(m.net)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2px surface gap separates the touching pair — no strokes. */}
                        <div className="flex h-full w-full items-end justify-center gap-[2px]">
                          {(
                            [
                              { value: m.income, className: "bg-money-in" },
                              { value: m.expense, className: "bg-money-out" },
                            ] as const
                          ).map((bar, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-full max-w-[22px] rounded-t transition-opacity",
                                bar.className,
                                hovered && !isHovered && "opacity-40",
                              )}
                              style={{
                                // A non-zero amount always keeps a visible sliver.
                                height:
                                  bar.value > 0
                                    ? `max(3px, ${(bar.value / max) * 100}%)`
                                    : 0,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 flex justify-between">
                {series.map((m) => (
                  <span
                    key={m.key}
                    className={cn(
                      "flex-1 text-center font-mono text-[10px] uppercase tracking-wider transition-colors",
                      hovered === m.key ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
