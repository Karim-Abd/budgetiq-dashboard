import type { EntityConfig } from "@/components/data/crud-table";
import {
  CATEGORY_LABELS,
  CYCLES,
  CYCLE_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  METHODS,
  METHOD_LABELS,
  todayInputValue,
} from "@/lib/finance";

// Field schemas for the editable tables. Keys match the Supabase columns 1:1.
// `mock` seeds (snake_case, with an id) keep the UI alive before Supabase is
// connected; once it is, useCrud reads live rows instead.

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

// ---------------------------------------------------------------------------
// FINANCE
// ---------------------------------------------------------------------------
// Income and Expenses are two views of one table. `filter` both narrows the
// read and stamps `kind` onto new rows, so neither form has to ask.

const moneyFields = (kind: "income" | "expense") => [
  {
    key: "occurred_on",
    label: "Date",
    type: "date" as const,
    required: true,
    defaultValue: todayInputValue,
  },
  {
    key: "amount",
    label: "Amount",
    type: "currency" as const,
    required: true,
    placeholder: "0.00",
  },
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    options: kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES,
    optionLabels: CATEGORY_LABELS,
  },
  {
    key: "counterparty",
    label: kind === "income" ? "From" : "Paid to",
    type: "text" as const,
    placeholder: kind === "income" ? "Stripe payout" : "Vercel",
  },
  {
    key: "description",
    label: "Note",
    type: "text" as const,
    placeholder: "What was this for?",
  },
  {
    key: "method",
    label: "Method",
    type: "select" as const,
    options: METHODS,
    optionLabels: METHOD_LABELS,
  },
];

export const financeIncomeEntity: EntityConfig = {
  table: "finance_transactions",
  title: "Income",
  singular: "income line",
  orderBy: "occurred_on",
  filter: { kind: "income" },
  description: "money that came in",
  fields: moneyFields("income"),
  mock: [
    { id: "in1", kind: "income", occurred_on: "2026-09-01", amount: 1840, category: "subscriptions", counterparty: "Stripe payout", description: "August subscriptions", method: "stripe" },
    { id: "in2", kind: "income", occurred_on: "2026-08-12", amount: 600, category: "consulting", counterparty: "Northwind", description: "Setup workshop", method: "bank" },
    { id: "in3", kind: "income", occurred_on: "2026-08-01", amount: 1520, category: "subscriptions", counterparty: "Stripe payout", description: "July subscriptions", method: "stripe" },
  ],
};

export const financeExpensesEntity: EntityConfig = {
  table: "finance_transactions",
  title: "Expenses",
  singular: "expense",
  orderBy: "occurred_on",
  filter: { kind: "expense" },
  description: "money that went out",
  fields: moneyFields("expense"),
  mock: [
    { id: "ex1", kind: "expense", occurred_on: "2026-09-03", amount: 240, category: "marketing", counterparty: "Meta Ads", description: "Launch campaign", method: "card" },
    { id: "ex2", kind: "expense", occurred_on: "2026-09-01", amount: 20, category: "hosting", counterparty: "Vercel", description: "Pro plan", method: "card" },
    { id: "ex3", kind: "expense", occurred_on: "2026-08-22", amount: 480, category: "contractors", counterparty: "Ana Ruiz", description: "Illustration set", method: "bank" },
    { id: "ex4", kind: "expense", occurred_on: "2026-08-05", amount: 25, category: "software", counterparty: "Supabase", description: "Pro plan", method: "card" },
  ],
};

export const financeSubscriptionsEntity: EntityConfig = {
  table: "finance_subscriptions",
  title: "Subscriptions",
  singular: "subscription",
  orderBy: "next_charge",
  ascending: true,
  description: "recurring commitments, normalized to a monthly run-rate",
  fields: [
    { key: "name", label: "Name", type: "text", required: true, placeholder: "Vercel Pro" },
    { key: "vendor", label: "Vendor", type: "text", placeholder: "Vercel" },
    { key: "amount", label: "Amount", type: "currency", required: true, placeholder: "0.00" },
    { key: "cycle", label: "Billed", type: "select", options: CYCLES, optionLabels: CYCLE_LABELS, badgeMap: { weekly: "muted", monthly: "info", quarterly: "muted", yearly: "secondary" } },
    { key: "category", label: "Category", type: "select", options: EXPENSE_CATEGORIES, optionLabels: CATEGORY_LABELS },
    { key: "status", label: "Status", type: "select", options: ["active", "paused", "cancelled"], optionLabels: { active: "Active", paused: "Paused", cancelled: "Cancelled" }, badgeMap: { active: "growth", paused: "muted", cancelled: "muted" } },
    { key: "next_charge", label: "Next charge", type: "date" },
    { key: "notes", label: "Notes", type: "textarea", hideInTable: true },
  ],
  mock: [
    { id: "sub1", name: "Vercel Pro", vendor: "Vercel", amount: 20, cycle: "monthly", category: "hosting", status: "active", next_charge: "2026-10-01", notes: "" },
    { id: "sub2", name: "Supabase Pro", vendor: "Supabase", amount: 25, cycle: "monthly", category: "software", status: "active", next_charge: "2026-10-05", notes: "" },
    { id: "sub3", name: "Resend", vendor: "Resend", amount: 240, cycle: "yearly", category: "software", status: "active", next_charge: "2027-02-14", notes: "Transactional email" },
    { id: "sub4", name: "Figma", vendor: "Figma", amount: 15, cycle: "monthly", category: "software", status: "paused", next_charge: null, notes: "Paused after rebrand" },
  ],
};

// ---------------------------------------------------------------------------
// PARTNERSHIPS
// ---------------------------------------------------------------------------

export const partnershipsEntity: EntityConfig = {
  table: "partnerships",
  title: "Partnerships",
  singular: "partnership",
  orderBy: "signed_on",
  description: "every deal signed, newest first",
  migration: "supabase/partnerships.sql",
  fields: [
    { key: "name", label: "Partner", type: "text", required: true, placeholder: "Acme Bank" },
    { key: "type", label: "Type", type: "select", options: ["brand", "creator", "affiliate", "sponsorship", "university", "other"], optionLabels: { brand: "Brand", creator: "Creator", affiliate: "Affiliate", sponsorship: "Sponsorship", university: "University", other: "Other" }, badgeMap: { brand: "info", creator: "growth", affiliate: "secondary", sponsorship: "info", university: "secondary", other: "muted" } },
    { key: "contact", label: "Contact", type: "text", placeholder: "jordan@acme.com" },
    { key: "signed_on", label: "Signed", type: "date", required: true, defaultValue: todayInputValue },
    // Left blank for an open-ended deal.
    { key: "expires_on", label: "Expires", type: "date" },
    { key: "details", label: "What's involved", type: "textarea", placeholder: "3 sponsored TikToks a month, 20% off Pro for their audience" },
  ],
  mock: [
    { id: "pt1", name: "Northwind Credit Union", type: "brand", contact: "partners@northwind.com", signed_on: "2026-09-15", expires_on: "2027-09-15", details: "Co-branded budgeting challenge; they cover prize money" },
    { id: "pt2", name: "Lena Ortiz", type: "creator", contact: "lena@ortiz.studio", signed_on: "2026-08-01", expires_on: "2026-12-01", details: "4 videos over 4 months, affiliate code LENA20" },
  ],
};
