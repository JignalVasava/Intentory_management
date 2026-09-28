import { useMemo } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { phaseOf, ENGINEERS, CONTRACTORS, LOCATIONS } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProjectFilters({ f, setF }: { f: Filters; setF: (f: Filters) => void }) {
  const sel = (key: keyof Filters, placeholder: string, opts: string[]) => (
    <Select value={f[key]} onValueChange={(v) => setF({ ...f, [key]: v })}>
      <SelectTrigger className="h-9 w-full bg-card text-xs sm:w-auto sm:min-w-[140px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}</SelectItem>
        {opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} maxLength={80} placeholder="Search Project / Asset ID" className="h-9 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none focus:border-info" />
      </div>
      {sel("type", "Types", ["Road", "Building"])}
      {sel("phase", "Phases", ["Project Execution", "Operational", "Maintenance & Rehabilitation", "Decommissioning / Disposal"])}
      {sel("location", "Locations", Object.keys(LOCATIONS))}
      {sel("status", "Statuses", ["Engineer Review", "Approved", "Contractor Pending", "Under Execution", "Completion Submitted", "Operational", "Maintenance", "Rehabilitation", "Decommissioning", "Disposed", "Rejected"])}
      {sel("engineer", "Engineers", ENGINEERS)}
      {sel("contractor", "Contractors", CONTRACTORS)}
      {sel("priority", "Priorities", ["Low", "Medium", "High", "Critical"])}
    </div>
  );
}

export type Filters = { q: string; type: string; phase: string; location: string; status: string; engineer: string; contractor: string; priority: string };
export const EMPTY_FILTERS: Filters = { q: "", type: "all", phase: "all", location: "all", status: "all", engineer: "all", contractor: "all", priority: "all" };

export function useFiltered(f: Filters) {
  const { projects } = useStore();
  return useMemo(() => projects.filter((p) => {
    if (f.q && !(p.id + " " + p.name).toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.type !== "all" && p.type !== f.type) return false;
    if (f.phase !== "all" && phaseOf(p.status) !== f.phase) return false;
    if (f.location !== "all" && p.location !== f.location) return false;
    if (f.status !== "all" && p.status !== f.status) return false;
    if (f.engineer !== "all" && p.engineer !== f.engineer) return false;
    if (f.contractor !== "all" && p.contractor !== f.contractor) return false;
    if (f.priority !== "all" && p.priority !== f.priority) return false;
    return true;
  }), [projects, f]);
}

