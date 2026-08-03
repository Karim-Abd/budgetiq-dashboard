# BudgetIQ OS

The internal operating system for running BudgetIQ — a command center that sits
above four operational components: **Content & Marketing**, **Financial**,
**Development**, and **Operations**.

Built as a dark-only, green/blue command center. The signature treatment is an
**instrument-cluster** readout — every metric, label and eyebrow is set in
Geist Mono, with count-up numerals, micro-sparklines and week-over-week delta
chips.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (new-york) + **Magic UI** (animated components)
- **Recharts** for charts (green/blue duotone)
- **Supabase** (PostgreSQL + Auth)
- **Zustand** for the global date-range filter, **dnd-kit** for the sprint board

## Getting started

```bash
npm install
npm run dev          # http://localhost:3002
```

With no `.env.local`, the app opens immediately on mock data and every section
is interactive (edits are local-only). To turn on real accounts + persistence,
do the 3-step Supabase setup below.

## Supabase setup (accounts + saving data)

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Add keys** — copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page — **server-only**, never exposed to the browser; required for the admin team portal)
3. **Run the schema** — paste [`supabase/schema.sql`](supabase/schema.sql) into the
   Supabase SQL editor and run it (or `supabase db push`). It creates every table,
   RLS policies, triggers, and the `v_active_mrr` / `v_pnl_monthly` views.

Restart `npm run dev`. Now the app is gated by login.

### First admin + team accounts

- The **first** account is created at **`/setup`** and automatically becomes the
  **owner**. (Once one account exists, `/setup` locks.)
- After that, sign in and go to **Settings → Team** (`/settings/team`) to create
  the rest of the team. Owners/admins can add **admin** or **member** accounts,
  set a temporary password, and remove accounts. Account creation runs through a
  server route using the service-role key (`/api/admin/users`).

## Filling in data

Every section's data is entered by hand. Each component page has editable tables
(`CrudTable`) with add / edit / delete — posts, hooks, avatars, video reviews,
competitors, revenue, expenses, subscriptions, monthly snapshots, tasks,
features, bugs, feedback, tools, onboarding steps, and alerts. With Supabase
connected, every change persists (and respects RLS); without it, changes are
local to your session and flagged with a toast.

## Routes

| Route | What it is |
| --- | --- |
| `/dashboard` | Command center — user + financial KPIs, alerts feed, hero |
| `/content` | CMS, avatars, hook library, AI video review, ConnectScraper, weekly report |
| `/financial` | Revenue, costs, P&L + runway, SaaS metrics, billing |
| `/development` | Sprint kanban (drag & drop), Notion migration, backlog, bugs |
| `/operations` | Feedback pipeline, operational KPIs, tool stack, onboarding funnel |
| `/settings/integrations` | Connector shells (Meta, Stripe, Notion, PostHog, Slack) |

## Structure

```
app/(app)/            route group with the sidebar + topbar shell
components/ui/         shadcn primitives + adapted Magic UI components
components/{area}/     per-component panels (content, financial, development, …)
components/charts/     recharts wrappers (trend, donut, sparkline, tooltip)
lib/                   mock data, formatters, supabase clients, nav, store
supabase/schema.sql    full PostgreSQL schema
```
