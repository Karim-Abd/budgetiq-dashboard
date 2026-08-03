"use client";

import { useState } from "react";

import { integrations as seed, type Integration } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function IntegrationsList() {
  const [items, setItems] = useState<Integration[]>(seed);
  const [active, setActive] = useState<Integration | null>(null);

  function toggle(id: string, status: Integration["status"]) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        {items.map((i, idx) => {
          const connected = i.status === "connected";
          return (
            <div
              key={i.id}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5",
                idx !== items.length - 1 && "border-b border-border",
              )}
            >
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border font-mono text-xs font-semibold",
                  connected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {i.provider.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{i.provider}</p>
                <p className="truncate text-xs text-muted-foreground">{i.description}</p>
              </div>
              <span
                className={cn(
                  "hidden items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider sm:inline-flex",
                  connected
                    ? "border-growth/20 bg-growth/10 text-growth"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-growth" : "bg-muted-foreground")} />
                {connected ? "Connected" : "Not connected"}
              </span>
              {connected ? (
                <Button variant="ghost" size="sm" onClick={() => toggle(i.id, "disconnected")}>
                  Disconnect
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setActive(i)}>
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>Connect {active.provider}</DialogTitle>
                <DialogDescription>
                  Credentials are stored securely. No data syncs until you enable it.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                {active.fields.map((f) => (
                  <div key={f.key} className="grid gap-1.5">
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <Input
                      id={f.key}
                      type={f.secret ? "password" : "text"}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    toggle(active.id, "connected");
                    setActive(null);
                  }}
                >
                  Connect
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
