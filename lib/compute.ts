// Pure, zero-safe aggregation of live DB rows into the stat tiles each section
// renders. Everything tolerates empty input and returns zeros.

import type { LiveData } from "@/lib/use-live";

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
// WAITLIST
// ---------------------------------------------------------------------------
export function waitlistStats(data: LiveData) {
  const rows = data.waitlist;

  // Most common source, so it's obvious where signups actually come from.
  const bySource = new Map<string, number>();
  for (const r of rows) {
    const s = String(r.source ?? "unknown");
    bySource.set(s, (bySource.get(s) ?? 0) + 1);
  }
  const top = Array.from(bySource.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    total: rows.length,
    last7: withinDays(rows, 7),
    last30: withinDays(rows, 30),
    topSource: top?.[0] ?? "—",
    topSourceCount: top?.[1] ?? 0,
  };
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
