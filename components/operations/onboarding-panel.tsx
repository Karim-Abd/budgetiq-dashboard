"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FunnelStep {
  name: string;
  completion: number;
}

export function OnboardingPanel({ funnel }: { funnel: FunnelStep[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Onboarding funnel</CardTitle>
        <p className="text-xs text-muted-foreground">
          Completion by step — edit steps under the “Onboarding Steps” tab
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {funnel.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No funnel steps yet — add them to see the drop-off.
          </p>
        ) : (
          funnel.map((step, i) => {
            const prev = i === 0 ? 100 : funnel[i - 1].completion;
            const dropoff = Math.max(0, prev - step.completion);
            const worst = dropoff >= 25;
            return (
              <div key={step.name + i}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {step.name}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
                    {dropoff > 0 && (
                      <span className={cn(worst ? "text-amber-400" : "text-muted-foreground")}>−{dropoff}%</span>
                    )}
                    <span className="text-foreground">{step.completion}%</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-1000 ease-out",
                      worst ? "bg-gradient-to-r from-info to-amber-400" : "bg-gradient-to-r from-info to-growth",
                    )}
                    style={{ width: mounted ? `${step.completion}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
