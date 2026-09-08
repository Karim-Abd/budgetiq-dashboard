// Finance domain helpers: the vocabulary the section is built from, plus the
// pure math behind the tiles and the cash-flow chart.

export type Cycle = "weekly" | "monthly" | "quarterly" | "yearly";

export const CYCLES: Cycle[] = ["weekly", "monthly", "quarterly", "yearly"];

export const CYCLE_LABELS: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

// Every cycle expressed as a per-month multiplier, so a mixed set of yearly and
// monthly subscriptions can be added into one comparable run-rate.
const PER_MONTH: Record<Cycle, number> = {
  weekly: 52 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

/** A subscription's cost normalised to one month. Unknown cycles count as monthly. */
export function monthlyAmount(amount: number, cycle: string): number {
  const factor = PER_MONTH[cycle as Cycle] ?? 1;
  return amount * factor;
}

export const EXPENSE_CATEGORIES = [
  "software",
  "hosting",
  "marketing",
  "contractors",
  "fees",
  "hardware",
  "travel",
  "office",
  "taxes",
  "other",
];

export const INCOME_CATEGORIES = [
  "subscriptions",
  "one_off",
  "consulting",
  "affiliate",
  "refund",
  "other",
];

export const METHODS = ["bank", "card", "stripe", "paypal", "cash", "other"];

export const CATEGORY_LABELS: Record<string, string> = {
  software: "Software",
  hosting: "Hosting",
  marketing: "Marketing",
  contractors: "Contractors",
  fees: "Fees",
  hardware: "Hardware",
  travel: "Travel",
  office: "Office",
  taxes: "Taxes",
  subscriptions: "Subscriptions",
  one_off: "One-off",
  consulting: "Consulting",
  affiliate: "Affiliate",
  refund: "Refund",
  other: "Other",
};

export const METHOD_LABELS: Record<string, string> = {
  bank: "Bank",
  card: "Card",
  stripe: "Stripe",
  paypal: "PayPal",
  cash: "Cash",
  other: "Other",
};

// ---------------------------------------------------------------------------
// DATES
// ---------------------------------------------------------------------------

/**
 * Split a Postgres `date` ("2026-09-08") into local calendar parts.
 *
 * Deliberately NOT `new Date(str)`: that reads a bare date as UTC midnight, so
 * anyone west of Greenwich sees the previous day — which silently files every
 * first-of-the-month transaction under the month before.
 */
function parseDay(value: unknown): { y: number; m: number } | null {
  const match = /^(\d{4})-(\d{2})/.exec(String(value ?? ""));
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]) - 1 };
}

/** "2026-09" for the month a row belongs to. */
export function monthKey(value: unknown): string | null {
  const d = parseDay(value);
  if (!d) return null;
  return `${d.y}-${String(d.m + 1).padStart(2, "0")}`;
}

export function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Previous month's key, for the month-over-month deltas on the tiles. */
export function previousMonthKey(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return currentMonthKey(d);
}

function labelForKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

// ---------------------------------------------------------------------------
// AGGREGATION
// ---------------------------------------------------------------------------

export interface MonthBucket {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * The last `count` months (oldest → newest), including months with no activity
 * so the chart keeps an even time axis instead of collapsing empty gaps.
 */
export function cashflowSeries(
  rows: Record<string, unknown>[],
  count = 6,
  now = new Date(),
): MonthBucket[] {
  const buckets = new Map<string, MonthBucket>();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = currentMonthKey(d);
    buckets.set(key, { key, label: labelForKey(key), income: 0, expense: 0, net: 0 });
  }

  for (const row of rows) {
    const key = monthKey(row.occurred_on);
    const bucket = key ? buckets.get(key) : undefined;
    if (!bucket) continue; // older than the window, or an unparseable date
    if (row.kind === "income") bucket.income += num(row.amount);
    else bucket.expense += num(row.amount);
  }

  const series = Array.from(buckets.values());
  for (const b of series) b.net = b.income - b.expense;
  return series;
}

export interface CategorySlice {
  category: string;
  label: string;
  total: number;
  share: number; // 0–1 of the kind's total
}

/**
 * Totals per category for one kind, biggest first. `month` narrows to a single
 * month key; omit it for all time.
 */
export function categoryTotals(
  rows: Record<string, unknown>[],
  kind: "income" | "expense",
  month?: string,
): CategorySlice[] {
  const totals = new Map<string, number>();
  let sum = 0;

  for (const row of rows) {
    if (row.kind !== kind) continue;
    if (month && monthKey(row.occurred_on) !== month) continue;
    const category = String(row.category ?? "other") || "other";
    const amount = num(row.amount);
    totals.set(category, (totals.get(category) ?? 0) + amount);
    sum += amount;
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      total,
      // Guarded: an all-zero month would otherwise divide by zero and render NaN% bars.
      share: sum > 0 ? total / sum : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Today as a `<input type="date">` value, built from LOCAL parts.
 * `toISOString().slice(0, 10)` would be the UTC day — an evening entry in New
 * York would default to tomorrow's date.
 */
export function todayInputValue(now = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}
