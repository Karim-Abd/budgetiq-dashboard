"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CategorySlice } from "@/lib/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Spend by category. Categories are nominal — they have no natural order — so
 * every bar wears the same hue and length alone carries magnitude. Shading each
 * bar darker-where-bigger would double-encode what the bar already shows.
 */
export function CategoryBars({
  slices,
  title,
  subtitle,
  tone = "out",
  limit = 6,
}: {
  slices: CategorySlice[];
  title: string;
  subtitle: string;
  tone?: "in" | "out";
  limit?: number;
}) {
  // Everything past the cap folds into one "Other" bar rather than growing the
  // list — a long tail of 1% rows is noise.
  const head = slices.slice(0, limit);
  const tail = slices.slice(limit);
  const rows = tail.length
    ? [
        ...head,
        {
          category: "__other",
          label: `Other (${tail.length})`,
          total: tail.reduce((t, s) => t + s.total, 0),
          share: tail.reduce((t, s) => t + s.share, 0),
        },
      ]
    : head;

  const max = Math.max(...rows.map((r) => r.total), 0);

  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Nothing logged in this period yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.category}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="truncate text-xs text-muted-foreground">{row.label}</span>
                  {/* Direct label at the data end — the axis is implied, so the
                      value has to ride the bar. */}
                  <span className="shrink-0 font-mono text-xs tabular-nums">
                    {formatCurrency(row.total, { decimals: 2 })}
                    <span className="ml-2 text-muted-foreground">
                      {formatPercent(row.share * 100, 0)}
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-r-sm",
                      tone === "in" ? "bg-money-in" : "bg-money-out",
                    )}
                    style={{ width: max > 0 ? `max(3px, ${(row.total / max) * 100}%)` : 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
