-- ============================================================================
-- BudgetIQ OS — Support ticket attachments (incremental migration)
-- ----------------------------------------------------------------------------
-- Screenshots uploaded by customers on budgetiq.org/support. The file itself
-- lives in Supabase Storage; this table records what it is and which ticket it
-- belongs to.
--
-- The bucket is PRIVATE. Nothing here is reachable by URL: the OS mints a
-- short-lived signed URL when a team member opens the ticket. These are other
-- people's bank screenshots, so they must never sit on a public path.
--
-- Run schema.sql and support_tickets.sql first. Everything is idempotent, so
-- it is safe against the live database.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
-- public=false is the whole security model here. The size and mime limits are
-- enforced by Storage itself, so they hold even if the app ever forgets to
-- check. Deliberately no image/svg+xml: an SVG is executable markup, and
-- rendering one back inside the dashboard would be a cross-site scripting hole.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments',
  'support-attachments',
  false,
  10485760,  -- 10 MB per file
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Team members can read the files. Uploads do NOT go through this policy: the
-- website server issues a signed upload URL with the service-role key, which
-- carries its own authorization.
drop policy if exists "team_read_support_attachments" on storage.objects;
create policy "team_read_support_attachments" on storage.objects
  for select to authenticated
  using (bucket_id = 'support-attachments');

-- ---------------------------------------------------------------------------
-- Attachment records
-- ---------------------------------------------------------------------------
create table if not exists public.support_ticket_attachments (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,

  -- Path inside the bucket. Server-generated and random, never the name the
  -- customer's file arrived with. Unique so the same object cannot be pinned
  -- onto two different tickets.
  path       text not null unique,

  -- What they called it, shown in the UI and used for the download name. Kept
  -- separate from `path` precisely so an attacker-chosen filename never
  -- becomes part of a storage key.
  filename   text not null,

  mime_type  text not null,
  size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

-- Read pattern is "the attachments for one ticket", and this doubles as the
-- required index on the foreign key so the cascade delete stays cheap.
create index if not exists support_ticket_attachments_ticket_idx
  on public.support_ticket_attachments (ticket_id, created_at);

-- RLS: same baseline as every other table.
alter table public.support_ticket_attachments enable row level security;
drop policy if exists "team_all" on public.support_ticket_attachments;
create policy "team_all" on public.support_ticket_attachments
  for all to authenticated using (true) with check (true);

-- NOTE: deleting a ticket removes these rows, but Postgres cannot reach into
-- Storage, so the objects themselves stay in the bucket. If that matters,
-- delete the folder named after the ticket in the Storage browser.
