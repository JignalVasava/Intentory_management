import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProjectFilters, useFiltered, EMPTY_FILTERS, type Filters } from "@/components/infra/filters";
import { PageHeader, StatusBadge, ProgressBar, EmptyState } from "@/components/infra/ui-bits";
import { AssetIcon } from "@/components/infra/ProjectCard";
import { fmtCr, fmtDate, phaseOf } from "@/lib/format";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects & Assets Register — RAB InfraTrack" },
      { name: "description", content: "Complete register of Roads & Buildings projects and infrastructure assets." },
      { property: "og:title", content: "Projects & Assets Register — RAB InfraTrack" },
      { property: "og:description", content: "Complete register of Roads & Buildings projects and infrastructure assets." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [f, setF] = useState<Filters>(EMPTY_FILTERS);
  const list = useFiltered(f);
  return (
    <>
      <PageHeader title="Projects & Assets" subtitle="Single source of truth for every road and building across its lifecycle." />
      <div className="mb-4"><ProjectFilters f={f} setF={setF} /></div>
      {list.length === 0 ? <EmptyState title="No projects found" /> : (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{["Project ID", "Name", "Type", "Location", "Budget", "Engineer", "Contractor", "Phase", "Status", "Progress", "Condition"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3"><Link to="/projects/$projectId" params={{ projectId: p.id }} className="font-mono text-xs font-semibold text-info hover:underline">{p.id}</Link></td>
                  <td className="px-4 py-3 font-medium text-primary">{p.name}<p className="text-xs font-normal text-muted-foreground">Start {fmtDate(p.startDate)}</p></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><AssetIcon type={p.type} />{p.type}</span></td>
                  <td className="px-4 py-3">{p.location}</td>
                  <td className="px-4 py-3">{fmtCr(p.budget ?? p.estimatedCost)}</td>
                  <td className="px-4 py-3 text-xs">{p.engineer}</td>
                  <td className="px-4 py-3 text-xs">{p.contractor ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{phaseOf(p.status)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="w-40 px-4 py-3"><ProgressBar value={p.progress} /></td>
                  <td className="px-4 py-3 text-xs">{p.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
