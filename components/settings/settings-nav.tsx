"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plug, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/settings/team", label: "Team", icon: Users },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-1 border-b border-border">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-info text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
