"use client";

import { MessageSquare, Gauge, Wrench, Filter, LifeBuoy, UserPlus } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { opsStats, kpiWeeklySeries, onboardingFunnel } from "@/lib/compute";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudTable } from "@/components/data/crud-table";
import {
  feedbackEntity,
  supportTicketsEntity,
  waitlistEntity,
  toolsEntity,
  onboardingStepsEntity,
  kpiWeeklyEntity,
  metricsDailyEntity,
} from "@/lib/entities";
import { KpiPanel } from "@/components/operations/kpi-panel";
import { OnboardingPanel } from "@/components/operations/onboarding-panel";

export default function OperationsPage() {
  const { data } = useLive();
  const stats = opsStats(data);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Component 04"
        title="Operations"
        description="Triage support tickets from the website, log feedback and tools, and enter your weekly KPIs and daily metrics by hand — they flow into the KPI trends, the funnel, and the main dashboard."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Waitlist" value={String(stats.waitlist)} icon={UserPlus} accent="growth" sub="email signups" />
        <StatTile label="New feedback" value={String(stats.newFeedback)} icon={MessageSquare} accent="info" sub="awaiting triage" />
        <StatTile label="NPS" value={String(stats.nps)} icon={Gauge} accent="growth" sub="latest week" />
        <StatTile label="Tool spend" value={formatCurrency(stats.toolSpend)} icon={Wrench} accent="muted" sub="per month" />
        <StatTile label="Activation" value={`${stats.activation}%`} icon={Filter} accent="growth" sub="funnel end" />
      </div>

      <Tabs defaultValue="feedback">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="waitlist">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Waitlist
          </TabsTrigger>
          <TabsTrigger value="support">
            <LifeBuoy className="mr-1.5 h-3.5 w-3.5" /> Support
          </TabsTrigger>
          <TabsTrigger value="tools">Tool Stack</TabsTrigger>
          <TabsTrigger value="steps">Onboarding Steps</TabsTrigger>
          <TabsTrigger value="weekly">Weekly KPIs</TabsTrigger>
          <TabsTrigger value="daily">Daily Metrics</TabsTrigger>
          <TabsTrigger value="kpis">KPI Trends</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback"><CrudTable config={feedbackEntity} /></TabsContent>
        <TabsContent value="waitlist"><CrudTable config={waitlistEntity} /></TabsContent>
        <TabsContent value="support"><CrudTable config={supportTicketsEntity} /></TabsContent>
        <TabsContent value="tools"><CrudTable config={toolsEntity} /></TabsContent>
        <TabsContent value="steps"><CrudTable config={onboardingStepsEntity} /></TabsContent>
        <TabsContent value="weekly"><CrudTable config={kpiWeeklyEntity} /></TabsContent>
        <TabsContent value="daily"><CrudTable config={metricsDailyEntity} /></TabsContent>
        <TabsContent value="kpis"><KpiPanel series={kpiWeeklySeries(data)} /></TabsContent>
        <TabsContent value="funnel"><OnboardingPanel funnel={onboardingFunnel(data)} /></TabsContent>
      </Tabs>
    </div>
  );
}
