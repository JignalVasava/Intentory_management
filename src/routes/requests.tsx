import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { PageHeader, StatusBadge, EmptyState } from "@/components/infra/ui-bits";
import { RequestActions, ReportIssueButton } from "@/components/infra/actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Citizen Infrastructure Requests — RAB InfraTrack" },
      { name: "description", content: "Citizen-reported issues on roads and buildings and their resolution status." },
      { property: "og:title", content: "Citizen Infrastructure Requests — RAB InfraTrack" },
      { property: "og:description", content: "Citizen-reported issues on roads and buildings." },
    ],
  }),
  component: RequestsPage,
});

const TABS = ["All", "Open", "Resolved", "Rejected / Closed"] as const;

function RequestsPage() {
  const { requests, projects } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const closed = ["Rejected", "No Maintenance Required", "Beyond Repair"];
  const list = requests.filter((r) => tab === "All" || (tab === "Open" && !closed.includes(r.stage) && r.stage !== "Resolved") || (tab === "Resolved" && r.stage === "Resolved") || (tab === "Rejected / Closed" && closed.includes(r.stage)));
  return (
    <>
      <PageHeader title="Citizen Infrastructure Requests" subtitle="Issues reported by the public on roads and buildings." actions={<ReportIssueButton />} />
      <div className="mb-4 flex flex-wrap gap-1 rounded-md border bg-card p-1 text-sm sm:w-fit">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded px-3 py-1.5", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")}>{t}</button>)}
      </div>
      {list.length === 0 ? <EmptyState title="No requests in this view" /> : (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground"><tr>{["Request ID", "Issue", "Asset / Location", "Submitted", "Citizen", "Priority", "Status", "Action"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {list.map((r) => {
                const p = projects.find((x) => x.id === r.projectId);
                return (
                  <tr key={r.id} className="align-top hover:bg-accent/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-info">{r.id}</td>
                    <td className="max-w-xs px-4 py-3"><p className="font-medium text-primary">{r.category}</p><p className="text-xs text-muted-foreground">{r.description}</p></td>
                    <td className="px-4 py-3">{p && <Link to="/projects/$projectId" params={{ projectId: p.id }} className="hover:text-info">{p.name}</Link>}<p className="text-xs text-muted-foreground">{p?.location}</p></td>
                    <td className="px-4 py-3 text-xs">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3 text-xs">{r.citizen}<p className="text-muted-foreground">{r.contact}</p></td>
                    <td className="px-4 py-3"><StatusBadge status={r.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.stage} /></td>
                    <td className="px-4 py-3"><RequestActions r={r} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
