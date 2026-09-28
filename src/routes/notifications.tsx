import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { PageHeader, EmptyState } from "@/components/infra/ui-bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — RAB InfraTrack" },
      { name: "description", content: "Approvals, assignments and lifecycle alerts for R&B projects." },
      { property: "og:title", content: "Notifications — RAB InfraTrack" },
      { property: "og:description", content: "Approvals, assignments and lifecycle alerts." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, actions } = useStore();
  return (
    <>
      <PageHeader title="Notifications" subtitle="Every approval, assignment and status change across the portfolio." actions={<Button variant="outline" size="sm" onClick={() => actions.markRead()}>Mark all as read</Button>} />
      {notifications.length === 0 ? <EmptyState title="No notifications" icon={<Bell />} /> : (
        <ul className="divide-y rounded-lg border bg-card shadow-sm">
          {notifications.map((n) => (
            <li key={n.id} className={cn("flex items-start gap-4 px-5 py-4", !n.read && "bg-accent/50")}>
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-info")} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">{n.title}</p>
                <p className="text-sm text-foreground/80">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fmtDate(n.date)}</p>
              </div>
              {n.projectId && <Link to="/projects/$projectId" params={{ projectId: n.projectId }} onClick={() => actions.markRead(n.id)} className="text-xs font-medium text-info hover:underline">Open</Link>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
