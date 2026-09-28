import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/infra/ui-bits";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Roles — RAB InfraTrack" },
      { name: "description", content: "Roles and permissions for government officials, engineers, contractors and citizens." },
      { property: "og:title", content: "Settings & Roles — RAB InfraTrack" },
      { property: "og:description", content: "Roles and permissions in RAB InfraTrack." },
    ],
  }),
  component: SettingsPage,
});

const ROLES = [
  { role: "Government Official", perms: ["Create project requests", "Record finalised budget", "Verify citizen requests", "Verify completion", "Approve decommissioning", "Record disposal / replacement"] },
  { role: "Engineer", perms: ["Approve / reject project requests", "Assign contractors", "Assess maintenance issues", "Declare maintenance, rehabilitation or beyond repair", "Verify completion"] },
  { role: "Contractor", perms: ["Accept / reject work orders", "Update progress", "Submit completion with documents", "Mark decommissioning works complete"] },
  { role: "Citizen", perms: ["Report road / building issues", "Track request status"] },
] as const;

function SettingsPage() {
  const { role, setRole } = useStore();
  return (
    <>
      <PageHeader title="Settings" subtitle="Switch the acting role to walk through each step of the lifecycle demo." />
      <div className="grid gap-4 md:grid-cols-2">
        {ROLES.map((r) => (
          <Panel key={r.role} title={r.role} action={role === r.role ? <span className="text-xs font-medium text-success">Active</span> : <button onClick={() => setRole(r.role)} className="text-xs font-medium text-info hover:underline">Act as</button>}>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">{r.perms.map((p) => <li key={p}>{p}</li>)}</ul>
          </Panel>
        ))}
      </div>
      <Panel title="Data" className="mt-6">
        <p className="text-sm text-muted-foreground">This prototype uses realistic sample data held in the browser session. Refreshing the page resets it.</p>
      </Panel>
    </>
  );
}
