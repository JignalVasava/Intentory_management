import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import type { Project } from "@/lib/types";
import { fmtCr, fmtDate, milestonesFor, milestoneState } from "@/lib/format";
import { PageHeader, StatusBadge, ProgressBar, EmptyState } from "@/components/infra/ui-bits";
import { ProjectActions } from "@/components/infra/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/execution")({
  head: () => ({
    meta: [
      { title: "Project Execution — RAB InfraTrack" },
      { name: "description", content: "Engineer review, budget, contractor assignment and execution tracking for R&B projects." },
      { property: "og:title", content: "Project Execution — RAB InfraTrack" },
      { property: "og:description", content: "Engineer review, budget, contractor assignment and execution tracking." },
    ],
  }),
  component: ExecutionPage,
});

function Row({ p, cols }: { p: Project; cols: React.ReactNode[] }) {
  return (
    <tr className="align-top hover:bg-accent/40">
      <td className="px-4 py-3">
        <Link to="/projects/$projectId" params={{ projectId: p.id }} className="font-mono text-xs font-semibold text-info hover:underline">{p.id}</Link>
        <p className="font-medium text-primary">{p.name}</p>
        <p className="text-xs text-muted-foreground">{p.type} · {p.location}</p>
      </td>
      {cols.map((c, i) => <td key={i} className="px-4 py-3 text-sm">{c}</td>)}
      <td className="px-4 py-3"><ProjectActions p={p} /></td>
    </tr>
  );
}

function Table({ heads, rows }: { heads: string[]; rows: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
      <table className="w-full min-w-[900px]">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground"><tr>{["Project", ...heads, "Action"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y">{rows}</tbody>
      </table>
    </div>
  );
}

function ExecutionPage() {
  const { projects } = useStore();
  const review = projects.filter((p) => p.status === "Engineer Review");
  const budget = projects.filter((p) => p.status === "Approved" && !p.budget);
  const assign = projects.filter((p) => (p.status === "Approved" && p.budget) || p.status === "Contractor Pending");
  const exec = projects.filter((p) => p.status === "Under Execution" || p.status === "Completion Submitted");
  const rejected = projects.filter((p) => p.status === "Rejected");

  const empty = <EmptyState title="Nothing in this stage" body="Projects will appear here as they move through the lifecycle." />;

  return (
    <>
      <PageHeader title="Project Execution" subtitle="Government request → Engineer review → Budget → Contractor → Execution → Completion." />
      <Tabs defaultValue="review">
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="review">Awaiting Engineer Review ({review.length})</TabsTrigger>
          <TabsTrigger value="budget">Budget ({budget.length})</TabsTrigger>
          <TabsTrigger value="assign">Contractor Assignment ({assign.length})</TabsTrigger>
          <TabsTrigger value="exec">Under Execution ({exec.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="review">
          {review.length ? <Table heads={["Requested", "Engineer / Firm", "Est. Cost", "Status"]} rows={review.map((p) => <Row key={p.id} p={p} cols={[fmtDate(p.requestedDate), p.engineer, fmtCr(p.estimatedCost), <StatusBadge key="s" status={p.status} />]} />)} /> : empty}
        </TabsContent>
        <TabsContent value="budget">
          {budget.length ? <Table heads={["Estimated Cost", "Approved Budget", "Budget Status"]} rows={budget.map((p) => <Row key={p.id} p={p} cols={[fmtCr(p.estimatedCost), "—", <StatusBadge key="s" status="Engineer Review" />]} />)} /> : empty}
        </TabsContent>
        <TabsContent value="assign">
          {assign.length ? <Table heads={["Budget", "Contractor", "Status"]} rows={assign.map((p) => <Row key={p.id} p={p} cols={[fmtCr(p.budget), p.contractor ?? "Not assigned", <StatusBadge key="s" status={p.status === "Approved" ? "Approved" : p.status} />]} />)} /> : empty}
        </TabsContent>
        <TabsContent value="exec">
          {exec.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {exec.map((p) => (
                <div key={p.id} className="rounded-lg border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to="/projects/$projectId" params={{ projectId: p.id }} className="font-mono text-xs font-semibold text-info hover:underline">{p.id}</Link>
                      <p className="font-semibold text-primary">{p.name}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><dt className="text-muted-foreground">Start</dt><dd className="font-medium">{fmtDate(p.startDate)}</dd></div>
                    <div><dt className="text-muted-foreground">Expected Completion</dt><dd className="font-medium">{fmtDate(p.expectedEnd)}</dd></div>
                    <div><dt className="text-muted-foreground">Contractor</dt><dd className="font-medium">{p.contractor}</dd></div>
                    <div><dt className="text-muted-foreground">Engineer</dt><dd className="font-medium">{p.engineer}</dd></div>
                  </dl>
                  <ProgressBar value={p.progress} className="mt-4" />
                  <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                    {milestonesFor(p.type).map((m, i) => { const st = milestoneState(p.progress, i); return <li key={m} className="flex justify-between gap-2 rounded bg-muted/60 px-2 py-1"><span>{m}</span><span className={st === "Completed" ? "text-success" : st === "In Progress" ? "text-info" : "text-muted-foreground"}>{st}</span></li>; })}
                  </ul>
                  <div className="mt-4"><ProjectActions p={p} /></div>
                </div>
              ))}
            </div>
          ) : empty}
        </TabsContent>
        <TabsContent value="rejected">
          {rejected.length ? <Table heads={["Engineer", "Reason"]} rows={rejected.map((p) => <Row key={p.id} p={p} cols={[p.engineer, p.rejectionReason ?? "—"]} />)} /> : empty}
        </TabsContent>
      </Tabs>
    </>
  );
}
