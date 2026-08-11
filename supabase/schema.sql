-- ============================================================================
-- BudgetIQ OS — Core schema (Supabase)
-- ----------------------------------------------------------------------------
-- This file holds only the shared foundation: the updated_at helper, team
-- profiles, and the trigger that turns a new auth user into a profile row.
--
-- The three tables the OS actually displays each live in their own idempotent
-- migration, because the public website writes into them:
--   waitlist.sql            → Waitlist section
--   support_tickets.sql     → Customer Support section
--   content_onboarding.sql  → Onboarding Answers section
--
-- Run this file FIRST — support_tickets.sql attaches a trigger to the
-- set_updated_at() helper defined here. Everything is idempotent, so it is safe
-- to re-run against the live database. Paste into the Supabase SQL editor, or
-- use `supabase db push` if you use the CLI.
--
-- Conventions:
--   * uuid PKs via gen_random_uuid()
--   * created_at / updated_at on mutable tables (updated_at via trigger)
--   * status/enum-like fields use CHECK constraints for flexibility
--   * Row Level Security on; team members (authenticated) get full access
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- TEAM
-- ===========================================================================

-- Team members (1:1 with auth.users). Team = anyone who can log into the OS.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text unique,
  role        text not null default 'member' check (role in ('owner','admin','member')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS: team members (authenticated) get full access. Tighten per-role later;
-- for an internal team OS this is the working baseline.
alter table public.profiles enable row level security;
drop policy if exists "team_all" on public.profiles;
create policy "team_all" on public.profiles
  for all to authenticated using (true) with check (true);

-- Profiles: a new auth user gets a profile row automatically.
-- The very first account becomes the owner; later accounts take the role passed
-- in user metadata (set by the admin team portal), defaulting to 'member'.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  existing_count integer;
  assigned_role text;
begin
  select count(*) into existing_count from public.profiles;
  if existing_count = 0 then
    assigned_role := 'owner';
  else
    assigned_role := coalesce(new.raw_user_meta_data->>'role', 'member');
    if assigned_role not in ('owner','admin','member') then
      assigned_role := 'member';
    end if;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    assigned_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
