"use client";

import { ClipboardList, Inbox, Star, UserCheck } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { applicantStats } from "@/lib/compute";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { ApplicantsPanel } from "@/components/applicants/applicants-panel";

export default function ApplicantsPage() {
  const { data } = useLive();
  const stats = applicantStats(data);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Section 03"
        title="Onboarding Answers"
        description="Content team applications submitted through the hidden /onboarding page. Expand a row to read the full long-form answers, then set a status and leave notes."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Applications"
          value={String(stats.total)}
          icon={ClipboardList}
          accent="info"
          sub={stats.last7 ? `${stats.last7} this week` : "all time"}
        />
        <StatTile
          label="Awaiting review"
          value={String(stats.awaiting)}
          icon={Inbox}
          accent={stats.awaiting > 0 ? "info" : "muted"}
          sub="still marked new"
        />
        <StatTile
          label="Shortlisted"
          value={String(stats.shortlisted)}
          icon={Star}
          accent="growth"
          sub="worth a call"
        />
        <StatTile
          label="Onboarded"
          value={String(stats.onboarded)}
          icon={UserCheck}
          accent="growth"
          sub="joined the team"
        />
      </div>

      <ApplicantsPanel />
    </div>
  );
}
