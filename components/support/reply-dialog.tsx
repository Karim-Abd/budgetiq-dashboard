"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Paperclip, Reply, Send } from "lucide-react";

import { apiPath } from "@/lib/base-path";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface ReplyTicket {
  id: string;
  name?: string | null;
  email: string;
  subject?: string | null;
  message: string;
}

interface ReplyRow {
  id: string;
  body: string;
  /** The name the customer saw in the sign-off. */
  sent_by_name: string | null;
  created_at: string;
}

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string | null;
}

/** Sign-off options that aren't a person. */
const TEAM_SIGNATURE = "team";

const ATTACHMENT_BUCKET = "support-attachments";

interface Attachment {
  id: string;
  path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  /** Signed at view time; the bucket is private so there is no permanent URL. */
  url?: string;
}

const prettySize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Same derivation as the server, so the UI shows the code the customer holds. */
function reference(id: string): string | null {
  if (!id) return null;
  return `BIQ-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function ReplyDialog({ ticket }: { ticket: ReplyTicket }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [thread, setThread] = useState<ReplyRow[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [signAs, setSignAs] = useState<string>("");

  // The team list, plus who you are, so the sign-off defaults to you.
  const loadTeam = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSignAs((cur) => cur || TEAM_SIGNATURE);
      return;
    }
    const supabase = createClient();
    const [{ data: members }, { data: auth }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").order("full_name"),
      supabase.auth.getUser(),
    ]);
    setTeam((members as TeamMember[]) ?? []);
    // Only default to yourself once, so reopening doesn't undo a deliberate choice.
    setSignAs((cur) => cur || auth?.user?.id || TEAM_SIGNATURE);
  }, []);

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Screenshots the customer uploaded. The bucket is private, so each file gets
  // a URL signed for an hour rather than a permanent link.
  const loadAttachments = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("support_ticket_attachments")
      .select("id, path, filename, mime_type, size_bytes")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });

    if (error || !data?.length) {
      setAttachments([]);
      return;
    }

    const rows = data as Attachment[];
    const { data: signed } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrls(rows.map((r) => r.path), 3600);

    const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    setAttachments(rows.map((r) => ({ ...r, url: urlByPath.get(r.path) ?? undefined })));
  }, [ticket.id]);

  const loadThread = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoadingThread(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("support_ticket_replies")
      .select("id, body, sent_by_name, created_at")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    if (error) toast.error("Couldn't load the reply history", error.message);
    else setThread((data as ReplyRow[]) ?? []);
    setLoadingThread(false);
  }, [ticket.id]);

  useEffect(() => {
    if (!open) return;
    loadThread();
    loadTeam();
    loadAttachments();
  }, [open, loadThread, loadTeam, loadAttachments]);

  async function send() {
    const text = body.trim();
    if (text.length < 2) {
      toast.error("Write a reply first");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(apiPath("/api/support/reply"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, body: text, signAs }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // The draft is deliberately left in the box so nothing is retyped.
        toast.error("Reply not sent", data.error ?? "Something went wrong.");
        return;
      }
      if (data.warning) toast.info("Sent", data.warning);
      else toast.success("Reply sent", `Delivered to ${ticket.email}`);

      setBody("");
      await loadThread();
      setOpen(false);
    } catch {
      toast.error("Reply not sent", "Couldn't reach the server. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  const ref = reference(ticket.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Reply">
          <Reply className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to {ticket.name?.trim() || ticket.email}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              To <span className="font-mono text-foreground">{ticket.email}</span>
            </span>
            {ref && (
              <span className="text-muted-foreground">
                Ref <span className="font-mono text-foreground">{ref}</span>
              </span>
            )}
          </div>

          <div className="max-h-[42vh] space-y-3 overflow-y-auto pr-1">
            {/* What they originally wrote, so you can answer without leaving. */}
            <div className="rounded-lg border border-input bg-background/40 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {ticket.subject?.trim() || "Their message"}
              </p>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{ticket.message}</p>

              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((a) =>
                    a.mime_type.startsWith("image/") && a.url ? (
                      // Opens the full size in a new tab. Signed links expire,
                      // so reopening the ticket mints fresh ones.
                      <a
                        key={a.id}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${a.filename} · ${prettySize(a.size_bytes)}`}
                        className="block overflow-hidden rounded-lg border border-input transition-colors hover:border-info"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.url}
                          alt={a.filename}
                          className="h-28 w-auto max-w-[220px] object-cover"
                        />
                      </a>
                    ) : (
                      <a
                        key={a.id}
                        href={a.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        {a.filename}
                        <span className="text-muted-foreground/70">{prettySize(a.size_bytes)}</span>
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>

            {loadingThread && (
              <p className="text-xs text-muted-foreground">Loading earlier replies…</p>
            )}

            {thread.map((r) => (
              <div key={r.id} className="rounded-lg border border-info/25 bg-info/[0.06] p-3">
                <p className="mb-1 text-xs text-muted-foreground">
                  {r.sent_by_name ?? "BudgetIQ"} · {formatDateTime(r.created_at)}
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground/90">{r.body}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-1.5">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Write your reply. It goes straight to their inbox from info@budgetiq.org."
              disabled={sending}
            />
            <p className="text-xs text-muted-foreground">
              Sends immediately, and the ticket moves to Waiting. Their original message is
              quoted underneath your reply.
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sign-as">Sign the reply as</Label>
            <Select value={signAs} onValueChange={setSignAs} disabled={sending}>
              <SelectTrigger id="sign-as" className="sm:max-w-xs">
                <SelectValue placeholder="Choose a name…" />
              </SelectTrigger>
              <SelectContent>
                {team.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name?.trim() || m.email || "Unnamed team member"}
                  </SelectItem>
                ))}
                <SelectItem value={TEAM_SIGNATURE}>BudgetIQ Support (no name)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This is the name at the bottom of the email. The ticket history still records
              that you sent it.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={send} disabled={sending || body.trim().length < 2}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send reply
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
