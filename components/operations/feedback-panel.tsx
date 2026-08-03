"use client";

import { useState } from "react";
import { Plus, Link2 } from "lucide-react";

import { feedback as seed, type Feedback } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const sentimentAccent: Record<Feedback["sentiment"], string> = {
  positive: "border-l-growth",
  neutral: "border-l-info",
  negative: "border-l-amber-400",
};
const statusTone: Record<Feedback["status"], "muted" | "info" | "growth" | "secondary"> = {
  new: "info",
  triaged: "secondary",
  linked: "growth",
  closed: "muted",
};
const categoryLabel: Record<Feedback["category"], string> = {
  bug: "Bug",
  feature_request: "Feature",
  ux: "UX",
  pricing: "Pricing",
  praise: "Praise",
  other: "Other",
};

export function FeedbackPanel() {
  const [items, setItems] = useState<Feedback[]>(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    user: "",
    text: "",
    category: "feature_request" as Feedback["category"],
    sentiment: "neutral" as Feedback["sentiment"],
    priority: "medium" as Feedback["priority"],
  });

  function add() {
    if (!form.text.trim()) return;
    setItems((prev) => [
      {
        id: `fb${Date.now()}`,
        user: form.user || "anonymous",
        text: form.text,
        category: form.category,
        sentiment: form.sentiment,
        priority: form.priority,
        status: "new",
      },
      ...prev,
    ]);
    setForm({ user: "", text: "", category: "feature_request", sentiment: "neutral", priority: "medium" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">User feedback pipeline</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {items.length} items · {items.filter((i) => i.status === "new").length} new · linked to backlog & bugs
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Log feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log feedback</DialogTitle>
              <DialogDescription>Capture a user note and route it to the right place.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="fb-user">User</Label>
                <Input id="fb-user" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} placeholder="ava.chen" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="fb-text">Feedback</Label>
                <Textarea id="fb-text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Feedback["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(categoryLabel) as Feedback["category"][]).map((c) => (
                        <SelectItem key={c} value={c}>{categoryLabel[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Sentiment</Label>
                  <Select value={form.sentiment} onValueChange={(v) => setForm({ ...form, sentiment: v as Feedback["sentiment"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["positive", "neutral", "negative"] as const).map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Feedback["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["low", "medium", "high"] as const).map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={add}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((f) => (
          <div
            key={f.id}
            className={cn(
              "rounded-lg border border-l-2 border-border bg-background/40 p-3",
              sentimentAccent[f.sentiment],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm">{f.text}</p>
              <Badge variant={statusTone[f.status]} className="shrink-0 capitalize">
                {f.status}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <span className="text-info">@{f.user}</span>
              <Badge variant="muted">{categoryLabel[f.category]}</Badge>
              <span className="uppercase tracking-wider">{f.priority} priority</span>
              {f.status === "linked" && (
                <span className="inline-flex items-center gap-1 text-growth">
                  <Link2 className="h-3 w-3" /> linked
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
