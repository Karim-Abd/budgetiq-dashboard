import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  Code2,
  Settings2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** accent used for the active indicator + hover glow */
  accent: "info" | "growth";
}

export const navItems: NavItem[] = [
  {
    label: "Main Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Command center",
    accent: "info",
  },
  {
    label: "Content & Marketing",
    href: "/content",
    icon: Megaphone,
    description: "CMS, hooks, avatars",
    accent: "info",
  },
  {
    label: "Financial",
    href: "/financial",
    icon: Wallet,
    description: "Revenue, costs, P&L",
    accent: "growth",
  },
  {
    label: "Development",
    href: "/development",
    icon: Code2,
    description: "Backlog, bugs, sprint",
    accent: "info",
  },
  {
    label: "Operations",
    href: "/operations",
    icon: Settings2,
    description: "Feedback, KPIs, tools",
    accent: "info",
  },
];

export const dateRanges = [
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "Quarter to date",
  "Year to date",
] as const;

export type DateRange = (typeof dateRanges)[number];
