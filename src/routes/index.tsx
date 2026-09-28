import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, FolderKanban, HardHat, Wrench, Clock, ShieldAlert, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmtDate, isActive } from "@/lib/format";
import { ProjectFilters, useFiltered, EMPTY_FILTERS, type Filters } from "@/components/infra/filters";
import { PageHeader, Panel, StatusBadge, EmptyState } from "@/components/infra/ui-bits";
import { ProjectCard } from "@/components/infra/ProjectCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "R&B Infrastructure Dashboard — RAB InfraTrack" },
      { name: "description", content: "Track Roads & Buildings projects and assets throughout their complete lifecycle." },
      { property: "og:title", content: "R&B Infrastructure Dashboard — RAB InfraTrack" },
      { property: "og:description", content: "Track Roads & Buildings projects and assets throughout their complete lifecycle." },
    ],
  }),
  component: Dashboard,
});

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof FolderKanban; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${tone}`}><Icon className="h-4 w-4" /></div>
      <div>
        <p className="text-xl font-semibold leading-none text-primary">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { projects, requests, activity } = useStore();
  const [f, setF] = useState<Filters>(EMPTY_FILTERS);
  const list = useFiltered(f);

  const kpis = {
    total: projects.length,
    active: projects.filter(isActive).length,
    maint: projects.filter((p) => p.status === "Maintenance" || p.status === "Rehabilitation").length,
    awaiting: projects.filter((p) => ["Engineer Review", "Contractor Pending", "Completion Submitted"].includes(p.status) || (p.status === "Approved")).length,
    critical: projects.filter((p) => p.condition === "Critical" || p.priority === "Critical").filter((p) => p.status !== "Disposed").length,
  };

  const stages = [
    { label: "Proposed", n: projects.filter((p) => p.status === "Proposed" || p.status === "Engineer Review").length },
    { label: "Review / Approval", n: projects.filter((p) => ["Approved", "Contractor Pending"].includes(p.status)).length },
    { label: "Execution", n: projects.filter((p) => ["Under Execution", "Completion Submitted"].includes(p.status)).length },
    { label: "Operational", n: projects.filter((p) => p.status === "Operational" || p.status === "Completed").length },
    { label: "Maintenance", n: kpis.maint },
    { label: "Decommissioning", n: projects.filter((p) => p.status === "Decommissioning").length },
    { label: "Disposed", n: projects.filter((p) => p.status === "Disposed").length },
  ];

  const attention = projects.filter((p) => ["Engineer Review", "Contractor Pending", "Completion Submitted", "Decommissioning"].includes(p.status) || (p.status === "Approved")).slice(0, 6);
  const openReqs = requests.filter((r) => !["Resolved", "Rejected", "No Maintenance Required", "Beyond Repair"].includes(r.stage)).slice(0, 5);
  const pname = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  return (
    <>
      <PageHeader title="R&B Infrastructure Dashboard" subtitle="Track Roads & Buildings projects and assets throughout their complete lifecycle." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Total Projects" value={kpis.total} icon={FolderKanban} tone="bg-accent text-primary" />
        <Kpi label="Active Projects" value={kpis.active} icon={HardHat} tone="bg-info/10 text-info" />
        <Kpi label="Under Maintenance" value={kpis.maint} icon={Wrench} tone="bg-warning/15 text-warning-foreground" />
        <Kpi label="Awaiting Approval" value={kpis.awaiting} icon={Clock} tone="bg-accent text-info" />
        <Kpi label="Critical Assets" value={kpis.critical} icon={ShieldAlert} tone="bg-destructive/10 text-destructive" />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">R&B Projects</h2>
              <p className="text-xs text-muted-foreground">{list.length} of {projects.length} projects & assets</p>
            </div>
            <Link to="/projects" className="text-sm font-medium text-info hover:underline">Table view →</Link>
          </div>
          <ProjectFilters f={f} setF={setF} />
        </div>
        {list.length === 0 ? <EmptyState title="No projects match these filters" body="Try clearing one or more filters." /> : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {list.map((p) => <ProjectCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <Panel title="Lifecycle Overview" className="mt-8">
        <div className="flex flex-wrap items-stretch gap-2">
          {stages.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="min-w-[110px] rounded-md border bg-muted/50 px-3 py-2 text-center">
                <p className="text-xl font-semibold text-primary">{s.n}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
              {i < stages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title={<span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning-foreground" />Projects Requiring Attention</span>}>
          <ul className="divide-y">
            {attention.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link to="/projects/$projectId" params={{ projectId: p.id }} className="min-w-0">
                  <p className="font-mono text-[11px] text-info">{p.id}</p>
                  <p className="truncate text-sm font-medium text-foreground hover:text-info">{p.name}</p>
                </Link>
                <StatusBadge status={p.status === "Approved" && !p.budget ? "Approved" : p.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Maintenance Requests" action={<Link to="/maintenance" className="text-xs text-info hover:underline">View all</Link>}>
          {openReqs.length === 0 ? <EmptyState title="No open requests" /> : (
            <ul className="divide-y">
              {openReqs.map((r) => (
                <li key={r.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[11px] text-info">{r.id}</p>
                    <StatusBadge status={r.stage} />
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium">{r.category} — {pname(r.projectId)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent Activity">
          <ul className="space-y-3">
            {activity.slice(0, 7).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-info" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">
                    <Link to="/projects/$projectId" params={{ projectId: a.projectId }} className="font-mono text-info hover:underline">{a.projectId}</Link> · {a.actor} · {fmtDate(a.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
