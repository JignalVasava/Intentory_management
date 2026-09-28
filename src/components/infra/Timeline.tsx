import { Check, X, Info, AlertTriangle } from "lucide-react";
import type { TimelineEvent, Project } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const icon = { done: Check, rejected: X, info: Info, warning: AlertTriangle };
const dot = {
  done: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  info: "bg-accent text-info border border-info/30",
  warning: "bg-warning text-warning-foreground",
};
const trackLabel = { execution: "Project Execution", maintenance: "Maintenance", decommissioning: "Decommissioning" };

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].reverse();
  return (
    <ol className="relative">
      {sorted.map((e, i) => {
        const Icon = icon[e.status];
        return (
          <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < sorted.length - 1 && <span className="absolute left-[13px] top-7 h-full w-px bg-border" />}
            <span className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", dot[e.status])}><Icon className="h-3.5 w-3.5" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-semibold text-foreground">{e.title}</p>
                <span className="font-mono text-xs text-muted-foreground">{fmtDate(e.date)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{e.by} · <span className="uppercase tracking-wide">{trackLabel[e.track]}</span></p>
              {e.remarks && <p className="mt-1 text-sm text-foreground/80">{e.remarks}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const EXEC = ["Project Request", "Engineer Review", "Approved", "Budget Recorded", "Contractor Assigned", "Contractor Accepted", "Project Execution", "Completed", "Operational"];
const MAINT = ["Citizen Request", "Govt. Verification", "Engineer Assessment", "Maintenance Approved", "Contractor Assigned", "Maintenance Execution", "Completed", "Operational"];
const DECOM = ["Operational", "Critical Condition", "Engineer Assessment", "Beyond Repair", "Decommissioning Approved", "Decommissioned", "Disposed / Replaced"];

export function lifecycleFor(p: Project, reqStage?: string, decStage?: string): { steps: string[]; current: number; title: string } {
  if (p.status === "Decommissioning" || p.status === "Disposed") {
    const map: Record<string, number> = { "Government Review": 4, "Decommissioning Approved": 5, "Under Demolition": 5, Decommissioned: 6, "Disposed / Replaced": 7 };
    return { steps: DECOM, current: p.status === "Disposed" ? 7 : map[decStage ?? ""] ?? 4, title: "Decommissioning / Disposal Lifecycle" };
  }
  if ((p.status === "Maintenance" || p.status === "Rehabilitation") || (reqStage && !["Resolved", "Rejected", "No Maintenance Required", "Beyond Repair"].includes(reqStage))) {
    const map: Record<string, number> = { "Pending Verification": 1, "Engineer Assessment": 2, "Maintenance Approved": 4, "Contractor Pending": 5, "Under Maintenance": 5, "Completion Submitted": 6 };
    return { steps: MAINT, current: map[reqStage ?? ""] ?? 4, title: "Maintenance & Rehabilitation Lifecycle" };
  }
  const map: Record<string, number> = { Proposed: 0, "Engineer Review": 1, Rejected: 1, Approved: p.budget ? 4 : 3, "Contractor Pending": 5, "Contractor Accepted": 6, "Under Execution": 6, "Completion Submitted": 7, Completed: 8, Operational: 9 };
  return { steps: EXEC, current: map[p.status] ?? 0, title: "Project Execution Lifecycle" };
}

export function LifecycleStepper({ steps, current, rejected }: { steps: string[]; current: number; rejected?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-max items-start">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className="flex items-start">
              <div className="flex w-24 flex-col items-center text-center">
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && !rejected && "border-info bg-accent text-info ring-4 ring-info/15",
                  active && rejected && "border-destructive bg-destructive/10 text-destructive",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}>{done ? <Check className="h-4 w-4" /> : active && rejected ? <X className="h-4 w-4" /> : i + 1}</span>
                <span className={cn("mt-2 text-[11px] leading-tight", done || active ? "font-semibold text-primary" : "text-muted-foreground")}>{s}</span>
              </div>
              {i < steps.length - 1 && <span className={cn("mt-4 h-0.5 w-6", i < current ? "bg-primary" : "bg-border")} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
