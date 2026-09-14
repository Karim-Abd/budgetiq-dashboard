import {
  LifeBuoy,
  ClipboardList,
  Wallet,
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

// Support and Onboarding Answers are each backed by one table the public
// website writes into; Finance is the exception — the team enters it here.
export const navItems: NavItem[] = [
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
  {
    label: "Finance",
    href: "/finance",
    icon: Wallet,
    description: "Income, expenses, subscriptions",
    accent: "growth",
  },
];
