"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Loader2, RefreshCw, ShieldCheck, Copy, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { apiPath } from "@/lib/base-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface TeamUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "owner" | "admin" | "member";
  created_at: string;
}

const roleTone = { owner: "growth", admin: "info", member: "muted" } as const;

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function TeamManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "member" as "admin" | "member" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath("/api/admin/users"));
      const data = await res.json();
      if (res.ok) setUsers(data.users ?? []);
      else setError(data.error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createUser() {
    setError(null);
    if (!form.email || form.password.length < 8) {
      setError("Email and an 8+ character password are required.");
      return;
    }
    setCreating(true);
    const res = await fetch(apiPath("/api/admin/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error || "Could not create the account.");
      return;
    }
    setForm({ fullName: "", email: "", password: "", role: "member" });
    setOpen(false);
    load();
  }

  async function removeUser(id: string) {
    const res = await fetch(apiPath("/api/admin/users"), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-growth" /> Team accounts
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {users.length} {users.length === 1 ? "member" : "members"} · you create and manage logins here
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={load} aria-label="Refresh">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); setError(null); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a team account</DialogTitle>
                <DialogDescription>
                  They&apos;ll sign in with this email and password. Share the password securely.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="t-name">Full name</Label>
                  <Input id="t-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Priya R." />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="t-email">Email</Label>
                  <Input id="t-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="priya@budgetiq.app" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="t-pass">Temporary password</Label>
                  <div className="flex gap-2">
                    <Input id="t-pass" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" className="font-mono" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setForm({ ...form, password: randomPassword() }); setCopied(false); }}
                    >
                      Generate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => { navigator.clipboard?.writeText(form.password); setCopied(true); }}
                      disabled={!form.password}
                      aria-label="Copy password"
                    >
                      {copied ? <Check className="h-4 w-4 text-growth" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as "admin" | "member" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member — can view & edit data</SelectItem>
                      <SelectItem value="admin">Admin — can also manage accounts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-xs text-critical">{error}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={createUser} disabled={creating}>
                  {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && !open && <p className="mb-3 text-xs text-critical">{error}</p>}
        <div className="divide-y divide-border rounded-lg border border-border">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-3 py-3">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-growth/30 to-info/30 text-[11px]">
                  {(u.full_name || u.email || "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {u.full_name || "—"}
                  {u.id === currentUserId && <span className="ml-2 font-mono text-[10px] text-muted-foreground">you</span>}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge variant={roleTone[u.role]} className="capitalize">{u.role}</Badge>
              {u.role !== "owner" && u.id !== currentUserId && (
                <Button variant="ghost" size="icon" onClick={() => removeUser(u.id)} aria-label="Remove">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-critical" />
                </Button>
              )}
            </div>
          ))}
          {!loading && users.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No team members yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
