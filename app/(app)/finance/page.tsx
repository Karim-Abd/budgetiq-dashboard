"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Repeat,
  Scale,
  Wallet,
  TriangleAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useLive } from "@/lib/use-live";
import { financeStats } from "@/lib/compute";
import { formatCurrency, formatDate } from "@/lib/format";
import { cashflowSeries, categoryTotals, currentMonthKey } from "@/lib/finance";
import {
  financeExpensesEntity,
  financeIncomeEntity,
  financeSubscriptionsEntity,
} from "@/lib/entities";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { CrudTable } from "@/components/data/crud-table";
import { CashflowChart } from "@/components/finance/cashflow-chart";
import { CategoryBars } from "@/components/finance/category-bars";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "income", label: "Income" },
  { id: "expenses", label: "Expenses" },
  { id: "subscriptions", label: "Subscriptions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** "vs $1,520 last month" — the comparison the tile's number invites. */
function versusLastMonth(delta: number | null): string {
  if (delta === null) return "no activity last month";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(0)}% vs last month`;
}

export default function FinancePage() {
  const { data, missing } = useLive();
  const [tab, setTab] = useState<TabId>("overview");

  const stats = financeStats(data);
  const tx = data.finance_transactions;
  const month = currentMonthKey();

  const series = useMemo(() => cashflowSeries(tx, 6), [tx]);
  const expenseCategories = useMemo(() => categoryTotals(tx, "expense", month), [tx, month]);
  const incomeCategories = useMemo(() => categoryTotals(tx, "income", month), [tx, month]);

  const needsMigration = missing.some((t) => t.startsWith("finance_"));

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Section 03"
        title="Finance"
        description="The books for BudgetIQ. Log what comes in, what goes out, and what renews on its own, then read the month back as cash flow, category spend, and a subscription run-rate."
      />

      {needsMigration && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <div className="text-sm">
            <p className="font-medium">Finance tables aren&apos;t in the database yet</p>
            <p className="mt-1 text-muted-foreground">
              Run <code className="font-mono text-xs">supabase/finance.sql</code> in the Supabase
              SQL editor to create <code className="font-mono text-xs">finance_transactions</code>{" "}
              and <code className="font-mono text-xs">finance_subscriptions</code>. Until then this
              section reads as empty.
            </p>
          </div>
        </div>
      )}

      {/* Segmented control — four views of one section, so they share a page
          rather than adding four sidebar entries. */}
      <div className="mb-6 inline-flex rounded-lg border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Money in"
              value={formatCurrency(stats.income)}
              icon={ArrowDownLeft}
              accent="growth"
              sub={versusLastMonth(stats.incomeDelta)}
            />
            <StatTile
              label="Money out"
              value={formatCurrency(stats.expense)}
              icon={ArrowUpRight}
              accent="info"
              sub={versusLastMonth(stats.expenseDelta)}
            />
            <StatTile
              label="Net this month"
              value={formatCurrency(stats.net)}
              icon={Scale}
              accent={stats.net >= 0 ? "growth" : "critical"}
              sub={
                stats.net >= 0
                  ? `${formatCurrency(stats.prevNet)} last month`
                  : "spending more than you earned"
              }
            />
            <StatTile
              label="Subscriptions"
              value={`${formatCurrency(stats.runRate)}/mo`}
              icon={Repeat}
              accent="muted"
              sub={`${stats.activeSubs} active · ${formatCurrency(stats.runRate * 12)}/yr`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CashflowChart series={series} />
            </div>
            <CategoryBars
              slices={expenseCategories}
              title="Where the money goes"
              subtitle="Spend by category, this month"
              tone="out"
            />
          </div>
        </div>
      )}

      {tab === "income" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="This month"
              value={formatCurrency(stats.income)}
              icon={ArrowDownLeft}
              accent="growth"
              sub={versusLastMonth(stats.incomeDelta)}
            />
            <StatTile
              label="All time"
              value={formatCurrency(stats.allIncome)}
              icon={Wallet}
              accent="growth"
              sub="every income entry"
            />
            <StatTile
              label="Top source"
              value={incomeCategories[0]?.label ?? "—"}
              icon={ArrowDownLeft}
              accent="muted"
              sub={
                incomeCategories[0]
                  ? `${formatCurrency(incomeCategories[0].total)} this month`
                  : "nothing logged this month"
              }
            />
            <StatTile
              label="Balance"
              value={formatCurrency(stats.balance)}
              icon={Scale}
              accent={stats.balance >= 0 ? "growth" : "critical"}
              sub="all income minus all expenses"
            />
          </div>
          <CrudTable config={financeIncomeEntity} />
        </div>
      )}

      {tab === "expenses" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="This month"
              value={formatCurrency(stats.expense)}
              icon={ArrowUpRight}
              accent="info"
              sub={versusLastMonth(stats.expenseDelta)}
            />
            <StatTile
              label="All time"
              value={formatCurrency(stats.allExpense)}
              icon={Wallet}
              accent="info"
              sub="every expense logged"
            />
            <StatTile
              label="Biggest category"
              value={expenseCategories[0]?.label ?? "—"}
              icon={Scale}
              accent="muted"
              sub={
                expenseCategories[0]
                  ? `${formatCurrency(expenseCategories[0].total)} this month`
                  : "nothing logged this month"
              }
            />
            <StatTile
              label="Recurring share"
              value={`${formatCurrency(stats.runRate)}/mo`}
              icon={Repeat}
              accent="muted"
              sub="committed before you spend a thing"
            />
          </div>
          <CategoryBars
            slices={expenseCategories}
            title="Spend by category"
            subtitle="This month, biggest first"
            tone="out"
          />
          <CrudTable config={financeExpensesEntity} />
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Monthly run-rate"
              value={formatCurrency(stats.runRate)}
              icon={Repeat}
              accent="info"
              sub="every cycle normalized to a month"
            />
            <StatTile
              label="Yearly"
              value={formatCurrency(stats.runRate * 12)}
              icon={CalendarClock}
              accent="info"
              sub="run-rate × 12"
            />
            <StatTile
              label="Active"
              value={String(stats.activeSubs)}
              icon={Wallet}
              accent="growth"
              sub={`of ${stats.totalSubs} tracked`}
            />
            <StatTile
              label="Next renewal"
              value={stats.nextRenewal ? formatDate(stats.nextRenewal) : "—"}
              icon={CalendarClock}
              accent="muted"
              sub={stats.nextRenewal ? "soonest active charge" : "no dates set"}
            />
          </div>
          <CrudTable config={financeSubscriptionsEntity} />
        </div>
      )}
    </div>
  );
}
