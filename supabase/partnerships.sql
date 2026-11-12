-- ============================================================================
-- BudgetIQ OS — Partnerships (incremental migration)
-- ----------------------------------------------------------------------------
-- One table behind the Partnerships section: every deal the team has signed,
-- with when it was signed, when it runs out, and what it involves.
--
-- Like finance, nothing on the public website writes here. Partnerships are
-- entered by the team in the OS, so the authenticated policy is the only way in.
--
-- Safe to run against the live database — everything is idempotent. Paste into
-- the Supabase SQL editor, or `supabase db push` if you use the CLI.
-- ============================================================================

create extension if not exists "pgcrypto";

-- There is no status column on purpose: active / expiring / expired all follow
-- from `expires_on` and today's date, and a stored status would drift the day a
-- deal quietly ran out. A null `expires_on` means an open-ended deal.
create table if not exists public.partnerships (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         text default 'brand',
  contact      text,
  signed_on    date not null default current_date,
  expires_on   date,
  details      text,
  created_at   timestamptz default now(),
  check (expires_on is null or expires_on >= signed_on)
);

-- "What runs out next" is the question the section's tiles answer.
create index if not exists partnerships_expires_idx
  on public.partnerships (expires_on);

alter table public.partnerships enable row level security;
drop policy if exists "team_all" on public.partnerships;
create policy "team_all" on public.partnerships
  for all to authenticated using (true) with check (true);
