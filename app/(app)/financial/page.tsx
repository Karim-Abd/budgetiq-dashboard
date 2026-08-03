"use client";

import { useLive } from "@/lib/use-live";
import { financeMetrics } from "@/lib/compute";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudTable } from "@/components/data/crud-table";
import {
  revenueEntity,
  expensesEntity,
  subscriptionsEntity,
  financialSnapshotsEntity,
} from "@/lib/entities";
import { PnlPanel } from "@/components/financial/pnl-panel";
import { SaasMetricsPanel } from "@/components/financial/saas-metrics-panel";

export default function FinancialPage() {
  const { data } = useLive();
  const fin = financeMetrics(data);
  const headline = fin.kpis.filter((k) => ["mrr", "arr", "ltv_cac", "nrr"].includes(k.id));

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Component 02"
        title="Financial"
        description="Log revenue, costs and subscriptions by hand; the monthly snapshot drives MRR, P&L, runway and the SaaS metrics."
      >
        <Badge variant={fin.saas.ltvCac >= 3 ? "growth" : "muted"}>
          LTV:CAC {fin.saas.ltvCac.toFixed(1)}:1
        </Badge>
        <Badge variant="info">{fin.saas.runwayMonths > 0 ? fin.saas.runwayMonths.toFixed(1) : "—"} mo runway</Badge>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {headline.map((kpi, i) => (
          <MetricCard key={kpi.id} kpi={kpi} delay={i * 0.06} />
        ))}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="costs">Expenses</TabsTrigger>
          <TabsTrigger value="billing">Subscriptions</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="pnl">P&amp;L</TabsTrigger>
          <TabsTrigger value="saas">SaaS Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue"><CrudTable config={revenueEntity} /></TabsContent>
        <TabsContent value="costs"><CrudTable config={expensesEntity} /></TabsContent>
        <TabsContent value="billing"><CrudTable config={subscriptionsEntity} /></TabsContent>
        <TabsContent value="snapshots"><CrudTable config={financialSnapshotsEntity} /></TabsContent>
        <TabsContent value="pnl">
          <PnlPanel pnl={fin.pnl} cashOnHand={fin.saas.cashOnHand} burn={fin.saas.burn} />
        </TabsContent>
        <TabsContent value="saas"><SaasMetricsPanel saas={fin.saas} /></TabsContent>
      </Tabs>
    </div>
  );
}
