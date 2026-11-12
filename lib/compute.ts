// Pure, zero-safe aggregation of live DB rows into the stat tiles each section
// renders. Everything tolerates empty input and returns zeros.

import type { LiveData } from "@/lib/use-live";
import {
  currentMonthKey,
  monthKey,
  monthlyAmount,
  previousMonthKey,
  todayInputValue as currentDay,
} from "@/lib/finance";

const DAY_MS = 86_400_000;

/** Rows created within the last `days` days. Rows without a date never count. */
function withinDays(rows: Record<string, unknown>[], days: number) {
  const cutoff = Date.now() - days * DAY_MS;
  return rows.filter((r) => {
    const t = Date.parse(String(r.created_at ?? ""));
    return Number.isFinite(t) && t >= cutoff;
  }).length;
}

function countBy(rows: Record<string, unknown>[], key: string, value: string) {
  return rows.filter((r) => r[key] === value).length;
}

// ---------------------------------------------------------------------------
// CUSTOMER SUPPORT
// ---------------------------------------------------------------------------
const OPEN_STATUSES = ["new", "in_progress", "waiting"];

export function supportStats(data: LiveData) {
  const rows = data.support_tickets;
  const open = rows.filter((r) => OPEN_STATUSES.includes(String(r.status)));

  return {
    total: rows.length,
    open: open.length,
    unanswered: countBy(rows, "status", "new"),
    // Urgent/high only counts while still open — a resolved fire isn't a fire.
    urgent: open.filter((r) => r.priority === "urgent" || r.priority === "high").length,
    resolved: rows.filter(
      (r) => r.status === "resolved" || r.status === "closed",
    ).length,
    last7: withinDays(rows, 7),
  };
}

// ---------------------------------------------------------------------------
// ONBOARDING ANSWERS (content team applicants)
// ---------------------------------------------------------------------------
export function applicantStats(data: LiveData) {
  const rows = data.content_onboarding;

  return {
    total: rows.length,
    awaiting: countBy(rows, "status", "new"),
    shortlisted: countBy(rows, "status", "shortlisted"),
    onboarded: countBy(rows, "status", "onboarded"),
    last7: withinDays(rows, 7),
  };
}

// ---------------------------------------------------------------------------
// FINANCE
// ---------------------------------------------------------------------------

const amountOf = (r: Record<string, unknown>) => {
  const n = Number(r.amount);
  return Number.isFinite(n) ? n : 0;
};

function sumMonth(
  rows: Record<string, unknown>[],
  kind: "income" | "expense",
  month: string,
) {
  return rows
    .filter((r) => r.kind === kind && monthKey(r.occurred_on) === month)
    .reduce((t, r) => t + amountOf(r), 0);
}

/** Percent change, or null when there's no prior month to compare against. */
function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export function financeStats(data: LiveData) {
  const tx = data.finance_transactions;
  const subs = data.finance_subscriptions;
  const thisMonth = currentMonthKey();
  const lastMonth = previousMonthKey();

  const income = sumMonth(tx, "income", thisMonth);
  const expense = sumMonth(tx, "expense", thisMonth);
  const prevIncome = sumMonth(tx, "income", lastMonth);
  const prevExpense = sumMonth(tx, "expense", lastMonth);

  const active = subs.filter((s) => s.status === "active");
  // Mixed billing cycles are only comparable once normalised to one month.
  const runRate = active.reduce(
    (t, s) => t + monthlyAmount(amountOf(s), String(s.cycle ?? "monthly")),
    0,
  );

  // Soonest upcoming renewal among active subs. Dates are YYYY-MM-DD, which
  // sorts correctly as plain strings — no parsing, no timezone to get wrong.
  const today = currentDay();
  const upcoming = active
    .map((s) => String(s.next_charge ?? ""))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= today)
    .sort();

  const allIncome = tx.filter((r) => r.kind === "income").reduce((t, r) => t + amountOf(r), 0);
  const allExpense = tx.filter((r) => r.kind === "expense").reduce((t, r) => t + amountOf(r), 0);

  return {
    income,
    expense,
    net: income - expense,
    incomeDelta: delta(income, prevIncome),
    expenseDelta: delta(expense, prevExpense),
    prevNet: prevIncome - prevExpense,
    runRate,
    nextRenewal: upcoming[0] ?? null,
    activeSubs: active.length,
    totalSubs: subs.length,
    allIncome,
    allExpense,
    balance: allIncome - allExpense,
    count: tx.length,
  };
}

// ---------------------------------------------------------------------------
// PARTNERSHIPS
// ---------------------------------------------------------------------------
const EXPIRING_WINDOW_DAYS = 30;

/** YYYY-MM-DD `days` from today, in local time to match `currentDay()`. */
function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return currentDay(d);
}

export function partnershipStats(data: LiveData) {
  const rows = data.partnerships;
  const today = currentDay();
  const horizon = dayOffset(EXPIRING_WINDOW_DAYS);

  // Same plain-string date comparison as financeStats. A blank expiry is an
  // open-ended deal, so it counts as active and never as expiring.
  const expiryOf = (r: Record<string, unknown>) => {
    const d = String(r.expires_on ?? "");
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  };
  const expired = rows.filter((r) => {
    const d = expiryOf(r);
    return d !== null && d < today;
  });
  const upcoming = rows
    .map(expiryOf)
    .filter((d): d is string => d !== null && d >= today)
    .sort();

  return {
    total: rows.length,
    active: rows.length - expired.length,
    expired: expired.length,
    expiringSoon: upcoming.filter((d) => d <= horizon).length,
    nextExpiry: upcoming[0] ?? null,
    windowDays: EXPIRING_WINDOW_DAYS,
  };
}
