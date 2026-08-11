-- ============================================================================
-- BudgetIQ OS — Support Tickets (incremental migration)
-- ----------------------------------------------------------------------------
-- Customer support tickets filed from the public website (budgetiq /support)
-- land here and surface in the Customer Support section. Inserts come from the website
-- server (service-role key, bypassing RLS); the team reads/updates them with
-- their authenticated session.
--
-- Safe to run against the live database — everything is idempotent. Paste into
-- the Supabase SQL editor, or `supabase db push` if you use the CLI.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text not null,
  type        text not null default 'issue'
              check (type in ('complaint','bug','billing','account','question','other')),
  subject     text,
  message     text not null,
  priority    text not null default 'medium'
              check (priority in ('low','medium','high','urgent')),
  status      text not null default 'new'
              check (status in ('new','in_progress','waiting','resolved','closed')),
  source      text not null default 'website',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists support_tickets_status_idx
  on public.support_tickets (status, created_at desc);

-- keep updated_at fresh on edits (reuses the shared helper from schema.sql)
drop trigger if exists set_updated_at on public.support_tickets;
create trigger set_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- RLS: team members (authenticated) get full read/write, same baseline as every
-- other table. Public inserts do NOT go through here — they use the service-role
-- key on the website server, which bypasses RLS.
alter table public.support_tickets enable row level security;
drop policy if exists "team_all" on public.support_tickets;
create policy "team_all" on public.support_tickets
  for all to authenticated using (true) with check (true);
