"use client";

import {
  Megaphone,
  Wallet,
  Code2,
  Settings2,
  Users,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import { type Alert } from "@/lib/mock-data";
import { AnimatedList } from "@/components/ui/animated-list";

const componentMeta: Record<Alert["component"], { icon: LucideIcon; label: string }> = {
  content: { icon: Megaphone, label: "Content" },
  financial: { icon: Wallet, label: "Financial" },
  development: { icon: Code2, label: "Development" },
  operations: { icon: Settings2, label: "Operations" },
  users: { icon: Users, label: "Users" },
};

const severityTone: Record<Alert["severity"], string> = {
  critical: "text-critical bg-critical/10 border-critical/20",
  warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  info: "text-info bg-info/10 border-info/20",
};

function AlertRow({ alert }: { alert: Alert }) {
  const meta = componentMeta[alert.component];
  const Icon = alert.severity === "critical" ? AlertTriangle : meta.icon;
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background/40 p-3 transition-colors hover:bg-secondary/40">
      <div
        className={cn(
          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
          severityTone[alert.severity],
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium leading-tight">{alert.title}</p>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {relativeTime(alert.at)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{alert.message}</p>
        <span className="mt-1.5 inline-block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {meta.label}
        </span>
      </div>
    </div>
  );
}

export function AlertsFeed({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        No alerts. Add some under “Manage alerts” below.
      </p>
    );
  }
  return (
    <AnimatedList delay={900} className="gap-2">
      {alerts.map((a) => (
        <AlertRow key={a.id} alert={a} />
      ))}
    </AnimatedList>
  );
}
