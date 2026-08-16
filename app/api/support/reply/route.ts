import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { supportReplyEmail, ticketReference } from "@/lib/support-reply-email";

export const runtime = "nodejs";

const MIN = 2;
const MAX = 10000;

/**
 * Sends a team member's reply to the customer who filed a ticket, then records
 * it. Any signed-in team member may reply; answering support is not an admin
 * job. The send happens before the write on purpose, so a row can never claim
 * an email went out that did not.
 */
export async function POST(req: Request) {
  // createServerClient throws on an empty URL, so check before building one.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Supabase isn't configured here, so there's no ticket to reply to." },
      { status: 400 },
    );
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let payload: { ticketId?: unknown; body?: unknown; signAs?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ticketId = typeof payload.ticketId === "string" ? payload.ticketId : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  // A profile id, or the literal "team". Never a free-text name: the client
  // must not be able to put arbitrary words in the sign-off of an email that
  // goes out under our domain.
  const signAs = typeof payload.signAs === "string" ? payload.signAs : "";

  if (!ticketId) {
    return NextResponse.json({ error: "Missing ticket." }, { status: 400 });
  }
  if (body.length < MIN) {
    return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  }
  if (body.length > MAX) {
    return NextResponse.json(
      { error: `That's longer than ${MAX.toLocaleString("en-US")} characters. Trim it down.` },
      { status: 400 },
    );
  }

  // Read through the caller's own session, so RLS still applies.
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("id, name, email, subject, message, status")
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "That ticket no longer exists." }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  // Falls back through profile name, profile email, then the auth email, so the
  // sign-off is never blank.
  const nameOf = (p: { full_name: string | null; email: string | null } | null, fallback: string) =>
    p?.full_name?.trim() || p?.email?.trim() || fallback;

  const ownName = nameOf(profile, user.email ?? "BudgetIQ Support");

  // Who the customer sees in the sign-off. Defaults to the sender, but a reply
  // can go out under a colleague's name or the generic team name. Resolved from
  // an id against the real team, so the name is always one that exists.
  let agentName = ownName;
  if (signAs === "team") {
    agentName = "BudgetIQ Support";
  } else if (signAs && signAs !== user.id) {
    const { data: other } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", signAs)
      .single();
    if (!other) {
      return NextResponse.json({ error: "That team member no longer exists." }, { status: 400 });
    }
    agentName = nameOf(other, "BudgetIQ Support");
  }

  const reference = ticketReference(ticket.id);

  const sent = await sendEmail(
    supportReplyEmail({
      reference,
      customerName: ticket.name,
      customerEmail: ticket.email,
      subject: ticket.subject,
      originalMessage: ticket.message,
      body,
      agentName,
    }),
  );

  if (!sent.ok) {
    // Nothing recorded, nothing claimed. The composer keeps the draft.
    return NextResponse.json({ error: sent.error }, { status: 502 });
  }

  const { data: reply, error: insertError } = await supabase
    .from("support_ticket_replies")
    .insert({
      ticket_id: ticket.id,
      body,
      // sent_by and sent_by_email are always the person who actually clicked
      // Send, whatever name went on the email. sent_by_name is what the
      // customer read. Keeping them separate is the point: signing as someone
      // else changes the sign-off, never the audit trail.
      sent_by: user.id,
      sent_by_email: profile?.email ?? user.email ?? null,
      sent_by_name: agentName,
      to_email: ticket.email,
    })
    .select("id, body, sent_by_name, sent_by_email, created_at")
    .single();

  if (insertError) {
    // The customer has the email. Losing the record is bad but it is not a
    // failed reply, so say so rather than inviting them to send it twice.
    console.error("[support/reply] insert failed after send:", insertError.message);
    return NextResponse.json({
      ok: true,
      recorded: false,
      warning: "The reply was sent, but it couldn't be saved to the ticket history.",
    });
  }

  // Replying hands the ball back to the customer. Resolved and closed tickets
  // are left alone: answering a follow-up shouldn't silently reopen them.
  if (ticket.status === "new" || ticket.status === "in_progress") {
    const { error: statusError } = await supabase
      .from("support_tickets")
      .update({ status: "waiting" })
      .eq("id", ticket.id);
    if (statusError) console.error("[support/reply] status bump failed:", statusError.message);
  }

  return NextResponse.json({ ok: true, recorded: true, reply });
}
