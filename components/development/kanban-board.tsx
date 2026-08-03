"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical, CalendarClock } from "lucide-react";

import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type KanbanStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: KanbanStatus;
  priority: "P0" | "P1" | "P2";
  assignee?: string;
  due_date?: string;
}

const columns: { id: KanbanStatus; label: string; accent: string }[] = [
  { id: "backlog", label: "Backlog", accent: "bg-muted-foreground/40" },
  { id: "todo", label: "To Do", accent: "bg-info/60" },
  { id: "in_progress", label: "In Progress", accent: "bg-info" },
  { id: "review", label: "Review", accent: "bg-growth/70" },
  { id: "done", label: "Done", accent: "bg-growth" },
];

const priorityTone: Record<KanbanTask["priority"], "critical" | "info" | "muted"> = {
  P0: "critical",
  P1: "info",
  P2: "muted",
};

function TaskCard({ task, overlay = false }: { task: KanbanTask; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      className={cn(
        "group rounded-lg border border-border bg-card p-3 shadow-sm",
        isDragging && !overlay && "opacity-30",
        overlay && "rotate-2 cursor-grabbing shadow-xl ring-1 ring-info/40",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing"
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{task.title}</p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
          <div className="mt-2.5 flex items-center justify-between">
            <Badge variant={priorityTone[task.priority]}>{task.priority}</Badge>
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              {task.due_date && (
                <>
                  <CalendarClock className="h-3 w-3" />
                  {formatShortDate(task.due_date)}
                </>
              )}
              {task.assignee && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-secondary text-[9px] font-semibold text-foreground">
                  {task.assignee[0]?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({ col, tasks }: { col: (typeof columns)[number]; tasks: KanbanTask[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div className="flex w-72 shrink-0 flex-col lg:w-auto">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn("h-2 w-2 rounded-full", col.accent)} />
        <span className="text-sm font-medium">{col.label}</span>
        <span className="font-mono text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/70 bg-background/30 p-2 transition-colors",
          isOver && "border-info/50 bg-info/5",
        )}
      >
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks: initial }: { tasks: KanbanTask[] }) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // keep local board in sync when live data arrives
  useEffect(() => setTasks(initial), [initial]);

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const target = over.id as KanbanStatus;
    setTasks((prev) => prev.map((t) => (t.id === active.id ? { ...t, status: target } : t)));
  }

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {columns.map((col) => (
          <Column key={col.id} col={col} tasks={tasks.filter((t) => t.status === col.id)} />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
