-- ============================================================================
-- BudgetIQ OS — Finance (incremental migration)
-- ----------------------------------------------------------------------------
-- Two tables behind the Finance section:
--   finance_transactions  — every income and expense line, one row per event
--   finance_subscriptions — recurring commitments (the run-rate, not the events)
--
-- Unlike waitlist / support / content_onboarding, nothing on the public website
-- writes here. Finance is entered by the team in the OS, so there is no
-- service-role insert path — the authenticated policy is the only way in.
--
-- Safe to run against the live database — everything is idempotent. Paste into
-- the Supabase SQL editor, or `supabase db push` if you use the CLI.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- TRANSACTIONS
-- ---------------------------------------------------------------------------
-- Income and expenses share one table so net cash flow is a single scan rather
-- than a join. `amount` is always stored POSITIVE; `kind` carries the sign.
-- Storing it signed would let a mistyped minus flip an expense into revenue.
create table if not exists public.finance_transactions (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null default 'expense'
                  check (kind in ('income', 'expense')),
  occurred_on   date not null default current_date,
  amount        numeric(12,2) not null default 0
                  check (amount >= 0),
  category      text,
  -- Who the money came from (income) or went to (expense). One column, because
  -- a row is only ever one of the two and `kind` already says which.
  counterparty  text,
  description   text,
  method        text default 'bank',
  created_at    timestamptz default now()
);

-- The section reads newest-first and filters by kind on every tab, so the index
-- leads with kind and orders within it.
create index if not exists finance_transactions_kind_date_idx
  on public.finance_transactions (kind, occurred_on desc);

alter table public.finance_transactions enable row level security;
drop policy if exists "team_all" on public.finance_transactions;
create policy "team_all" on public.finance_transactions
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS
-- ---------------------------------------------------------------------------
-- Recurring commitments. These are deliberately NOT auto-expanded into
-- transaction rows: a subscription is a *commitment* (what you owe per month
-- going forward), a transaction is a *fact* (money that actually moved). Mixing
-- them would double-count the moment you also log the card charge. The run-rate
-- tile reads this table; the cash-flow chart reads only transactions.
create table if not exists public.finance_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  vendor       text,
  amount       numeric(12,2) not null default 0
                 check (amount >= 0),
  cycle        text not null default 'monthly'
                 check (cycle in ('weekly', 'monthly', 'quarterly', 'yearly')),
  category     text,
  status       text not null default 'active'
                 check (status in ('active', 'paused', 'cancelled')),
  next_charge  date,
  started_on   date,
  notes        text,
  created_at   timestamptz default now()
);

-- "What renews soon" is the query the Subscriptions tab opens with.
create index if not exists finance_subscriptions_status_next_idx
  on public.finance_subscriptions (status, next_charge);

alter table public.finance_subscriptions enable row level security;
drop policy if exists "team_all" on public.finance_subscriptions;
create policy "team_all" on public.finance_subscriptions
  for all to authenticated using (true) with check (true);
