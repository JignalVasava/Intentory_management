import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, HardHat, Wrench, Trash2, Map, Megaphone, BarChart3, Bell, Settings, LogOut, Menu, Search, Landmark } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateProjectButton } from "./actions";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects & Assets", icon: FolderKanban },
  { to: "/execution", label: "Project Execution", icon: HardHat },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/decommissioning", label: "Decommissioning", icon: Trash2 },
  { to: "/map", label: "Map View", icon: Map },
  { to: "/requests", label: "Citizen Requests", icon: Megaphone },
  { to: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const ROLES: Role[] = ["Government Official", "Engineer", "Contractor", "Citizen"];
const USER: Record<Role, string> = {
  "Government Official": "S. K. Parikh, EE",
  Engineer: "A. Mehta, ABC Engg.",
  Contractor: "R. Patel, Site Manager",
  Citizen: "Public User",
};

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { role, setRole, notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Landmark className="h-5 w-5" /></div>
        <div>
          <p className="text-base font-semibold leading-tight">RAB InfraTrack</p>
          <p className="text-[11px] text-sidebar-foreground/60">Roads & Buildings Dept.</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} onClick={onNavigate} activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            activeProps={{ className: "!bg-sidebar-accent !text-sidebar-foreground font-medium shadow-[inset_3px_0_0_var(--sidebar-ring)]" }}>
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {to === "/notifications" && unread > 0 && <span className="rounded-full bg-sidebar-ring px-1.5 text-[10px] font-semibold text-sidebar">{unread}</span>}
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">{USER[role].split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{USER[role]}</p>
            <p className="text-[11px] text-sidebar-foreground/60">Acting role</p>
          </div>
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v as Role); toast.info(`Switched to ${v}`); }}>
          <SelectTrigger className="mt-3 h-8 border-sidebar-border bg-sidebar-accent text-xs text-sidebar-foreground"><SelectValue /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={() => toast("Logout is disabled in the demo")} className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>
    </div>
  );
}

function titleFor(path: string) {
  if (path.startsWith("/projects/")) return "Project Record";
  return NAV.find((n) => n.to === path)?.label ?? "RAB InfraTrack";
}

function GlobalSearch() {
  const { projects } = useStore();
  const [q, setQ] = useState("");
  const hits = q.trim() ? projects.filter((p) => (p.id + p.name + p.location).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  return (
    <div className="relative hidden w-72 md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search project / asset ID…" maxLength={80}
        className="h-9 w-full rounded-md border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-info focus:bg-card" />
      {hits.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-md border bg-popover shadow-lg">
          {hits.map((p) => (
            <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} onClick={() => setQ("")} className="block px-3 py-2 text-sm hover:bg-accent">
              <span className="font-mono text-xs text-info">{p.id}</span> <span className="text-foreground">{p.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { notifications, role } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block"><SidebarBody /></aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <button className="rounded-md p-2 text-primary hover:bg-accent lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <p className="flex-1 truncate text-sm font-semibold text-primary">{titleFor(path)}</p>
          <GlobalSearch />
          <Link to="/notifications" className="relative rounded-md p-2 text-primary hover:bg-accent" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />}
          </Link>
          <span className="hidden rounded-md border bg-accent px-2 py-1 text-xs font-medium text-primary sm:inline">{role}</span>
          <CreateProjectButton />
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
