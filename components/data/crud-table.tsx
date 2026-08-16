"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Database } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCrud, type CrudRow } from "@/lib/use-crud";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatShortDate,
  relativeTime,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type FieldType =
  | "text" | "textarea" | "number" | "currency" | "date" | "datetime" | "select" | "tags";
export type BadgeVariant =
  | "default" | "secondary" | "outline" | "growth" | "info" | "critical" | "muted";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  optionLabels?: Record<string, string>;
  required?: boolean;
  placeholder?: string;
  hideInTable?: boolean;
  /**
   * Shown in the table, kept out of the add/edit form and out of every write.
   * For columns the database owns, like a `default now()` timestamp: without
   * this, saving a status change would post the whole row back and stamp the
   * received time with whatever was sitting in the input.
   */
  readOnly?: boolean;
  badgeMap?: Record<string, BadgeVariant>;
  defaultValue?: string | number;
}

export interface EntityConfig<T extends CrudRow = CrudRow> {
  table: string;
  title: string;
  singular: string;
  description?: string;
  fields: FieldDef[];
  orderBy?: string;
  ascending?: boolean;
  /** primary key column — defaults to "id" */
  pk?: string;
  mock?: T[];
}

function emptyValues(fields: FieldDef[]): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const f of fields) {
    v[f.key] =
      f.defaultValue ??
      (f.type === "number" || f.type === "currency"
        ? 0
        : f.type === "select"
          ? f.options?.[0] ?? ""
          : "");
  }
  return v;
}

function CrudForm({
  fields,
  initial,
  onSave,
  onClose,
}: {
  fields: FieldDef[];
  initial: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [busy, setBusy] = useState(false);

  // Database-owned columns are displayed but never posted back.
  const editable = fields.filter((f) => !f.readOnly);

  function set(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit() {
    setBusy(true);
    const payload: Record<string, unknown> = {};
    for (const f of editable) {
      const raw = values[f.key];
      if (f.type === "number" || f.type === "currency") payload[f.key] = Number(raw) || 0;
      else if (f.type === "tags")
        payload[f.key] =
          typeof raw === "string"
            ? raw.split(",").map((s) => s.trim()).filter(Boolean)
            : raw ?? [];
      else payload[f.key] = raw === "" ? null : raw;
    }
    await onSave(payload);
    setBusy(false);
    onClose();
  }

  // Database-owned values, pinned above the scroll area so they stay visible
  // while you work the row. Absent on a new row, which hasn't got one yet.
  const meta = fields.filter((f) => f.readOnly && values[f.key]);

  return (
    <div className="grid gap-4 py-2">
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg border border-input bg-muted/30 px-3 py-2">
          {meta.map((f) => (
            <div key={f.key} className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">{f.label}</span>
              <span className="font-mono text-xs tabular-nums">
                {f.type === "datetime"
                  ? `${formatDateTime(String(values[f.key]))} · ${relativeTime(String(values[f.key]))}`
                  : String(values[f.key])}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
        {editable.map((f) => {
          const val = values[f.key];
          return (
            <div key={f.key} className="grid gap-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea id={f.key} value={(val as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} />
              ) : f.type === "select" ? (
                <Select value={(val as string) ?? ""} onValueChange={(v) => set(f.key, v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o} value={o}>
                        {f.optionLabels?.[o] ?? o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "tags" ? (
                <Input
                  id={f.key}
                  value={Array.isArray(val) ? (val as string[]).join(", ") : (val as string) ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder ?? "Comma, separated, values"}
                />
              ) : (
                <Input
                  id={f.key}
                  type={f.type === "number" || f.type === "currency" ? "number" : f.type === "date" ? "date" : "text"}
                  value={(val as string | number) ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={f.type === "number" || f.type === "currency" ? "font-mono" : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={submit} disabled={busy}>
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function renderCell(field: FieldDef, value: unknown) {
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;
  if (field.badgeMap) {
    const variant = field.badgeMap[String(value)] ?? "muted";
    return <Badge variant={variant} className="capitalize">{field.optionLabels?.[String(value)] ?? String(value)}</Badge>;
  }
  switch (field.type) {
    case "currency":
      return <span className="font-mono tabular-nums">{formatCurrency(Number(value), { decimals: 2 })}</span>;
    case "number":
      return <span className="font-mono tabular-nums">{formatNumber(Number(value))}</span>;
    case "date":
      return <span className="font-mono text-xs text-muted-foreground">{formatShortDate(String(value))}</span>;
    case "datetime": {
      const d = new Date(String(value));
      if (Number.isNaN(d.getTime())) return <span className="text-muted-foreground">—</span>;
      // Absolute answers "when exactly", relative answers "is this going stale".
      // A queue needs both, so the cell carries both.
      return (
        <div className="whitespace-nowrap font-mono text-xs leading-tight">
          <div className="tabular-nums">{formatDateTime(d)}</div>
          <div className="text-muted-foreground">{relativeTime(d)}</div>
        </div>
      );
    }
    case "tags":
      return (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(value) ? value : String(value).split(",")).slice(0, 3).map((t, i) => (
            <Badge key={i} variant="muted">{String(t).trim()}</Badge>
          ))}
        </div>
      );
    case "textarea":
      return <span className="line-clamp-1 text-muted-foreground">{String(value)}</span>;
    default:
      return <span className="truncate">{String(value)}</span>;
  }
}

export function CrudTable<T extends CrudRow>({
  config,
  rowActions,
}: {
  config: EntityConfig<T>;
  /**
   * Extra per-row controls, rendered to the left of edit and delete. Used by
   * Customer Support for Reply, which is a table-specific action rather than
   * something every entity has.
   */
  rowActions?: (row: T) => React.ReactNode;
}) {
  const pk = config.pk ?? "id";
  const { rows, loading, create, update, remove } = useCrud<T>(config.table, {
    mock: config.mock,
    orderBy: config.orderBy,
    ascending: config.ascending,
    pk,
  });
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const cols = config.fields.filter((f) => !f.hideInTable);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4 text-muted-foreground" />
            {config.title}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {loading ? "Loading…" : `${rows.length} ${rows.length === 1 ? config.singular : config.singular + "s"}`}
            {config.description ? ` · ${config.description}` : ""}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> New {config.singular}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New {config.singular}</DialogTitle></DialogHeader>
            <CrudForm
              fields={config.fields}
              initial={emptyValues(config.fields)}
              onSave={async (v) => { await create(v as Partial<T>); }}
              onClose={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((f) => (
                <TableHead key={f.key}>{f.label}</TableHead>
              ))}
              <TableHead className={cn("text-right", rowActions ? "w-[120px]" : "w-[80px]")}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={String(row[pk])}>
                {cols.map((f) => (
                  <TableCell key={f.key} className="max-w-[240px] text-sm">
                    {renderCell(f, row[f.key])}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {rowActions?.(row)}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(row)} aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { if (confirm(`Delete this ${config.singular}?`)) remove(String(row[pk])); }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-critical" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={cols.length + 1} className="py-8 text-center text-sm text-muted-foreground">
                  No {config.singular}s yet — add your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {config.singular}</DialogTitle></DialogHeader>
          {editing && (
            <CrudForm
              fields={config.fields}
              initial={editing as Record<string, unknown>}
              onSave={async (v) => { await update(String(editing[pk]), v as Partial<T>); }}
              onClose={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
