-- ============================================================================
-- BudgetIQ OS — Content team onboarding (incremental migration)
-- ----------------------------------------------------------------------------
-- Submissions from the hidden /onboarding page on the public website land here.
-- Inserts come from the website server (service-role key, bypassing RLS); the
-- team reads them with their authenticated session.
--
-- Safe to run against the live database — everything is idempotent. Paste into
-- the Supabase SQL editor, or `supabase db push` if you use the CLI.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.content_onboarding (
  id                    uuid primary key default gen_random_uuid(),

  -- Who they are
  full_name             text not null,
  email                 text not null,
  phone                 text,
  age                   text,
  location              text,
  occupation            text,

  -- Reach. platforms/tools are string arrays; handles is {platform: handle}.
  platforms             text[] not null default '{}',
  handles               jsonb  not null default '{}'::jsonb,
  total_followers       integer,
  avg_views             integer,
  best_post_url         text,
  best_post_why         text,
  tools                 text[] not null default '{}',
  portfolio_url         text,

  -- The qualifying long-answers, keyed by question id from
  -- budgetiq/lib/onboarding-questions.ts. Stored as jsonb so reworded or added
  -- questions don't need a schema change.
  vision_answers        jsonb  not null default '{}'::jsonb,
  commitment            text,
  hunger                smallint check (hunger between 1 and 10),

  -- Agreement
  agreement_signature   text,
  agreement_accepted_at timestamptz,

  -- Review pipeline
  status                text not null default 'new',
  notes                 text,
  source                text not null default 'website',
  created_at            timestamptz default now()
);

create index if not exists content_onboarding_created_at_idx
  on public.content_onboarding (created_at desc);
create index if not exists content_onboarding_status_idx
  on public.content_onboarding (status);
-- Not unique: someone re-applying after a rejection is a legitimate resubmit,
-- so duplicates are kept and deduped by a human at review time.
create index if not exists content_onboarding_email_idx
  on public.content_onboarding (email);

-- RLS: team members (authenticated) get full read/write, same baseline as every
-- other table. Public inserts do NOT go through here — they use the service-role
-- key on the website server, which bypasses RLS.
alter table public.content_onboarding enable row level security;
drop policy if exists "team_all" on public.content_onboarding;
create policy "team_all" on public.content_onboarding
  for all to authenticated using (true) with check (true);
