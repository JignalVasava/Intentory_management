import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin, Route as RoadIcon } from "lucide-react";
import type { Project } from "@/lib/types";
import { fmtCr, fmtDate, phaseOf } from "@/lib/format";
import { StatusBadge, ProgressBar } from "./ui-bits";

export function AssetIcon({ type, className = "h-4 w-4" }: { type: Project["type"]; className?: string }) {
  return type === "Building" ? <Building2 className={className} /> : <RoadIcon className={className} />;
}

export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="group flex flex-col rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b px-5 pb-3 pt-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-info">{p.id}</p>
          <h3 className="mt-1 truncate text-base font-semibold text-primary" title={p.name}>{p.name}</h3>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><AssetIcon type={p.type} className="h-3.5 w-3.5" />{p.type}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.location}</span>
          </p>
        </div>
        <StatusBadge status={p.status} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-5 py-4 text-xs">
        <div><dt className="text-muted-foreground">Budget</dt><dd className="font-semibold text-foreground">{fmtCr(p.budget ?? p.estimatedCost)}{!p.budget && <span className="font-normal text-muted-foreground"> est.</span>}</dd></div>
        <div><dt className="text-muted-foreground">Current Phase</dt><dd className="font-medium text-foreground">{phaseOf(p.status)}</dd></div>
        <div className="col-span-2 sm:col-span-1"><dt className="text-muted-foreground">Engineer / Firm</dt><dd className="truncate font-medium text-foreground">{p.engineer}</dd></div>
        <div className="col-span-2 sm:col-span-1"><dt className="text-muted-foreground">Contractor</dt><dd className="truncate font-medium text-foreground">{p.contractor ?? "Not assigned"}</dd></div>
        <div><dt className="text-muted-foreground">Start Date</dt><dd className="font-medium text-foreground">{fmtDate(p.startDate)}</dd></div>
        <div><dt className="text-muted-foreground">{p.finishedDate ? "Finished" : "Target"}</dt><dd className="font-medium text-foreground">{fmtDate(p.finishedDate ?? p.expectedEnd)}</dd></div>
      </dl>
      <div className="mt-auto border-t bg-muted/40 px-5 py-3">
        <ProgressBar value={p.progress} />
        <Link to="/projects/$projectId" params={{ projectId: p.id }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-info">
          View Project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
