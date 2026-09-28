import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmtCr, fmtDate } from "@/lib/format";
import { PageHeader, StatusBadge, EmptyState, Field } from "@/components/infra/ui-bits";
import { DecommActions } from "@/components/infra/actions";
import { LifecycleStepper } from "@/components/infra/Timeline";

export const Route = createFileRoute("/decommissioning")({
  head: () => ({
    meta: [
      { title: "Decommissioning & Disposal — RAB InfraTrack" },
      { name: "description", content: "Assets assessed as beyond repair moving through decommissioning, demolition and replacement." },
      { property: "og:title", content: "Decommissioning & Disposal — RAB InfraTrack" },
      { property: "og:description", content: "Decommissioning workflow for assets beyond repair." },
    ],
  }),
  component: DecommPage,
});

const STEPS = ["Critical Asset", "Engineer Assessment", "Government Review", "Approved", "Demolition", "Decommissioned", "Disposed / Replaced"];
const IDX: Record<string, number> = { "Government Review": 2, Rejected: 2, "Decommissioning Approved": 4, "Under Demolition": 4, Decommissioned: 6, "Disposed / Replaced": 7 };

function DecommPage() {
  const { decomm, projects } = useStore();
  return (
    <>
      <PageHeader title="Decommissioning / Disposal" subtitle="Only assets formally assessed as beyond repair and requiring replacement appear here." />
      {decomm.length === 0 ? <EmptyState title="No assets in decommissioning" /> : (
        <div className="space-y-5">
          {decomm.map((d) => {
            const p = projects.find((x) => x.id === d.projectId);
            return (
              <article key={d.id} className="rounded-lg border bg-card shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
                  <div>
                    <p className="font-mono text-xs text-info">{d.id} · <Link to="/projects/$projectId" params={{ projectId: d.projectId }} className="hover:underline">{d.projectId}</Link></p>
                    <h2 className="text-lg font-semibold text-primary">{p?.name}</h2>
                    <p className="text-xs text-muted-foreground">{p?.type} · {p?.location}</p>
                  </div>
                  <StatusBadge status={d.stage} />
                </div>
                <div className="px-5 py-4">
                  <LifecycleStepper steps={STEPS} current={IDX[d.stage] ?? 2} rejected={d.stage === "Rejected"} />
                  <dl className="mt-5 grid gap-4 md:grid-cols-3">
                    <Field label="Reason" value={d.reason} />
                    <Field label="Engineer Assessment" value={d.assessment} />
                    <Field label="Government Decision" value={d.decision ?? "Awaiting review"} />
                    <Field label="Est. Decommissioning Cost" value={fmtCr(d.estimatedCost)} />
                    <Field label="Contractor" value={d.contractor ?? "Not assigned"} />
                    <Field label="Completion Date" value={fmtDate(d.completionDate)} />
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <div className="flex flex-wrap gap-3">{d.documents.map((doc) => <span key={doc} className="inline-flex items-center gap-1.5 rounded border bg-muted/50 px-2 py-1 text-xs"><FileText className="h-3.5 w-3.5 text-info" />{doc}</span>)}</div>
                    <DecommActions d={d} />
                  </div>
                  {d.outcome && <p className="mt-3 text-sm text-success">Outcome: {d.outcome}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
