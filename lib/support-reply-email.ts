import "server-only";

import { esc, TEAM_INBOX, type Mail } from "@/lib/email";

// The email a customer gets when someone answers their ticket from the OS.
// Built to read like a person replying, not like a system notification: the
// answer comes first, the original message is quoted underneath the way any
// mail client would quote it, and the reference is carried so a later reply
// can still be matched to the ticket by hand.

const GREEN = "#5fa938";
const INK = "#16171a";
const MUTED = "#62646c";
const LINE = "#e6e7ea";
const BODY = "#3d3f45";

export type ReplyContext = {
  reference: string | null;
  customerName: string | null;
  customerEmail: string;
  subject: string | null;
  originalMessage: string;
  /** What the team member typed. */
  body: string;
  /** Who is answering, for the sign-off. */
  agentName: string;
};

/** Same derivation the website uses, so both sides quote the same code. */
export function ticketReference(id: string | null | undefined): string | null {
  if (!id) return null;
  return `BIQ-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

const para = (v: string) =>
  `<p style="margin:0;color:${BODY};font-size:14px;line-height:1.65;white-space:pre-wrap;">${esc(v)}</p>`;

export function supportReplyEmail(c: ReplyContext): Mail {
  const first = c.customerName?.trim().split(" ")[0] || "there";

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body style="margin:0;padding:24px 12px;background:#f5f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:14px;">
      <tr><td style="padding:32px;">
        <p style="margin:0 0 20px;color:${BODY};font-size:14px;line-height:1.65;">Hi ${esc(first)},</p>

        ${para(c.body)}

        <p style="margin:22px 0 4px;color:${INK};font-size:14px;font-weight:600;">${esc(c.agentName)}</p>
        <p style="margin:0 0 26px;color:${MUTED};font-size:12px;">BudgetIQ Support</p>

        <div style="padding-top:22px;border-top:1px solid ${LINE};">
          <p style="margin:0 0 10px;color:${MUTED};font-size:12px;">
            On ${esc(c.subject?.trim() || "your support request")}, you wrote:
          </p>
          <div style="padding-left:14px;border-left:3px solid ${LINE};">
            <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;white-space:pre-wrap;">${esc(c.originalMessage)}</p>
          </div>
        </div>

        <p style="margin:26px 0 0;color:${MUTED};font-size:12px;line-height:1.6;">
          Reply to this email to continue the conversation.${
            c.reference ? ` Your reference is <strong style="color:${INK};">${esc(c.reference)}</strong>.` : ""
          }
        </p>
      </td></tr>
    </table>
    <p style="max-width:620px;margin:16px auto 0;color:${MUTED};font-size:11px;text-align:center;">
      BudgetIQ, <a href="https://budgetiq.org" style="color:${GREEN};">budgetiq.org</a>
    </p>
  </body>
</html>`;

  // "Re:" plus the original subject, so it threads in their client next to the
  // confirmation they already have.
  const base = c.subject?.trim() || "your support request";
  const subject = c.reference ? `Re: ${base} (${c.reference})` : `Re: ${base}`;

  return {
    to: c.customerEmail,
    subject,
    html,
    replyTo: TEAM_INBOX,
  };
}
