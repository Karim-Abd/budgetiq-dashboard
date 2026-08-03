"use client";

import { Palette, Mic, Hash } from "lucide-react";

import { avatars } from "@/lib/mock-data";
import { MagicCard } from "@/components/ui/magic-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AvatarsPanel() {
  const maxEng = Math.max(...avatars.map((a) => a.avgEngagement));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {avatars.map((a) => (
          <div key={a.id} className="rounded-xl">
            <MagicCard className="h-full rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-growth/30 to-info/30 font-mono text-sm font-semibold">
                  {a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {a.posts} posts · {a.avgEngagement}% avg ER
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{a.bio}</p>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mic className="h-3.5 w-3.5 text-info" /> {a.tone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Palette className="h-3.5 w-3.5 text-growth" /> {a.visualStyle}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.pillars.map((p) => (
                  <Badge key={p} variant="muted" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {p}
                  </Badge>
                ))}
              </div>
            </MagicCard>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Performance by avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {avatars
            .slice()
            .sort((a, b) => b.avgEngagement - a.avgEngagement)
            .map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-sm">{a.name}</span>
                <Progress
                  value={(a.avgEngagement / maxEng) * 100}
                  indicatorClassName="bg-gradient-to-r from-info to-growth"
                  className="h-2"
                />
                <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-growth">
                  {a.avgEngagement}%
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
