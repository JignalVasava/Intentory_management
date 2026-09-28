import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import type { CitizenRequest, RequestStage } from "@/lib/types";
import { fmtDate, fmtCr } from "@/lib/format";
import { PageHeader, StatusBadge, ProgressBar } from "@/components/infra/ui-bits";
import { RequestActions, ReportIssueButton } from "@/components/infra/actions";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance & Rehabilitation — RAB InfraTrack" },
      { name: "description", content: "Citizen issues, verification, engineer assessment and maintenance execution for roads and buildings." },
      { property: "og:title", content: "Maintenance & Rehabilitation — RAB InfraTrack" },
      { property: "og:description", content: "Maintenance workflow for roads and buildings." },
    ],
  }),
  component: MaintenancePage,
});

const COLUMNS: { title: string; stages: RequestStage[]; hint: string }[] = [
  { title: "Government Verification", stages: ["Pending Verification"], hint: "Citizen reports awaiting verification" },
  { title: "Engineer Assessment", stages: ["Engineer Assessment"], hint: "Verified issues under technical review" },
  { title: "Contractor Assignment", stages: ["Maintenance Approved", "Contractor Pending"], hint: "Approved work awaiting contractor" },
  { title: "Maintenance Execution", stages: ["Under Maintenance", "Completion Submitted"], hint: "Work in progress / verification" },
];

function RequestCard({ r }: { r: CitizenRequest }) {
  const { projects } = useStore();
  const p = projects.find((x) => x.id === r.projectId);
  return (
    <div className="rounded-md border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-info">{r.id}</span>
        <StatusBadge status={r.priority} className="!text-[10px]" />
      </div>
      <p className="mt-1.5 text-sm font-semibold text-primary">{r.category}</p>
      {p && <Link to="/projects/$projectId" params={{ projectId: p.id }} className="text-xs text-muted-foreground hover:text-info">{p.name} · {p.location}</Link>}
      <p className="mt-2 line-clamp-3 text-xs text-foreground/80">{r.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <StatusBadge status={r.stage} className="!text-[10px]" /> {fmtDate(r.date)}
      </div>
      {r.contractor && <p className="mt-2 text-xs"><span className="text-muted-foreground">Contractor:</span> {r.contractor}{r.estimatedCost ? ` · ${fmtCr(r.estimatedCost)}` : ""}</p>}
      {(r.stage === "Under Maintenance" || r.stage === "Completion Submitted") && <ProgressBar value={r.progress} className="mt-2" />}
      <div className="mt-3"><RequestActions r={r} /></div>
    </div>
  );
}

function MaintenancePage() {
  const { requests, projects } = useStore();
  const closed = requests.filter((r) => ["Resolved", "Rejected", "No Maintenance Required", "Beyond Repair"].includes(r.stage));
  const under = projects.filter((p) => p.status === "Maintenance" || p.status === "Rehabilitation");
  return (
    <>
      <PageHeader title="Maintenance & Rehabilitation" subtitle="Citizen request → Verification → Engineer assessment → Contractor → Execution → Operational." actions={<ReportIssueButton />} />
      {under.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Assets under maintenance:</span>
          {under.map((p) => <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} className="rounded-md border bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground hover:underline">{p.id} · {p.name}</Link>)}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((c) => {
          const items = requests.filter((r) => c.stages.includes(r.stage));
          return (
            <section key={c.title} className="rounded-lg border bg-muted/50 p-3">
              <div className="mb-3 px-1">
                <h2 className="flex items-center justify-between text-sm font-semibold text-primary">{c.title}<span className="rounded bg-card px-1.5 font-mono text-xs">{items.length}</span></h2>
                <p className="text-[11px] text-muted-foreground">{c.hint}</p>
              </div>
              <div className="space-y-3">
                {items.length ? items.map((r) => <RequestCard key={r.id} r={r} />) : <p className="rounded-md border border-dashed bg-card/60 px-3 py-6 text-center text-xs text-muted-foreground">No requests</p>}
              </div>
            </section>
          );
        })}
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-primary">Closed Requests</h2>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Request", "Asset", "Issue", "Outcome", "Remarks"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {closed.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 font-mono text-xs text-info">{r.id}</td>
                  <td className="px-4 py-2.5"><Link to="/projects/$projectId" params={{ projectId: r.projectId }} className="hover:text-info">{projects.find((p) => p.id === r.projectId)?.name}</Link></td>
                  <td className="px-4 py-2.5">{r.category}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.stage} /></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.remarks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
