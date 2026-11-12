import {
  LifeBuoy,
  ClipboardList,
  Wallet,
  Handshake,
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
// website writes into; Finance and Partnerships are the exception — the team
// enters them here.
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
  {
    label: "Partnerships",
    href: "/partnerships",
    icon: Handshake,
    description: "Deals signed and when they expire",
    accent: "growth",
  },
];
