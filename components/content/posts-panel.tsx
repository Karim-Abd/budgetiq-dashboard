"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { posts as seedPosts, avatars, type Post, type PostFormat, type PostStatus } from "@/lib/mock-data";
import { formatNumber, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatTone: Record<PostFormat, string> = {
  Reel: "info",
  Carousel: "growth",
  Story: "muted",
  Static: "secondary",
};
const statusTone: Record<PostStatus, "growth" | "info" | "muted" | "secondary"> = {
  published: "growth",
  scheduled: "info",
  draft: "muted",
  archived: "secondary",
};

export function PostsPanel() {
  const [items, setItems] = useState<Post[]>(seedPosts);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    format: "Reel" as PostFormat,
    platform: "Instagram",
    hook: "",
    caption: "",
    publishDate: "",
  });

  function addPost() {
    if (!form.title.trim()) return;
    const newPost: Post = {
      id: `p${Date.now()}`,
      title: form.title,
      format: form.format,
      status: form.publishDate ? "scheduled" : "draft",
      platform: form.platform,
      avatar: avatars[0].name,
      hook: form.hook,
      publishDate: form.publishDate || new Date().toISOString().slice(0, 10),
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      engagementRate: 0,
    };
    setItems((prev) => [newPost, ...prev]);
    setForm({ title: "", format: "Reel", platform: "Instagram", hook: "", caption: "", publishDate: "" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Content management</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {items.length} posts · engagement rate = (likes + comments + saves + shares) ÷ reach
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a post</DialogTitle>
              <DialogDescription>
                Add it to the calendar. Performance is logged once it&apos;s live.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="3 money traps every student falls for"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Format</Label>
                  <Select
                    value={form.format}
                    onValueChange={(v) => setForm({ ...form, format: v as PostFormat })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["Reel", "Carousel", "Story", "Static"] as PostFormat[]).map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Platform</Label>
                  <Select
                    value={form.platform}
                    onValueChange={(v) => setForm({ ...form, platform: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Instagram", "TikTok", "YouTube", "X"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="hook">Hook</Label>
                <Input
                  id="hook"
                  value={form.hook}
                  onChange={(e) => setForm({ ...form, hook: e.target.value })}
                  placeholder="You're losing $200/mo without noticing"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Save this before your next paycheck…"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="date">Publish date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={addPost}>Schedule post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Reach</TableHead>
              <TableHead className="text-right">Saves</TableHead>
              <TableHead className="text-right">ER</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-[260px]">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.avatar}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={formatTone[p.format] as "info"}>{p.format}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusTone[p.status]} className="capitalize">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {p.reach ? formatNumber(p.reach, true) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {p.saves ? formatNumber(p.saves, true) : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono text-sm font-medium tabular-nums",
                    p.engagementRate >= 9 ? "text-growth" : "text-foreground",
                  )}
                >
                  {p.engagementRate ? `${p.engagementRate}%` : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatShortDate(p.publishDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
