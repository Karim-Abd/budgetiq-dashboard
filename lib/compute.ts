// Pure, zero-safe aggregation of live DB rows into the shapes the UI renders.
// Everything tolerates empty input and returns zeros / empty arrays.

import type { Kpi, Trend } from "@/lib/mock-data";
import type { LiveData } from "@/lib/use-live";

const n = (v: unknown) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const monthLabel = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short" });

function sortAsc<T extends Record<string, unknown>>(rows: T[], key: string) {
  return [...rows].sort((a, b) => (String(a[key]) < String(b[key]) ? -1 : 1));
}
function pctDelta(curr: number, prev: number) {
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
}
function trendFrom(delta: number, inverse = false): Trend {
  if (Math.abs(delta) < 0.01) return "neutral";
  const good = inverse ? delta < 0 : delta > 0;
  return good ? "up" : "down";
}
function spark(values: number[]): number[] {
  const v = values.slice(-12);
  return v.length ? v : [0, 0];
}
function mkKpi(p: Partial<Kpi> & Pick<Kpi, "id" | "label" | "value" | "format">): Kpi {
  return {
    decimals: 0,
    delta: 0,
    trend: "neutral",
    spark: [0, 0],
    positive: true,
    ...p,
  };
}

// ---------------------------------------------------------------------------
// USER METRICS (dashboard)
// ---------------------------------------------------------------------------
export function userKpisFrom(data: LiveData): Kpi[] {
  const md = sortAsc(data.metrics_daily, "snapshot_date");
  const kw = sortAsc(data.kpi_weekly, "week_start");
  const last = md[md.length - 1] ?? {};
  const prev = md[md.length - 2] ?? {};
  const lw = kw[kw.length - 1] ?? {};
  const pw = kw[kw.length - 2] ?? {};

  const totalUsers = n(last.total_users) || data.app_users.length;
  const dau = n(last.dau);
  const mau = n(last.mau);
  const stick = mau ? (dau / mau) * 100 : 0;
  const prevStick = n(prev.mau) ? (n(prev.dau) / n(prev.mau)) * 100 : 0;

  const usersSeries = md.map((r) => n(r.total_users));
  const dauSeries = md.map((r) => n(r.dau));
  const mauSeries = md.map((r) => n(r.mau));
  const stickSeries = md.map((r) => (n(r.mau) ? (n(r.dau) / n(r.mau)) * 100 : 0));
  const d1Series = kw.map((r) => n(r.retention_d1));
  const d7Series = kw.map((r) => n(r.retention_d7));
  const d30Series = kw.map((r) => n(r.retention_d30));
  const churnSeries = kw.map((r) => n(r.monthly_churn));
  const actSeries = kw.map((r) => n(r.activation_rate));

  return [
    mkKpi({ id: "total_users", label: "Total users", value: totalUsers, format: "number", delta: pctDelta(totalUsers, n(prev.total_users)), trend: trendFrom(pctDelta(totalUsers, n(prev.total_users))), spark: spark(usersSeries), hint: "Registered accounts" }),
    mkKpi({ id: "dau", label: "DAU", value: dau, format: "number", delta: pctDelta(dau, n(prev.dau)), trend: trendFrom(pctDelta(dau, n(prev.dau))), spark: spark(dauSeries), hint: "Daily active users" }),
    mkKpi({ id: "mau", label: "MAU", value: mau, format: "number", delta: pctDelta(mau, n(prev.mau)), trend: trendFrom(pctDelta(mau, n(prev.mau))), spark: spark(mauSeries), hint: "Monthly active users" }),
    mkKpi({ id: "stickiness", label: "Stickiness", value: stick, format: "percent", decimals: 1, delta: stick - prevStick, trend: trendFrom(stick - prevStick), spark: spark(stickSeries), target: "Target 25%+", hint: "DAU ÷ MAU" }),
    mkKpi({ id: "ret_d1", label: "Day-1 retention", value: n(lw.retention_d1), format: "percent", decimals: 1, delta: n(lw.retention_d1) - n(pw.retention_d1), trend: trendFrom(n(lw.retention_d1) - n(pw.retention_d1)), spark: spark(d1Series), target: "Target 30%+" }),
    mkKpi({ id: "ret_d7", label: "Day-7 retention", value: n(lw.retention_d7), format: "percent", decimals: 1, delta: n(lw.retention_d7) - n(pw.retention_d7), trend: trendFrom(n(lw.retention_d7) - n(pw.retention_d7)), spark: spark(d7Series), target: "Target 15%+" }),
    mkKpi({ id: "ret_d30", label: "Day-30 retention", value: n(lw.retention_d30), format: "percent", decimals: 1, delta: n(lw.retention_d30) - n(pw.retention_d30), trend: trendFrom(n(lw.retention_d30) - n(pw.retention_d30)), spark: spark(d30Series), target: "Target 7–10%+" }),
    mkKpi({ id: "churn", label: "Monthly churn", value: n(lw.monthly_churn), format: "percent", decimals: 1, delta: n(lw.monthly_churn) - n(pw.monthly_churn), trend: trendFrom(n(lw.monthly_churn) - n(pw.monthly_churn), true), spark: spark(churnSeries), target: "Target <5%", hint: "Lower is better" }),
    mkKpi({ id: "activation", label: "Activation rate", value: n(lw.activation_rate), format: "percent", decimals: 1, delta: n(lw.activation_rate) - n(pw.activation_rate), trend: trendFrom(n(lw.activation_rate) - n(pw.activation_rate)), spark: spark(actSeries), hint: "Completed first budget" }),
  ];
}

