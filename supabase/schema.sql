-- ============================================================================
-- BudgetIQ OS — Full PostgreSQL schema (Supabase)
-- ----------------------------------------------------------------------------
-- Layout mirrors the app: shared/core, user metrics, and the four operational
-- components (Content & Marketing, Financial, Development, Operations) plus
-- Integrations. Run in the Supabase SQL editor or via `supabase db push`.
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
-- CORE / SHARED
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

-- Cross-component alerts feed surfaced on the Main Dashboard.
create table if not exists public.alerts (
  id          uuid primary key default gen_random_uuid(),
  component   text not null check (component in ('content','financial','development','operations','users')),
  severity    text not null default 'info' check (severity in ('critical','warning','info')),
  title       text not null,
  message     text,
  metric      text,
  status      text not null default 'open' check (status in ('open','acknowledged','resolved')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists alerts_status_idx on public.alerts (status, created_at desc);

-- ===========================================================================
-- USERS & GROWTH METRICS  (Main Dashboard)
-- ===========================================================================

-- BudgetIQ end-users (the students using the app).
create table if not exists public.app_users (
  id             uuid primary key default gen_random_uuid(),
  external_id    text unique,
  email          text,
  signup_date    date not null default current_date,
  -- cast to plain timestamp so date_trunc resolves to the IMMUTABLE overload
  -- (date_trunc on timestamptz is only STABLE and a stored generated column
  -- requires an immutable expression).
  cohort_month   date generated always as (date_trunc('month', signup_date::timestamp)::date) stored,
  activated      boolean not null default false,
  activated_at   timestamptz,
  plan           text not null default 'free' check (plan in ('free','plus','pro')),
  status         text not null default 'active' check (status in ('active','churned','paused')),
  last_active_at timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists app_users_cohort_idx on public.app_users (cohort_month);
create index if not exists app_users_status_idx on public.app_users (status);

-- Daily product snapshots that power DAU/MAU, stickiness, churn, activation trends.
create table if not exists public.metrics_daily (
  snapshot_date    date primary key,
  total_users      integer not null default 0,
  new_users        integer not null default 0,
  dau              integer not null default 0,
  mau              integer not null default 0,
  activated_users  integer not null default 0,
  churned_users    integer not null default 0,
  created_at       timestamptz not null default now()
);

-- Retention by signup cohort. retained_pct is the share of the cohort active on `day_offset`.
create table if not exists public.retention_cohorts (
  cohort_month  date not null,
  day_offset    integer not null check (day_offset in (1,7,30)),
  retained_pct  numeric(5,2) not null default 0,
  primary key (cohort_month, day_offset)
);

-- ===========================================================================
-- COMPONENT 1 — CONTENT & MARKETING
-- ===========================================================================

-- 1.2 Instagram Avatar Framework
create table if not exists public.avatars (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  bio            text,
  visual_style   text,
  tone           text,
  content_pillars text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 1.3 Hook Script Library
create table if not exists public.hooks (
  id                uuid primary key default gen_random_uuid(),
  text              text not null,
  format            text check (format in ('Reel','Carousel','Story','Static')),
  category          text check (category in ('curiosity','pain_point','number_based','question','bold_claim')),
  date_tested       date,
  performance_score numeric(4,1) default 0,
  created_at        timestamptz not null default now()
);

-- 1.1 Content Management System — posts
-- Latest performance metrics are denormalized onto the row so the CMS edits a
-- single flat record; post_metrics (below) keeps the full history.
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  format       text not null check (format in ('Reel','Carousel','Story','Static')),
  caption      text,
  hook         text,
  avatar       text,
  hook_id      uuid references public.hooks(id) on delete set null,
  avatar_id    uuid references public.avatars(id) on delete set null,
  platform     text not null default 'Instagram',
  status       text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  publish_date date,
  reach        integer not null default 0,
  impressions  integer not null default 0,
  likes        integer not null default 0,
  comments     integer not null default 0,
  saves        integer not null default 0,
  shares       integer not null default 0,
  engagement_rate numeric(6,2) generated always as (
    case when reach > 0
      then round(((likes + comments + saves + shares)::numeric / reach) * 100, 2)
      else 0 end
  ) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists posts_status_idx on public.posts (status, publish_date desc);

-- 1.1 Performance log per post. Engagement rate is generated from the raw counts.
create table if not exists public.post_metrics (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid not null references public.posts(id) on delete cascade,
  recorded_at     timestamptz not null default now(),
  reach           integer not null default 0,
  impressions     integer not null default 0,
  likes           integer not null default 0,
  comments        integer not null default 0,
  saves           integer not null default 0,
  shares          integer not null default 0,
  engagement_rate numeric(6,2) generated always as (
    case when reach > 0
      then round(((likes + comments + saves + shares)::numeric / reach) * 100, 2)
      else 0 end
  ) stored
);
create index if not exists post_metrics_post_idx on public.post_metrics (post_id, recorded_at desc);

-- Avatar attribution links back to posts.post.avatar_id already; link hooks->post for the library view.
alter table public.hooks
  add column if not exists linked_post_id uuid references public.posts(id) on delete set null;

-- 1.3 A/B test tracker comparing two hooks
create table if not exists public.hook_ab_tests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  hook_a_id  uuid references public.hooks(id) on delete set null,
  hook_b_id  uuid references public.hooks(id) on delete set null,
  metric     text not null default 'engagement_rate',
  score_a    numeric(6,2) default 0,
  score_b    numeric(6,2) default 0,
  winner_id  uuid references public.hooks(id) on delete set null,
  status     text not null default 'running' check (status in ('running','complete')),
  notes      text,
  created_at timestamptz not null default now()
);

-- 1.4 AI Video Review Agent
create table if not exists public.video_reviews (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  video_url     text,
  rating        numeric(3,1) check (rating >= 0 and rating <= 10),
  hook_strength numeric(3,1),
  pacing        numeric(3,1),
  cta_score     numeric(3,1),
  caption_score numeric(3,1),
  suggestions   text,
  flagged       boolean generated always as (rating is not null and rating < 6) stored,
  status        text not null default 'reviewed' check (status in ('pending','reviewed')),
  reviewed_at   timestamptz not null default now()
);

-- 1.5 ConnectScraper
create table if not exists public.scraped_accounts (
  id              uuid primary key default gen_random_uuid(),
  account         text not null,
  post_type       text,
  hook            text,
  est_reach       integer default 0,
  engagement_rate numeric(6,2) default 0,
  notes           text,
  scraped_at      timestamptz not null default now()
);

-- 1.6 Weekly Optimization Report (archived snapshots)
create table if not exists public.weekly_reports (
  id                   uuid primary key default gen_random_uuid(),
  week_start           date not null,
  best_post_id         uuid references public.posts(id) on delete set null,
  worst_post_id        uuid references public.posts(id) on delete set null,
  top_hook_id          uuid references public.hooks(id) on delete set null,
  follower_growth_delta integer default 0,
  avg_engagement_rate  numeric(6,2) default 0,
  recommendations      text,
  created_at           timestamptz not null default now()
);

-- ===========================================================================
-- COMPONENT 2 — FINANCIAL
-- ===========================================================================

-- Revenue Tracker — individual payments
create table if not exists public.revenue (
  id             uuid primary key default gen_random_uuid(),
  payer          text not null,
  app_user_id    uuid references public.app_users(id) on delete set null,
  plan           text not null check (plan in ('plus','pro')),
  amount         numeric(10,2) not null,
  payment_date   date not null default current_date,
  payment_method text check (payment_method in ('card','apple_pay','google_pay','paypal')),
  status         text not null default 'paid' check (status in ('paid','pending','refunded','failed')),
  created_at     timestamptz not null default now()
);
create index if not exists revenue_date_idx on public.revenue (payment_date desc);

-- Subscription & Billing Manager
create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  app_user_id    uuid references public.app_users(id) on delete set null,
  payer          text not null,
  plan           text not null check (plan in ('plus','pro')),
  price          numeric(10,2) not null,
  billing_cycle  text not null default 'monthly' check (billing_cycle in ('monthly','annual')),
  billing_date   date not null,
  renewal_status text not null default 'active' check (renewal_status in ('active','canceled','past_due','at_risk')),
  started_at     date not null default current_date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists subscriptions_billing_idx on public.subscriptions (billing_date);

-- Cost & Expense Logger
create table if not exists public.expenses (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('tools','marketing','contractors','infra','legal','other')),
  vendor        text not null,
  amount        numeric(10,2) not null,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','annual','one_time')),
  expense_date  date not null default current_date,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists expenses_date_idx on public.expenses (expense_date desc);

-- Monthly financial snapshot — drives P&L, runway, and SaaS metrics that need
-- inputs not derivable from raw rows (marketing/sales spend, cash, gross margin).
create table if not exists public.financial_snapshots (
  month            date primary key,
  mrr              numeric(12,2) not null default 0,
  expansion_mrr    numeric(12,2) not null default 0,
  churned_mrr      numeric(12,2) not null default 0,
  new_customers    integer not null default 0,
  paying_users     integer not null default 0,
  marketing_spend  numeric(12,2) not null default 0,
  sales_spend      numeric(12,2) not null default 0,
  gross_margin_pct numeric(5,2) not null default 85,
  cash_on_hand     numeric(14,2) not null default 0,
  created_at       timestamptz not null default now()
);

-- ===========================================================================
-- COMPONENT 3 — DEVELOPMENT
-- ===========================================================================

-- Notion Migration Board + Sprint/Task Kanban share one table (board column = status).
create table if not exists public.dev_tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      text not null default 'backlog' check (status in ('backlog','todo','in_progress','review','done')),
  priority    text not null default 'P2' check (priority in ('P0','P1','P2')),
  assignee    text,
  due_date    date,
  sprint      text,
  origin      text not null default 'manual' check (origin in ('notion','manual')),
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists dev_tasks_status_idx on public.dev_tasks (status, order_index);

-- Feature Backlog
create table if not exists public.features (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  priority          text not null default 'P2' check (priority in ('P0','P1','P2')),
  effort            text check (effort in ('S','M','L','XL')),
  status            text not null default 'proposed' check (status in ('proposed','planned','in_progress','shipped','rejected')),
  linked_feedback_id uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Bug & Issue Log
create table if not exists public.bugs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  severity         text not null default 'medium' check (severity in ('low','medium','high','critical')),
  reported_by      text,
  status           text not null default 'open' check (status in ('open','in_progress','resolved','wont_fix')),
  resolution_notes text,
  reported_at      timestamptz not null default now(),
  resolved_at      timestamptz
);
create index if not exists bugs_status_idx on public.bugs (status, severity);

-- ===========================================================================
-- COMPONENT 4 — OPERATIONS
-- ===========================================================================

-- User Feedback Pipeline (can link to a feature or bug)
create table if not exists public.feedback (
  id               uuid primary key default gen_random_uuid(),
  app_user_id      uuid references public.app_users(id) on delete set null,
  user_label       text,
  text             text not null,
  category         text check (category in ('bug','feature_request','ux','pricing','praise','other')),
  sentiment        text check (sentiment in ('positive','neutral','negative')),
  priority         text not null default 'medium' check (priority in ('low','medium','high')),
  status           text not null default 'new' check (status in ('new','triaged','linked','closed')),
  linked_feature_id uuid references public.features(id) on delete set null,
  linked_bug_id    uuid references public.bugs(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists feedback_status_idx on public.feedback (status, created_at desc);

-- Customer Support Tickets — filed from the public website (/support) and
-- triaged by the team here. Website inserts use the service-role key server-side.
create table if not exists public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text not null,
  type        text not null default 'issue' check (type in ('complaint','bug','billing','account','question','other')),
  subject     text,
  message     text not null,
  priority    text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status      text not null default 'new' check (status in ('new','in_progress','waiting','resolved','closed')),
  source      text not null default 'website',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists support_tickets_status_idx on public.support_tickets (status, created_at desc);

-- KPI Dashboard — weekly operational KPIs (12-week trends)
create table if not exists public.kpi_weekly (
  week_start              date primary key,
  user_growth_rate        numeric(6,2) default 0,
  activation_rate         numeric(6,2) default 0,
  retention_d1            numeric(6,2) default 0,
  retention_d7            numeric(6,2) default 0,
  retention_d30           numeric(6,2) default 0,
  monthly_churn           numeric(6,2) default 0,
  nps                     integer default 0,
  support_resolution_rate numeric(6,2) default 0
);

-- Tool Stack Tracker
create table if not exists public.tools (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text check (category in ('design','dev','analytics','marketing','ops','ai','finance')),
  cost_month   numeric(10,2) not null default 0,
  billing_date date,
  owner        text,
  status       text not null default 'active' check (status in ('active','trial','canceled')),
  created_at   timestamptz not null default now()
);

-- Onboarding Flow Manager — funnel steps
create table if not exists public.onboarding_steps (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  step_order      integer not null,
  completion_rate numeric(5,2) not null default 0,
  dropoff_rate    numeric(5,2) generated always as (100 - completion_rate) stored
);
create index if not exists onboarding_steps_order_idx on public.onboarding_steps (step_order);

-- Onboarding A/B experiments
create table if not exists public.onboarding_experiments (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  variant_a text,
  variant_b text,
  metric    text,
  result_a  numeric(6,2) default 0,
  result_b  numeric(6,2) default 0,
  status    text not null default 'running' check (status in ('running','complete')),
  notes     text,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- INTEGRATIONS
-- ===========================================================================
create table if not exists public.integrations (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null unique check (provider in ('meta','stripe','notion','posthog','slack')),
  status       text not null default 'disconnected' check (status in ('connected','disconnected')),
  config       jsonb not null default '{}',
  connected_at timestamptz,
  updated_at   timestamptz not null default now()
);

-- ===========================================================================
-- updated_at triggers
-- ===========================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','avatars','posts','subscriptions','dev_tasks','features','support_tickets'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;

-- ===========================================================================
-- Convenience views
-- ===========================================================================

-- Current MRR from active monthly subscriptions (+ annual normalized to monthly).
create or replace view public.v_active_mrr as
select coalesce(sum(
  case when billing_cycle = 'annual' then price / 12 else price end
), 0)::numeric(12,2) as mrr
from public.subscriptions
where renewal_status in ('active','at_risk');

-- Monthly P&L: revenue minus expenses.
create or replace view public.v_pnl_monthly as
with rev as (
  select date_trunc('month', payment_date)::date as month, sum(amount) as revenue
  from public.revenue where status = 'paid' group by 1
),
cost as (
  select date_trunc('month', expense_date)::date as month, sum(amount) as costs
  from public.expenses group by 1
)
select
  coalesce(rev.month, cost.month) as month,
  coalesce(rev.revenue, 0)::numeric(12,2) as revenue,
  coalesce(cost.costs, 0)::numeric(12,2)  as costs,
  (coalesce(rev.revenue, 0) - coalesce(cost.costs, 0))::numeric(12,2) as net_profit
from rev full outer join cost on rev.month = cost.month
order by month;

-- ===========================================================================
-- Row Level Security — team members (authenticated) get full access.
-- Tighten per-role later; for an internal team OS this is the working baseline.
-- ===========================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','alerts','app_users','metrics_daily','retention_cohorts',
    'avatars','hooks','posts','post_metrics','hook_ab_tests','video_reviews',
    'scraped_accounts','weekly_reports','revenue','subscriptions','expenses',
    'financial_snapshots','dev_tasks','features','bugs','feedback','kpi_weekly',
    'tools','onboarding_steps','onboarding_experiments','integrations','support_tickets'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "team_all" on public.%I;', t);
    execute format(
      'create policy "team_all" on public.%I
         for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

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
