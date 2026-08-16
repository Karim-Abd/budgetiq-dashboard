import "server-only";

// Transactional email through Resend's HTTP API. A deliberate copy of the same
// file in the budgetiq website repo rather than a shared package: the two apps
// deploy separately and neither should be able to break the other's mail.
//
// One difference that matters. On the website, a failed send must never cost a
// submission that is already saved, so sendEmail swallows everything. Here the
// email IS the action: if it does not go, the person clicking Send has to know,
// and nothing may be recorded as sent. So this version reports the failure and
// the caller is expected to surface it.

const apiKey = process.env.RESEND_API_KEY ?? "";

export const isEmailConfigured = !!apiKey;

/** Must be on a domain verified in Resend, or every send is rejected. */
const FROM = process.env.EMAIL_FROM ?? "BudgetIQ <info@budgetiq.org>";

/** Where customer replies come back to. */
export const TEAM_INBOX = process.env.TEAM_INBOX ?? "info@budgetiq.org";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export type SendResult = { ok: true; id: string | null } | { ok: false; error: string };

/** Never throws. Returns why it failed so the UI can say something true. */
export async function sendEmail(mail: Mail): Promise<SendResult> {
  if (!isEmailConfigured) {
    return { ok: false, error: "Email isn't configured on this deployment (RESEND_API_KEY is missing)." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] send failed (${res.status}):`, detail);
      return {
        ok: false,
        error:
          res.status === 403 || res.status === 401
            ? "Resend rejected the request. Check the API key and that the sending domain is verified."
            : `Resend returned ${res.status}.`,
      };
    }

    const body = (await res.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, id: body?.id ?? null };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { ok: false, error: "Couldn't reach Resend. Check the network and try again." };
  }
}

/** Escape untrusted values before they go anywhere near an HTML body. */
export function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
