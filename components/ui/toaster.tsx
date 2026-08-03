"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useToastStore } from "@/lib/toast";

const toneMeta = {
  success: { icon: CheckCircle2, color: "text-growth", ring: "border-growth/30" },
  error: { icon: XCircle, color: "text-critical", ring: "border-critical/30" },
  default: { icon: Info, color: "text-info", ring: "border-info/30" },
} as const;

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const meta = toneMeta[t.tone];
        const Icon = meta.icon;
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex animate-fade-up items-start gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur",
              meta.ring,
            )}
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.color)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
