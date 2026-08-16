-- ============================================================================
-- BudgetIQ OS — Support ticket replies (incremental migration)
-- ----------------------------------------------------------------------------
-- Every reply sent to a customer from the Customer Support section lands here,
-- one row per email that actually went out. The row is written only after
-- Resend accepts the send, so the thread is a record of what the customer
-- received, not of what someone typed.
--
-- Outbound only. Customer replies arrive as ordinary mail in info@budgetiq.org
-- and are not captured here; that would need an inbound mail webhook.
--
-- Run schema.sql and support_tickets.sql first. Everything here is idempotent,
-- so it is safe against the live database. Paste into the Supabase SQL editor,
-- or `supabase db push` if you use the CLI.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.support_ticket_replies (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references public.support_tickets(id) on delete cascade,
  body          text not null,

  -- Who actually clicked Send. The id goes null if the team member is later
  -- removed, so their email is copied in too and the audit trail survives.
  sent_by       uuid references public.profiles(id) on delete set null,
  sent_by_email text,

  -- The name the CUSTOMER saw in the sign-off, which is not always the sender:
  -- a reply can go out under a colleague's name or the generic team name.
  -- Deliberately separate from sent_by, so changing the signature can never
  -- change the record of who sent it.
  sent_by_name  text,

  -- Where it was actually delivered, frozen at send time. The ticket's own
  -- email column can be corrected later; this must not move with it.
  to_email      text not null,

  created_at    timestamptz not null default now()
);

-- Replies are always read as "the thread for one ticket, oldest first", and
-- this also serves as the required index on the foreign key, which keeps the
-- ON DELETE CASCADE from scanning the whole table.
create index if not exists support_ticket_replies_ticket_idx
  on public.support_ticket_replies (ticket_id, created_at);

-- No updated_at and no trigger: a sent email cannot be unsent, so these rows
-- are append-only by intent.

-- RLS: same baseline as every other table. Team members (authenticated) get
-- full access; nothing here is reachable with the anon key.
alter table public.support_ticket_replies enable row level security;
drop policy if exists "team_all" on public.support_ticket_replies;
create policy "team_all" on public.support_ticket_replies
  for all to authenticated using (true) with check (true);
