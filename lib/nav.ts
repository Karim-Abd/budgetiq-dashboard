import {
  UserPlus,
  LifeBuoy,
  ClipboardList,
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

// Three sections, each backed by one table the public website writes into.
export const navItems: NavItem[] = [
  {
    label: "Waitlist",
    href: "/",
    icon: UserPlus,
    description: "Email signups",
    accent: "growth",
  },
  {
    label: "Customer Support",
    href: "/support",
    icon: LifeBuoy,
    description: "Tickets from the website",
    accent: "info",
  },
  {
    label: "Onboarding Answers",
    href: "/applicants",
    icon: ClipboardList,
    description: "Content team applications",
    accent: "info",
  },
];
