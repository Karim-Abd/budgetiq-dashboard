"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LifeBuoy } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { Wordmark } from "@/components/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/" className="group">
          <Wordmark />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="eyebrow px-2 pb-2 pt-2">Workspace</p>
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              {active && (
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full",
                    item.accent === "growth" ? "bg-growth" : "bg-info",
                  )}
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active
                    ? item.accent === "growth"
                      ? "text-growth"
                      : "text-info"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="flex-1 truncate font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <TooltipProvider delayDuration={120}>
          <div className="flex items-center justify-between">
            <Link
              href="/settings/team"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground",
                pathname.startsWith("/settings") && "bg-secondary text-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
              <span className="font-medium">Settings</span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
                  <LifeBuoy className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Help & docs</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </aside>
  );
}
