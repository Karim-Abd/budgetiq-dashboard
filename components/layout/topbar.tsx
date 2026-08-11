"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { navItems } from "@/lib/nav";
import { apiPath } from "@/lib/base-path";
import { Wordmark } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function useSectionLabel() {
  const pathname = usePathname();
  if (pathname.startsWith("/settings")) return "Settings";
  const match = navItems.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );
  return match?.label ?? "BudgetIQ OS";
}

interface SessionUser {
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  isAdmin: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ user }: { user: SessionUser | null }) {
  const label = useSectionLabel();

  const displayName = user?.name ?? "Local session";
  const displayEmail = user?.email || "Supabase not connected";
  const roleLabel = user ? user.role[0].toUpperCase() + user.role.slice(1) : "Demo";

  async function signOut() {
    await fetch(apiPath("/api/auth/signout"), { method: "POST" });
    window.location.href = apiPath("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile nav */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:hidden">
            <Menu className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/team">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="lg:hidden">
        <Wordmark />
      </div>

      <div className="hidden items-baseline gap-2 lg:flex">
        <h1 className="text-base font-semibold tracking-tight">{label}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-growth/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-growth" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Live
          </span>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-growth/30 to-info/30 text-foreground">
                  {user ? initials(displayName) : "BIQ"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayEmail} · {roleLabel}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/settings/team">Team accounts</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut} className="text-critical">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
