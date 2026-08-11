"use client";

import { UserPlus, CalendarDays, CalendarRange, Radio } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { waitlistStats } from "@/lib/compute";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { CrudTable } from "@/components/data/crud-table";
import { waitlistEntity } from "@/lib/entities";

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  manual: "Manual",
  other: "Other",
};

export default function WaitlistPage() {
  const { data } = useLive();
  const stats = waitlistStats(data);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Section 01"
        title="Waitlist"
        description="Every email captured by the Join the Waitlist popup on budgetiq.org, newest first. Signups arrive here automatically; you can also add one by hand."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Total signups"
          value={String(stats.total)}
          icon={UserPlus}
          accent="growth"
          sub="all time"
        />
        <StatTile
          label="Last 7 days"
          value={String(stats.last7)}
          icon={CalendarDays}
          accent="growth"
          sub="new this week"
        />
        <StatTile
          label="Last 30 days"
          value={String(stats.last30)}
          icon={CalendarRange}
          accent="info"
          sub="new this month"
        />
        <StatTile
          label="Top source"
          value={SOURCE_LABEL[stats.topSource] ?? stats.topSource}
          icon={Radio}
          accent="muted"
          sub={stats.topSourceCount ? `${stats.topSourceCount} signups` : "no signups yet"}
        />
      </div>

      <CrudTable config={waitlistEntity} />
    </div>
  );
}
