"use client";

import { Handshake, CalendarClock, CalendarX2, FileSignature } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { partnershipStats } from "@/lib/compute";
import { formatDate } from "@/lib/format";
import { partnershipsEntity } from "@/lib/entities";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { CrudTable } from "@/components/data/crud-table";

export default function PartnershipsPage() {
  const { data } = useLive();
  const stats = partnershipStats(data);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Section 04"
        title="Partnerships"
        description="Every deal BudgetIQ has signed: who it's with, what it involves, when it was signed, and when it runs out. Leave the expiry blank for an open-ended deal."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Active"
          value={String(stats.active)}
          icon={Handshake}
          accent="growth"
          sub={`of ${stats.total} signed`}
        />
        <StatTile
          label="Expiring soon"
          value={String(stats.expiringSoon)}
          icon={CalendarClock}
          accent={stats.expiringSoon > 0 ? "info" : "muted"}
          sub={`within ${stats.windowDays} days`}
        />
        <StatTile
          label="Next expiry"
          value={stats.nextExpiry ? formatDate(stats.nextExpiry) : "—"}
          icon={FileSignature}
          accent="muted"
          sub={stats.nextExpiry ? "soonest active deal to end" : "no expiry dates set"}
        />
        <StatTile
          label="Expired"
          value={String(stats.expired)}
          icon={CalendarX2}
          accent="muted"
          sub="past their end date"
        />
      </div>

      <CrudTable config={partnershipsEntity} />
    </div>
  );
}
