# BudgetIQ OS

The internal review desk for BudgetIQ. It shows the three things the public
website collects: **Waitlist** signups, **Customer Support** tickets, and
**Onboarding Answers** from content-team applicants.

Built as a dark-only, green/blue command center. The signature treatment is an
**instrument-cluster** readout — every metric, label and eyebrow is set in
Geist Mono.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (new-york)
- **Supabase** (PostgreSQL + Auth)

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
3. **Run the SQL** in the Supabase SQL editor (or `supabase db push`), in this order:
   - [`supabase/schema.sql`](supabase/schema.sql) — the `set_updated_at` helper, `profiles`, RLS, and the new-user trigger. Must run first.
   - [`supabase/waitlist.sql`](supabase/waitlist.sql)
   - [`supabase/support_tickets.sql`](supabase/support_tickets.sql)
   - [`supabase/content_onboarding.sql`](supabase/content_onboarding.sql)

   All four are idempotent, so re-running them is safe.

Restart `npm run dev`. Now the app is gated by login.

### First admin + team accounts

- The **first** account is created at **`/setup`** and automatically becomes the
  **owner**. (Once one account exists, `/setup` locks.)
- After that, sign in and go to **Settings → Team** (`/settings/team`) to create
  the rest of the team. Owners/admins can add **admin** or **member** accounts,
  set a temporary password, and remove accounts. Account creation runs through a
  server route using the service-role key (`/api/admin/users`).

## Where the data comes from

All three tables are written by the public marketing site, which inserts with
the service-role key (bypassing RLS). The OS reads and edits them with your
authenticated session:

| Section | Table | Written by |
| --- | --- | --- |
| Waitlist | `waitlist` | the Join the Waitlist popup |
| Customer Support | `support_tickets` | the `/support` form |
| Onboarding Answers | `content_onboarding` | the hidden `/onboarding` page |

You can also add or edit rows by hand in any section. With Supabase connected
every change persists; without it, changes are local to your session and flagged
with a toast.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Waitlist — signups, with totals for the last 7 and 30 days |
| `/support` | Customer Support — ticket queue with status and priority |
| `/applicants` | Onboarding Answers — expandable applications with the long-form answers |
| `/settings/team` | Team accounts (owner/admin only) |
| `/login`, `/setup` | Sign in, and first-owner creation |

## Structure

```
app/(app)/                route group with the sidebar + topbar shell
components/ui/            shadcn primitives
components/data/          CrudTable — the config-driven editable table
components/applicants/    the onboarding review queue
components/shared/        page header, stat tile, delta chip
lib/entities.ts           field schemas for the editable tables
lib/use-live.ts           reads the three tables
lib/compute.ts            zero-safe stats for the tiles
supabase/                 schema + one migration per table
```

## Deployment

The OS deploys as its own Vercel project with `basePath: "/dashboard"`, and the
marketing site proxies `/dashboard/*` to it — so it is served at
**budgetiq.org/dashboard**. Because of the basePath, any raw `fetch` or
`window.location` must go through `apiPath()` from `lib/base-path.ts`.
