import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useStore } from "@/lib/store";
import { phaseOf, fmtCr } from "@/lib/format";
import { PageHeader, Panel, StatusBadge, ProgressBar } from "@/components/infra/ui-bits";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — RAB InfraTrack" },
      { name: "description", content: "Portfolio analytics for R&B projects: phases, condition, budgets and maintenance." },
      { property: "og:title", content: "Reports & Analytics — RAB InfraTrack" },
      { property: "og:description", content: "Portfolio analytics for R&B projects." },
    ],
  }),
  component: ReportsPage,
});

const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const count = <T,>(arr: T[], key: (x: T) => string) => Object.entries(arr.reduce<Record<string, number>>((a, x) => ((a[key(x)] = (a[key(x)] ?? 0) + 1), a), {})).map(([name, value]) => ({ name, value }));
const tip = { contentStyle: { borderRadius: 6, border: "1px solid var(--border)", fontSize: 12 } };

function ReportsPage() {
  const { projects, requests } = useStore();
  const byType = count(projects, (p) => p.type);
  const byPhase = count(projects, (p) => phaseOf(p.status).split(" ")[0] ?? "");
  const byCond = count(projects.filter((p) => p.condition !== "N/A"), (p) => p.condition);
  const byStage = count(requests, (r) => r.stage);
  const byLoc = count(projects, (p) => p.location).sort((a, b) => b.value - a.value);
  const budget = projects.filter((p) => p.budget).map((p) => ({ name: p.id.slice(4), Budget: p.budget, Final: p.finalCost ?? 0 }));
  const active = projects.filter((p) => p.status === "Under Execution" || p.status === "Completion Submitted");
  const critical = projects.filter((p) => (p.condition === "Critical" || p.condition === "Poor") && p.status !== "Disposed");
  const total = projects.reduce((a, p) => a + (p.budget ?? 0), 0);

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle={`Portfolio of ${projects.length} projects · Total sanctioned budget ${fmtCr(total)}`} />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Projects by Type">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart><Pie data={byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>{byType.map((_, i) => <Cell key={i} fill={C[i]} />)}</Pie><Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Projects by Lifecycle Phase">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPhase}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip {...tip} /><Bar dataKey="value" name="Projects" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Asset Condition">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCond} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} /><Tooltip {...tip} /><Bar dataKey="value" name="Assets" radius={[0, 4, 4, 0]}>{byCond.map((d, i) => <Cell key={i} fill={d.name === "Critical" ? "var(--destructive)" : d.name === "Poor" ? "var(--chart-4)" : "var(--chart-2)"} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Budget Overview (₹ Cr)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={budget}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="Budget" fill="var(--chart-1)" radius={[3, 3, 0, 0]} /><Bar dataKey="Final" name="Final cost" fill="var(--chart-3)" radius={[3, 3, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Maintenance Requests by Stage">
          <ul className="space-y-2">{byStage.map((s) => <li key={s.name} className="flex items-center justify-between"><StatusBadge status={s.name} /><span className="font-mono text-sm font-semibold">{s.value}</span></li>)}</ul>
        </Panel>
        <Panel title="Project Progress">
          <ul className="space-y-3">{active.map((p) => <li key={p.id}><Link to="/projects/$projectId" params={{ projectId: p.id }} className="text-sm font-medium hover:text-info">{p.name}</Link><ProgressBar value={p.progress} /></li>)}</ul>
        </Panel>
        <Panel title="Location Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byLoc}><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip {...tip} /><Bar dataKey="value" name="Projects" fill="var(--chart-2)" radius={[3, 3, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Critical Infrastructure">
          <ul className="divide-y">{critical.map((p) => <li key={p.id} className="flex items-center justify-between gap-2 py-2"><Link to="/projects/$projectId" params={{ projectId: p.id }} className="min-w-0"><p className="font-mono text-[11px] text-info">{p.id}</p><p className="truncate text-sm">{p.name}</p></Link><StatusBadge status={p.condition === "Critical" ? "Critical" : "High"} /></li>)}</ul>
        </Panel>
      </div>
    </>
  );
}
