import type { EntityConfig } from "@/components/data/crud-table";

// Field schemas for the editable tables. Keys match the Supabase columns 1:1.
// `mock` seeds (snake_case, with an id) keep the UI alive before Supabase is
// connected; once it is, useCrud reads live rows instead.

export const waitlistEntity: EntityConfig = {
  table: "waitlist",
  title: "Waitlist signups",
  singular: "signup",
  orderBy: "created_at",
  description: "collected from the website's Join the Waitlist popup",
  fields: [
    { key: "email", label: "Email", type: "text", required: true, placeholder: "ava@uni.edu" },
    { key: "source", label: "Source", type: "select", options: ["website", "referral", "manual", "other"], optionLabels: { website: "Website", referral: "Referral", manual: "Manual", other: "Other" }, badgeMap: { website: "info", referral: "growth", manual: "muted", other: "muted" } },
    { key: "created_at", label: "Signed up", type: "date" },
  ],
  mock: [
    { id: "wl1", email: "ava.chen@uni.edu", source: "website", created_at: "2026-07-08" },
    { id: "wl2", email: "liam.ortiz@uni.edu", source: "website", created_at: "2026-07-07" },
    { id: "wl3", email: "noah.kim@uni.edu", source: "referral", created_at: "2026-07-05" },
  ],
};

export const supportTicketsEntity: EntityConfig = {
  table: "support_tickets",
  title: "Support tickets",
  singular: "ticket",
  orderBy: "created_at",
  description: "filed from the website /support form",
  fields: [
    { key: "name", label: "Name", type: "text", placeholder: "Ava Chen" },
    { key: "email", label: "Email", type: "text", required: true, placeholder: "ava@uni.edu" },
    { key: "type", label: "Type", type: "select", options: ["complaint", "bug", "billing", "account", "question", "other"], optionLabels: { complaint: "Complaint", bug: "Bug", billing: "Billing", account: "Account", question: "Question", other: "Other" }, badgeMap: { complaint: "critical", bug: "critical", billing: "info", account: "secondary", question: "info", other: "muted" } },
    { key: "subject", label: "Subject", type: "text", placeholder: "Short summary" },
    { key: "message", label: "Message", type: "textarea", required: true },
    { key: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"], badgeMap: { low: "muted", medium: "info", high: "critical", urgent: "critical" } },
    { key: "status", label: "Status", type: "select", options: ["new", "in_progress", "waiting", "resolved", "closed"], optionLabels: { new: "New", in_progress: "In Progress", waiting: "Waiting", resolved: "Resolved", closed: "Closed" }, badgeMap: { new: "info", in_progress: "secondary", waiting: "muted", resolved: "growth", closed: "muted" } },
    // Stamped by Postgres on insert, so it is shown but never written back.
    { key: "created_at", label: "Received", type: "datetime", readOnly: true },
  ],
  mock: [
    { id: "st1", name: "Noah Kim", email: "noah.kim@uni.edu", type: "billing", subject: "Charged twice for Pro", message: "I was billed $9.99 twice on the same day — can you refund the duplicate?", priority: "high", status: "new", created_at: "2026-08-16T09:12:00Z" },
    { id: "st2", name: "Mia Patel", email: "mia.patel@uni.edu", type: "bug", subject: "Bank sync stuck", message: "Connecting my bank spins forever on the last step.", priority: "medium", status: "in_progress", created_at: "2026-08-14T16:38:00Z" },
  ],
};
