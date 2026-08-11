"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Eye,
  ExternalLink,
  Flame,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Users2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useCrud, type CrudRow } from "@/lib/use-crud";
import { formatNumber, relativeTime } from "@/lib/format";
import { VISION_QUESTION_LABELS, applicantMock } from "@/lib/applicants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Applicant extends CrudRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age: string | null;
  location: string | null;
  occupation: string | null;
  platforms: string[] | null;
  handles: Record<string, string> | null;
  total_followers: number | null;
  avg_views: number | null;
  best_post_url: string | null;
  best_post_why: string | null;
  tools: string[] | null;
  portfolio_url: string | null;
  vision_answers: Record<string, string> | null;
  commitment: string | null;
  hunger: number | null;
  agreement_signature: string | null;
  agreement_accepted_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUSES = ["new", "reviewing", "shortlisted", "onboarded", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  onboarded: "Onboarded",
  rejected: "Rejected",
};

const STATUS_TONE: Record<Status, "info" | "secondary" | "growth" | "muted" | "critical"> = {
  new: "info",
  reviewing: "secondary",
  shortlisted: "growth",
  onboarded: "growth",
  rejected: "critical",
};

const STATUS_BAR: Record<Status, string> = {
  new: "border-l-info",
  reviewing: "border-l-foreground/25",
  shortlisted: "border-l-growth",
  onboarded: "border-l-growth",
  rejected: "border-l-critical",
};

const HANDLE_URL: Record<string, (h: string) => string> = {
  tiktok: (h) => `https://tiktok.com/@${h}`,
  instagram: (h) => `https://instagram.com/${h}`,
  youtube: (h) => `https://youtube.com/${h.startsWith("@") ? h : `@${h}`}`,
  twitter: (h) => `https://x.com/${h}`,
};

const HANDLE_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "X",
};

/**
 * Review queue for the hidden /onboarding form on the website. Read-heavy by
 * design: the long-form vision answers are the whole point, so a row expands
 * into the full application rather than an edit dialog.
 */
export function ApplicantsPanel() {
  const { rows, loading, configured, update, remove } = useCrud<Applicant>(
    "content_onboarding",
    { mock: applicantMock, orderBy: "created_at" },
  );
  const [filter, setFilter] = useState<Status | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of STATUSES) c[s] = rows.filter((r) => r.status === s).length;
    return c;
  }, [rows]);

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Content team applicants</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {rows.length} submitted · {counts.new ?? 0} awaiting review · from the
              hidden /onboarding page
              {!configured && " · local mock data"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition-colors",
                filter === s
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
              <span className="ml-1.5 font-num opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading applicants…
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Users2 className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {rows.length === 0
                ? "No applications yet. They'll land here the moment someone completes /onboarding."
                : `No applicants with status "${filter}".`}
            </p>
          </div>
        )}

        {visible.map((a) => {
          const status = (STATUSES.includes(a.status as Status) ? a.status : "new") as Status;
          const open = openId === a.id;
          return (
            <div
              key={a.id}
              className={cn(
                "rounded-lg border border-l-2 border-border bg-background/40",
                STATUS_BAR[status],
              )}
            >
              {/* Summary row */}
              <button
                onClick={() => setOpenId(open ? null : a.id)}
                className="flex w-full items-start justify-between gap-3 p-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{a.full_name}</span>
                    <Badge variant={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                    {a.hunger != null && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                        <Flame className="h-3 w-3 text-primary" />
                        {a.hunger}/10
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground">
                    <span className="text-info">{a.email}</span>
                    {a.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {a.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users2 className="h-3 w-3" />
                      {a.total_followers != null ? formatNumber(a.total_followers, true) : "—"} followers
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {a.avg_views != null ? formatNumber(a.avg_views, true) : "—"} avg views
                    </span>
                    {a.created_at && <span>{relativeTime(a.created_at)}</span>}
                  </div>
                  {a.platforms && a.platforms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.platforms.map((p) => (
                        <Badge key={p} variant="muted">{p}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>

              {open && (
                <div className="space-y-5 border-t border-border px-3 pb-4 pt-4">
                  {/* Contact + links */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Detail icon={Mail} label="Email" value={a.email} />
                    <Detail icon={Phone} label="Phone" value={a.phone} />
                    <Detail label="Age" value={a.age} />
                    <Detail label="Studies / work" value={a.occupation} />
                    <Detail label="Time commitment" value={a.commitment} />
                    <Detail
                      label="Signed"
                      value={
                        a.agreement_signature
                          ? `${a.agreement_signature}${
                              a.agreement_accepted_at
                                ? ` · ${relativeTime(a.agreement_accepted_at)}`
                                : ""
                            }`
                          : null
                      }
                    />
                  </div>

                  {/* Handles */}
                  {a.handles && Object.keys(a.handles).length > 0 && (
                    <Section title="Handles">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(a.handles).map(([k, h]) => (
                          <a
                            key={k}
                            href={HANDLE_URL[k]?.(h) ?? h}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-info transition-colors hover:border-info/40"
                          >
                            {HANDLE_LABEL[k] ?? k} @{h}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Links */}
                  {(a.portfolio_url || a.best_post_url) && (
                    <Section title="Links">
                      <div className="flex flex-wrap gap-2">
                        {a.portfolio_url && <LinkChip href={a.portfolio_url} label="Portfolio" />}
                        {a.best_post_url && <LinkChip href={a.best_post_url} label="Best post" />}
                      </div>
                    </Section>
                  )}

                  {a.best_post_why && (
                    <Section title="Why that post worked">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {a.best_post_why}
                      </p>
                    </Section>
                  )}

                  {a.tools && a.tools.length > 0 && (
                    <Section title="Tools">
                      <div className="flex flex-wrap gap-1">
                        {a.tools.map((t) => (
                          <Badge key={t} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* The answers that actually decide it */}
                  <Section title="Vision answers">
                    <div className="space-y-4">
                      {Object.entries(a.vision_answers ?? {}).map(([qid, answer]) => (
                        <div key={qid} className="rounded-md border border-border bg-card/50 p-3">
                          <p className="mb-1.5 text-xs font-medium text-foreground">
                            {VISION_QUESTION_LABELS[qid] ?? qid}
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {answer}
                          </p>
                        </div>
                      ))}
                      {Object.keys(a.vision_answers ?? {}).length === 0 && (
                        <p className="text-sm text-muted-foreground">No answers recorded.</p>
                      )}
                    </div>
                  </Section>

                  {/* Review actions */}
                  <Section title="Review">
                    <div className="grid gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Select
                          value={status}
                          onValueChange={(v) => update(a.id, { status: v } as Partial<Applicant>)}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => remove(a.id)}
                          className="text-critical hover:text-critical"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                      <NotesBox
                        initial={a.notes ?? ""}
                        onSave={(notes) => update(a.id, { notes } as Partial<Applicant>)}
                      />
                    </div>
                  </Section>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{title}</p>
      {children}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail;
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {value || <span className="text-muted-foreground">Not given</span>}
      </p>
    </div>
  );
}

function LinkChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-info transition-colors hover:border-info/40"
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

/** Local draft so typing doesn't fire a write per keystroke. */
function NotesBox({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (v: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const dirty = value !== initial;

  return (
    <div className="grid gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Internal notes on this applicant…"
      />
      {dirty && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(value)}>
            Save notes
          </Button>
          <Button size="sm" variant="outline" onClick={() => setValue(initial)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