// ---------------------------------------------------------------------------
// FINANCIAL METRICS
// ---------------------------------------------------------------------------
export function financeMetrics(data: LiveData) {
  const fs = sortAsc(data.financial_snapshots, "month");
  const kw = sortAsc(data.kpi_weekly, "week_start");
  const last = fs[fs.length - 1] ?? {};
  const prev = fs[fs.length - 2] ?? {};
  const churn = n(kw[kw.length - 1]?.monthly_churn);

  const activeSubsMrr = data.subscriptions
    .filter((s) => s.renewal_status === "active" || s.renewal_status === "at_risk")
    .reduce((sum, s) => sum + (s.billing_cycle === "annual" ? n(s.price) / 12 : n(s.price)), 0);

  const mrr = n(last.mrr) || activeSubsMrr;
  const arr = mrr * 12;
  const payingUsers = n(last.paying_users) || data.subscriptions.length;
  const arpu = payingUsers ? mrr / payingUsers : 0;
  const ltv = churn ? arpu / (churn / 100) : 0;
  const cac = n(last.new_customers) ? (n(last.marketing_spend) + n(last.sales_spend)) / n(last.new_customers) : 0;
  const ltvCac = cac ? ltv / cac : 0;
  const grossMargin = n(last.gross_margin_pct) || 0;
  const cacPayback = arpu && grossMargin ? cac / (arpu * (grossMargin / 100)) : 0;
  const startMrr = n(prev.mrr);
  const nrr = startMrr ? ((startMrr + n(last.expansion_mrr) - n(last.churned_mrr)) / startMrr) * 100 : 0;

  // monthly revenue/cost aggregation
  const byMonth = new Map<string, { revenue: number; costs: number }>();
  for (const r of data.revenue) {
    if (r.status && r.status !== "paid") continue;
    const k = String(r.payment_date ?? "").slice(0, 7);
    if (!k) continue;
    const e = byMonth.get(k) ?? { revenue: 0, costs: 0 };
    e.revenue += n(r.amount);
    byMonth.set(k, e);
  }
  for (const x of data.expenses) {
    const k = String(x.expense_date ?? "").slice(0, 7);
    if (!k) continue;
    const e = byMonth.get(k) ?? { revenue: 0, costs: 0 };
    e.costs += n(x.amount);
    byMonth.set(k, e);
  }
  const pnl = Array.from(byMonth.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => ({ month: monthLabel(k + "-01"), revenue: Math.round(v.revenue), costs: Math.round(v.costs), net: Math.round(v.revenue - v.costs), profit: Math.round(v.revenue - v.costs) }));

  const mrrTrend = fs.map((r) => ({ month: monthLabel(String(r.month)), mrr: n(r.mrr) }));

  const catMap = new Map<string, number>();
  for (const x of data.expenses) {
    const c = String(x.category ?? "other");
    catMap.set(c, (catMap.get(c) ?? 0) + n(x.amount));
  }
  const costByCategory = Array.from(catMap.entries())
    .map(([category, amount]) => ({ category: category[0].toUpperCase() + category.slice(1), amount: Math.round(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const thisMonthCosts = pnl[pnl.length - 1]?.costs ?? 0;
  const thisMonthRev = pnl[pnl.length - 1]?.revenue ?? 0;
  const burn = Math.max(0, thisMonthCosts - thisMonthRev);
  const cashOnHand = n(last.cash_on_hand);
  const runwayMonths = burn ? cashOnHand / burn : 0;

  const mrrSeries = fs.map((r) => n(r.mrr));
  const saas = { arpu, ltv, cac, ltvCac, cacPayback, nrr, grossMargin, burn, cashOnHand, runwayMonths };

  const kpis: Kpi[] = [
    mkKpi({ id: "mrr", label: "MRR", value: mrr, format: "currency", delta: pctDelta(mrr, startMrr), trend: trendFrom(pctDelta(mrr, startMrr)), spark: spark(mrrSeries) }),
    mkKpi({ id: "arr", label: "ARR", value: arr, format: "currency", delta: pctDelta(mrr, startMrr), trend: trendFrom(pctDelta(mrr, startMrr)), spark: spark(mrrSeries.map((x) => x * 12)) }),
    mkKpi({ id: "ltv", label: "LTV", value: Math.round(ltv), format: "currency", spark: [0, 0], hint: "ARPU ÷ churn" }),
    mkKpi({ id: "cac", label: "CAC", value: Math.round(cac), format: "currency", spark: [0, 0], hint: "Lower is better" }),
    mkKpi({ id: "ltv_cac", label: "LTV : CAC", value: ltvCac, format: "ratio", decimals: 1, spark: [0, 0], target: "Target 3:1+" }),
    mkKpi({ id: "cac_payback", label: "CAC payback", value: cacPayback, format: "months", decimals: 1, spark: [0, 0], hint: "Months" }),
    mkKpi({ id: "nrr", label: "NRR", value: nrr, format: "percent", decimals: 1, spark: [0, 0], hint: "Net revenue retention" }),
    mkKpi({ id: "arpu", label: "ARPU", value: arpu, format: "currency", decimals: 2, spark: [0, 0] }),
  ];

  return { kpis, saas, pnl, mrrTrend, costByCategory, mrr, arr };
}

// ---------------------------------------------------------------------------
// DASHBOARD COMPOSITES
// ---------------------------------------------------------------------------
export function dashboardData(data: LiveData) {
  const users = userKpisFrom(data);
  const fin = financeMetrics(data);
  const stickiness = users.find((k) => k.id === "stickiness")?.value ?? 0;
  const mrrDelta = fin.kpis.find((k) => k.id === "mrr")?.delta ?? 0;

  const revenueTrend = fin.pnl.map((p) => ({ month: p.month, revenue: p.revenue, costs: p.costs, profit: p.profit }));

  const publishedPosts = data.posts.filter((p) => p.status === "published");
  const topPost = [...publishedPosts].sort((a, b) => n(b.engagement_rate) - n(a.engagement_rate))[0] ?? null;
  const topHook = [...data.hooks].sort((a, b) => n(b.performance_score) - n(a.performance_score))[0] ?? null;

  const alerts = [...data.alerts]
    .sort((a, b) => (String(b.created_at) < String(a.created_at) ? -1 : 1))
    .map((a) => ({
      id: String(a.id),
      component: (a.component ?? "users") as "content" | "financial" | "development" | "operations" | "users",
      severity: (a.severity ?? "info") as "critical" | "warning" | "info",
      title: String(a.title ?? ""),
      message: String(a.message ?? ""),
      at: String(a.created_at ?? new Date().toISOString()),
    }));

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return {
    userKpis: users,
    financialKpis: fin.kpis,
    headline: {
      totalUsers: users.find((k) => k.id === "total_users")?.value ?? 0,
      mrr: fin.mrr,
      arr: fin.arr,
      runway: fin.saas.runwayMonths,
      cashOnHand: fin.saas.cashOnHand,
      burn: fin.saas.burn,
      stickiness,
      mrrDelta,
    },
    revenueTrend,
    topPost,
    topHook,
    alerts,
    criticalCount,
  };
}

// ---------------------------------------------------------------------------
// PER-PAGE STATS + PANEL DATA
// ---------------------------------------------------------------------------
export function contentStats(data: LiveData) {
  const published = data.posts.filter((p) => p.status === "published");
  const avgEng = published.length
    ? published.reduce((s, p) => s + n(p.engagement_rate), 0) / published.length
    : 0;
  const reels = data.posts.filter((p) => p.format === "Reel").length;
  return {
    posts: data.posts.length,
    scheduled: data.posts.filter((p) => p.status === "scheduled").length,
    avgEngagement: avgEng,
    reelsShare: data.posts.length ? (reels / data.posts.length) * 100 : 0,
    applicants: data.content_onboarding.length,
    newApplicants: data.content_onboarding.filter((a) => a.status === "new").length,
  };
}

export function devStats(data: LiveData) {
  return {
    inProgress: data.dev_tasks.filter((t) => t.status === "in_progress").length,
    done: data.dev_tasks.filter((t) => t.status === "done").length,
    openBugs: data.bugs.filter((b) => b.status === "open" || b.status === "in_progress").length,
    criticalBugs: data.bugs.filter((b) => b.severity === "critical").length,
    backlog: data.features.filter((f) => f.status !== "shipped" && f.status !== "rejected").length,
  };
}

export function opsStats(data: LiveData) {
  const kw = sortAsc(data.kpi_weekly, "week_start");
  const steps = sortAsc(data.onboarding_steps, "step_order");
  return {
    waitlist: data.waitlist.length,
    newFeedback: data.feedback.filter((f) => f.status === "new").length,
    nps: n(kw[kw.length - 1]?.nps),
    toolSpend: data.tools.filter((t) => t.status === "active").reduce((s, t) => s + n(t.cost_month), 0),
    activation: n(steps[steps.length - 1]?.completion_rate),
  };
}

export function kpiWeeklySeries(data: LiveData) {
  return sortAsc(data.kpi_weekly, "week_start").map((r, i) => ({
    week: `W${i + 1}`,
    growth: n(r.user_growth_rate),
    activation: n(r.activation_rate),
    retentionD7: n(r.retention_d7),
    churn: n(r.monthly_churn),
    nps: n(r.nps),
    supportResolution: n(r.support_resolution_rate),
  }));
}

export function onboardingFunnel(data: LiveData) {
  return sortAsc(data.onboarding_steps, "step_order").map((r) => ({
    name: String(r.name ?? ""),
    completion: n(r.completion_rate),
  }));
}
