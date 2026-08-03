"use client";

import { FileStack, Activity, CalendarClock, Clapperboard, UserPlus } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { contentStats } from "@/lib/compute";
import { formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudTable } from "@/components/data/crud-table";
import {
  postsEntity,
  avatarsEntity,
  hooksEntity,
  videoReviewsEntity,
  scrapedAccountsEntity,
} from "@/lib/entities";
import { WeeklyReportPanel } from "@/components/content/weekly-report-panel";
import { ApplicantsPanel } from "@/components/content/applicants-panel";

export default function ContentPage() {
  const { data } = useLive();
  const stats = contentStats(data);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Component 01"
        title="Content & Marketing"
        description="Fill in posts, avatars, hooks, video reviews and competitor research by hand — it all feeds the weekly optimization report."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Posts" value={String(stats.posts)} icon={FileStack} accent="info" sub="all statuses" />
        <StatTile label="Avg engagement" value={formatPercent(stats.avgEngagement)} icon={Activity} accent="growth" sub="published posts" />
        <StatTile label="Scheduled" value={String(stats.scheduled)} icon={CalendarClock} accent="muted" sub="upcoming" />
        <StatTile label="Reels share" value={formatPercent(stats.reelsShare)} icon={Clapperboard} accent="info" sub="of all posts" />
        <StatTile label="Applicants" value={String(stats.applicants)} icon={UserPlus} accent="growth" sub={`${stats.newApplicants} awaiting review`} />
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="posts">CMS</TabsTrigger>
          <TabsTrigger value="avatars">Avatars</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
          <TabsTrigger value="review">Video Reviews</TabsTrigger>
          <TabsTrigger value="scraper">Scraper</TabsTrigger>
          <TabsTrigger value="report">Weekly Report</TabsTrigger>
          <TabsTrigger value="applicants">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Applicants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts"><CrudTable config={postsEntity} /></TabsContent>
        <TabsContent value="avatars"><CrudTable config={avatarsEntity} /></TabsContent>
        <TabsContent value="hooks"><CrudTable config={hooksEntity} /></TabsContent>
        <TabsContent value="review"><CrudTable config={videoReviewsEntity} /></TabsContent>
        <TabsContent value="scraper"><CrudTable config={scrapedAccountsEntity} /></TabsContent>
        <TabsContent value="report"><WeeklyReportPanel posts={data.posts} hooks={data.hooks} /></TabsContent>
        <TabsContent value="applicants"><ApplicantsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
