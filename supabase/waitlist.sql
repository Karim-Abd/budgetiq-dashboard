-- ============================================================================
-- BudgetIQ OS — Waitlist (incremental migration)
-- ----------------------------------------------------------------------------
-- Email signups from the public website's "Join the Waitlist" popup land here.
-- Inserts come from the website server (service-role key, bypassing RLS); the
-- team reads them with their authenticated session.
--
-- Safe to run against the live database — everything is idempotent. Paste into
-- the Supabase SQL editor, or `supabase db push` if you use the CLI.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text not null default 'website',
  -- nullable so a manual "New signup" from the OS (which may leave the date
  -- blank) doesn't violate NOT NULL; website inserts omit it and get now().
  created_at  timestamptz default now()
);
create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

-- RLS: team members (authenticated) get full read/write, same baseline as every
-- other table. Public inserts do NOT go through here — they use the service-role
-- key on the website server, which bypasses RLS.
alter table public.waitlist enable row level security;
drop policy if exists "team_all" on public.waitlist;
create policy "team_all" on public.waitlist
  for all to authenticated using (true) with check (true);
