"use client";

import { Inbox, Flame, MailQuestion, CheckCircle2 } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { supportStats } from "@/lib/compute";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { CrudTable } from "@/components/data/crud-table";
import { ReplyDialog } from "@/components/support/reply-dialog";
import { supportTicketsEntity } from "@/lib/entities";

export default function SupportPage() {
  const { data } = useLive();
  const stats = supportStats(data);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Section 01"
        title="Customer Support"
        description="Tickets filed from the support form on budgetiq.org. Reply straight from here and it emails the customer, or work a ticket by editing its status and priority — new, in progress, waiting, resolved, then closed."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Open"
          value={String(stats.open)}
          icon={Inbox}
          accent="info"
          sub="not yet resolved"
        />
        <StatTile
          label="Unanswered"
          value={String(stats.unanswered)}
          icon={MailQuestion}
          accent={stats.unanswered > 0 ? "info" : "muted"}
          sub="nobody has touched"
        />
        <StatTile
          label="Urgent"
          value={String(stats.urgent)}
          icon={Flame}
          accent={stats.urgent > 0 ? "info" : "muted"}
          sub="high or urgent, still open"
        />
        <StatTile
          label="Resolved"
          value={String(stats.resolved)}
          icon={CheckCircle2}
          accent="growth"
          sub={`of ${stats.total} all time`}
        />
      </div>

      <CrudTable
        config={supportTicketsEntity}
        rowActions={(row) => (
          <ReplyDialog
            ticket={{
              id: String(row.id),
              name: (row.name as string) ?? null,
              email: String(row.email),
              subject: (row.subject as string) ?? null,
              message: String(row.message ?? ""),
            }}
          />
        )}
      />
    </div>
  );
}
