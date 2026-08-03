"use client";

import { useState } from "react";
import { Bot, Link2, Loader2, AlertTriangle } from "lucide-react";

import { videoReviews, type VideoReview } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ScoreRing({ value }: { value: number }) {
  const pct = (value / 10) * 100;
  const tone = value >= 8 ? "hsl(158 64% 52%)" : value >= 6 ? "hsl(217 91% 60%)" : "hsl(350 89% 60%)";
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(214 15% 16%)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.5" fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
        />
      </svg>
      <span className="absolute font-num text-sm font-semibold">{value.toFixed(1)}</span>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", value >= 8 ? "bg-growth" : value >= 6 ? "bg-info" : "bg-critical")}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="w-5 shrink-0 text-right font-mono text-[11px] tabular-nums">{value}</span>
    </div>
  );
}

export function VideoReviewPanel() {
  const [items, setItems] = useState<VideoReview[]>(videoReviews);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  function runReview() {
    if (!url.trim() || busy) return;
    setBusy(true);
    // Simulated agent pass — replace with a call to the AI review endpoint.
    setTimeout(() => {
      const r = () => Math.round((5 + Math.random() * 5) * 10) / 10;
      const sub = { hook: r(), pace: r(), cta: r(), cap: r() };
      const rating = Math.round(((sub.hook + sub.pace + sub.cta + sub.cap) / 4) * 10) / 10;
      setItems((prev) => [
        {
          id: `v${Date.now()}`,
          title: url.replace(/^https?:\/\//, "").slice(0, 36) || "Submitted video",
          rating,
          hookStrength: sub.hook,
          pacing: sub.pace,
          cta: sub.cta,
          caption: sub.cap,
          suggestions:
            rating < 6
              ? "Hook is underperforming — open on the payoff and add captions in the first frame."
              : "Solid. Tighten the first 0.8s and shorten the CTA card.",
          reviewedAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      setUrl("");
      setBusy(false);
    }, 1100);
  }

  const flaggedCount = items.filter((i) => i.rating < 6).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4 text-info" /> AI video review agent
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Paste a link — the agent rates hook, pacing, CTA and caption out of 10.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/reel/…"
              className="pl-8"
              onKeyDown={(e) => e.key === "Enter" && runReview()}
            />
          </div>
          <Button onClick={runReview} disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Reviewing…
              </>
            ) : (
              "Run review"
            )}
          </Button>
          {flaggedCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-critical/20 bg-critical/5 px-3 py-2 text-xs text-critical">
              <AlertTriangle className="h-3.5 w-3.5" />
              {flaggedCount} video{flaggedCount > 1 ? "s" : ""} below the 6.0 threshold
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Review history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((rv) => (
            <div
              key={rv.id}
              className={cn(
                "flex gap-4 rounded-lg border p-3",
                rv.rating < 6 ? "border-critical/25 bg-critical/5" : "border-border bg-background/40",
              )}
            >
              <ScoreRing value={rv.rating} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{rv.title}</p>
                  {rv.rating < 6 && <Badge variant="critical">Flagged</Badge>}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <SubScore label="Hook" value={rv.hookStrength} />
                  <SubScore label="Pacing" value={rv.pacing} />
                  <SubScore label="CTA" value={rv.cta} />
                  <SubScore label="Caption" value={rv.caption} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{rv.suggestions}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
