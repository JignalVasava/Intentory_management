import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmtCr, fmtDate, phaseOf, milestonesFor, milestoneState } from "@/lib/format";
import { Panel, StatusBadge, ProgressBar, Field, EmptyState } from "@/components/infra/ui-bits";
import { AssetIcon } from "@/components/infra/ProjectCard";
import { Timeline, LifecycleStepper, lifecycleFor } from "@/components/infra/Timeline";
import { ProjectActions, RequestActions, DecommActions, ReportIssueButton } from "@/components/infra/actions";

export const Route = createFileRoute("/projects/$projectId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.projectId} — Project Record · RAB InfraTrack` },
      { name: "description", content: `Lifecycle record, budget, parties and history for ${params.projectId}.` },
      { property: "og:title", content: `${params.projectId} — Project Record` },
      { property: "og:description", content: `Lifecycle record, budget, parties and history for ${params.projectId}.` },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { projects, requests, decomm } = useStore();
  const p = projects.find((x) => x.id === projectId);
  if (!p) return <EmptyState title="Project not found" body={`No record exists for ${projectId}.`} />;

  const reqs = requests.filter((r) => r.projectId === p.id);
  const activeReq = reqs.find((r) => !["Resolved", "Rejected", "No Maintenance Required", "Beyond Repair"].includes(r.stage));
  const d = decomm.find((x) => x.projectId === p.id && x.stage !== "Rejected");
  const lc = lifecycleFor(p, activeReq?.stage, d?.stage);
  const risk = p.condition === "Critical" || p.priority === "Critical" ? "Critical" : p.priority === "High" || p.condition === "Poor" ? "High" : "Medium";

  return (
    <>
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Projects & Assets</Link>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-sm font-semibold text-info">{p.id}</p>
            <h1 className="mt-1 text-2xl font-semibold text-primary">{p.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><AssetIcon type={p.type} />{p.type}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{p.address}, {p.location}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={p.status} />
            <StatusBadge status={risk} className="!font-normal" />
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 md:grid-cols-4">
          <Field label="Current Phase" value={phaseOf(p.status)} />
          <Field label="Current Status" value={p.status} />
          <Field label="Risk Level" value={risk} />
          <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Progress</dt><dd className="mt-1.5"><ProgressBar value={p.progress} /></dd></div>
        </dl>
        {p.status === "Rejected" && p.rejectionReason && <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Rejected by engineer: {p.rejectionReason}</p>}
      </div>

      <Panel title={lc.title} className="mt-6" action={<ProjectActions p={p} />}>
        <LifecycleStepper steps={lc.steps} current={lc.current} rejected={p.status === "Rejected"} />
        {activeReq && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/50 p-3 text-sm"><span><span className="font-mono text-xs text-info">{activeReq.id}</span> · {activeReq.category} · <StatusBadge status={activeReq.stage} /></span><RequestActions r={activeReq} /></div>}
        {d && d.stage !== "Disposed / Replaced" && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/50 p-3 text-sm"><span><span className="font-mono text-xs text-info">{d.id}</span> · <StatusBadge status={d.stage} /></span><DecommActions d={d} /></div>}
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Project Overview">
            <p className="mb-5 text-sm text-foreground/80">{p.description}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Budget & Financial</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Estimated Cost" value={fmtCr(p.estimatedCost)} />
                  <Field label="Approved Budget" value={p.budget ? fmtCr(p.budget) : "Pending"} />
                  <Field label="Final Cost" value={fmtCr(p.finalCost)} />
                  <Field label="Budget Status" value={!p.budget ? "Not recorded" : p.finalCost ? (p.finalCost > p.budget ? "Over budget" : "Within budget") : "Sanctioned"} />
                </dl>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Project Information</h3>
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Requested" value={fmtDate(p.requestedDate)} />
                  <Field label="Start Date" value={fmtDate(p.startDate)} />
                  <Field label="Target Completion" value={fmtDate(p.expectedEnd)} />
                  <Field label="Finished" value={fmtDate(p.finishedDate)} />
                  <Field label="Scale" value={p.scale} />
                  <Field label="Priority" value={p.priority} />
                  <Field label="Condition" value={p.condition} />
                </dl>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Parties</h3>
                <dl className="grid gap-3">
                  <Field label="Owner" value="Roads & Buildings Department" />
                  <Field label="Engineer / Firm" value={p.engineer} />
                  <Field label="Contractor" value={p.contractor ?? "Not assigned"} />
                </dl>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Location</h3>
                <dl className="grid gap-3">
                  <Field label="District" value={p.location} />
                  <Field label="Site" value={p.address} />
                  <Link to="/map" className="text-sm font-medium text-info hover:underline">View on map →</Link>
                </dl>
              </div>
            </div>
          </Panel>

          {(p.startDate || p.status === "Under Execution") && (
            <Panel title="Execution Milestones">
              <ul className="grid gap-3 sm:grid-cols-2">
                {milestonesFor(p.type).map((m, i) => {
                  const st = milestoneState(p.progress, i);
                  return <li key={m} className="flex items-center justify-between rounded-md border px-3 py-2.5"><span className="text-sm font-medium">{m}</span><StatusBadge status={st === "Completed" ? "Completed" : st === "In Progress" ? "Under Execution" : "Proposed"} className="!text-[11px]" /></li>;
                })}
              </ul>
            </Panel>
          )}

          <Panel title="Maintenance & Citizen Requests" action={p.status === "Operational" ? <ReportIssueButton defaultProjectId={p.id} /> : undefined}>
            {reqs.length === 0 ? <EmptyState title="No requests recorded for this asset" /> : (
              <ul className="divide-y">
                {reqs.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div><p className="text-sm font-medium"><span className="font-mono text-xs text-info">{r.id}</span> · {r.category}</p><p className="text-xs text-muted-foreground">{r.description}</p></div>
                    <StatusBadge status={r.stage} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {d && (
            <Panel title="Decommissioning Record">
              <dl className="grid gap-3 md:grid-cols-2">
                <Field label="Reason" value={d.reason} />
                <Field label="Engineer Assessment" value={d.assessment} />
                <Field label="Government Decision" value={d.decision ?? "Pending"} />
                <Field label="Estimated Cost" value={fmtCr(d.estimatedCost)} />
                <Field label="Outcome" value={d.outcome ?? "—"} />
                <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Documents</dt><dd className="mt-1 space-y-1">{d.documents.map((doc) => <p key={doc} className="flex items-center gap-1.5 text-sm"><FileText className="h-3.5 w-3.5 text-info" />{doc}</p>)}</dd></div>
              </dl>
            </Panel>
          )}
        </div>

        <Panel title="Complete Lifecycle History" className="h-fit">
          {p.timeline.length ? <Timeline events={p.timeline} /> : <EmptyState title="No history yet" />}
        </Panel>
      </div>
    </>
  );
}
