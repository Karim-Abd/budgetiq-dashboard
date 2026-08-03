"use client";

import { useState } from "react";
import { Plus, Upload } from "lucide-react";

import { devTasks, type DevTask, type KanbanColumn } from "@/lib/mock-data";
import { formatShortDate } from "@/lib/format";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusLabel: Record<KanbanColumn, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};
const statusTone: Record<KanbanColumn, "muted" | "info" | "growth" | "secondary"> = {
  backlog: "muted",
  todo: "info",
  in_progress: "info",
  review: "secondary",
  done: "growth",
};
const priorityTone = { P0: "critical", P1: "info", P2: "muted" } as const;

export function MigrationBoard() {
  const [items, setItems] = useState<DevTask[]>(devTasks);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "backlog" as KanbanColumn,
    priority: "P2" as DevTask["priority"],
    assignee: "",
    due: "",
  });

  function add() {
    if (!form.title.trim()) return;
    setItems((prev) => [
      {
        id: `t${Date.now()}`,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assignee: form.assignee || "Unassigned",
        due: form.due || new Date().toISOString().slice(0, 10),
        origin: "manual",
      },
      ...prev,
    ]);
    setForm({ title: "", description: "", status: "backlog", priority: "P2", assignee: "", due: "" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Notion migration board</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {items.filter((t) => t.origin === "notion").length} imported from Notion · {items.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add task</DialogTitle>
                <DialogDescription>Manually add a task to the board.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="t-title">Task name</Label>
                  <Input id="t-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="t-desc">Description</Label>
                  <Textarea id="t-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as KanbanColumn })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(statusLabel) as KanbanColumn[]).map((s) => (
                          <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as DevTask["priority"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["P0", "P1", "P2"] as const).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="t-assignee">Assignee</Label>
                    <Input id="t-assignee" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="t-due">Due date</Label>
                    <Input id="t-due" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={add}>Add task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="text-right">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="max-w-[300px]">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityTone[t.priority]}>{t.priority}</Badge>
                </TableCell>
                <TableCell className="text-sm">{t.assignee}</TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatShortDate(t.due)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
