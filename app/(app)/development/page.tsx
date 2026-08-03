"use client";

import { GitBranch, Bug, Layers, Activity } from "lucide-react";

import { useLive } from "@/lib/use-live";
import { devStats } from "@/lib/compute";
import { PageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudTable } from "@/components/data/crud-table";
import { devTasksEntity, featuresEntity, bugsEntity } from "@/lib/entities";
import { KanbanBoard, type KanbanTask } from "@/components/development/kanban-board";

export default function DevelopmentPage() {
  const { data } = useLive();
  const stats = devStats(data);
  const tasks = data.dev_tasks as unknown as KanbanTask[];

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Component 03"
        title="Development"
        description="Run the roadmap — add tasks, features and bugs by hand, and drag the sprint board across columns."
      >
        <Badge variant="info">Sprint board</Badge>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="In progress" value={String(stats.inProgress)} icon={Activity} accent="info" sub="active tasks" />
        <StatTile label="Done" value={String(stats.done)} icon={GitBranch} accent="growth" sub="completed" />
        <StatTile label="Open bugs" value={String(stats.openBugs)} icon={Bug} accent={stats.criticalBugs > 0 ? "muted" : "growth"} sub={`${stats.criticalBugs} critical`} />
        <StatTile label="Backlog" value={String(stats.backlog)} icon={Layers} accent="muted" sub="features queued" />
      </div>

      <Tabs defaultValue="sprint">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="sprint">Sprint Board</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
        </TabsList>

        <TabsContent value="sprint">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sprint board</CardTitle>
              <p className="text-xs text-muted-foreground">
                Drag cards across columns. Add tasks under the “Tasks” tab to persist them.
              </p>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <KanbanBoard tasks={tasks} />
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No tasks yet — add some under the “Tasks” tab.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks"><CrudTable config={devTasksEntity} /></TabsContent>
        <TabsContent value="backlog"><CrudTable config={featuresEntity} /></TabsContent>
        <TabsContent value="bugs"><CrudTable config={bugsEntity} /></TabsContent>
      </Tabs>
    </div>
  );
}
