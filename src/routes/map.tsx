import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { LOCATIONS, fmtCr, statusTone } from "@/lib/format";
import { PageHeader, StatusBadge, ProgressBar } from "@/components/infra/ui-bits";
import { AssetIcon } from "@/components/infra/ProjectCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map View — RAB InfraTrack" },
      { name: "description", content: "Geographic view of roads and buildings across districts." },
      { property: "og:title", content: "Map View — RAB InfraTrack" },
      { property: "og:description", content: "Geographic view of roads and buildings across districts." },
    ],
  }),
  component: MapPage,
});

const pinCls: Record<string, string> = {
  success: "fill-success", warning: "fill-warning", danger: "fill-destructive", navy: "fill-primary", info: "fill-info", neutral: "fill-muted-foreground",
};

function MapPage() {
  const { projects } = useStore();
  const [sel, setSel] = useState<string | null>(projects[0]?.id ?? null);
  const [type, setType] = useState<"all" | "Road" | "Building">("all");
  const list = projects.filter((p) => type === "all" || p.type === type);
  const current = projects.find((p) => p.id === sel);
  // offset pins sharing a district
  const seen: Record<string, number> = {};

  return (
    <>
      <PageHeader title="Map View" subtitle="Schematic district map of Roads & Buildings assets — Gujarat." actions={
        <div className="flex rounded-md border bg-card p-0.5 text-xs">
          {(["all", "Road", "Building"] as const).map((t) => <button key={t} onClick={() => setType(t)} className={cn("rounded px-3 py-1.5", type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")}>{t === "all" ? "All" : t + "s"}</button>)}
        </div>
      } />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-3 shadow-sm lg:col-span-2">
          <svg viewBox="60 90 440 330" className="h-auto w-full rounded bg-accent/60">
            <path d="M120 180 L200 150 L270 110 L340 100 L390 120 L420 160 L440 210 L430 260 L410 300 L400 350 L390 400 L360 405 L350 360 L320 340 L290 350 L250 355 L200 360 L160 345 L130 310 L100 280 L90 240 L100 210 Z" className="fill-card stroke-border" strokeWidth="2" />
            <path d="M200 300 Q240 290 290 320" className="fill-none stroke-border" strokeDasharray="4 4" />
            {Object.entries(LOCATIONS).map(([name, c]) => <text key={name} x={c.x} y={c.y + 22} textAnchor="middle" className="fill-muted-foreground text-[9px]">{name}</text>)}
            {list.map((p) => {
              const k = p.location; const i = (seen[k] = (seen[k] ?? -1) + 1);
              const x = p.map.x + (i % 3) * 9 - 9 * Math.min(i, 1); const y = p.map.y - Math.floor(i / 3) * 9;
              return (
                <g key={p.id} onClick={() => setSel(p.id)} className="cursor-pointer">
                  {p.type === "Building" ? <rect x={x - 5} y={y - 5} width="10" height="10" rx="1.5" className={cn(pinCls[statusTone(p.status)], "stroke-card")} strokeWidth="1.5" /> : <circle cx={x} cy={y} r="5.5" className={cn(pinCls[statusTone(p.status)], "stroke-card")} strokeWidth="1.5" />}
                  {sel === p.id && <circle cx={x} cy={y} r="10" className="fill-none stroke-info" strokeWidth="1.5" />}
                  <title>{p.id} — {p.name}</title>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 flex flex-wrap gap-4 px-2 text-xs text-muted-foreground">
            <span>● Road &nbsp; ■ Building</span>
            {[["success", "Operational"], ["navy", "Under Execution"], ["warning", "Review / Maintenance"], ["danger", "Critical / Decommissioning"]].map(([t, l]) => <span key={l} className="inline-flex items-center gap-1.5"><svg width="10" height="10"><circle cx="5" cy="5" r="5" className={pinCls[t ?? "neutral"]} /></svg>{l}</span>)}
          </div>
        </div>
        <div className="space-y-4">
          {current && (
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <p className="font-mono text-xs text-info">{current.id}</p>
              <p className="mt-1 flex items-center gap-2 font-semibold text-primary"><AssetIcon type={current.type} />{current.name}</p>
              <p className="text-xs text-muted-foreground">{current.address}, {current.location}</p>
              <div className="mt-3 flex items-center justify-between"><StatusBadge status={current.status} /><span className="text-sm font-medium">{fmtCr(current.budget ?? current.estimatedCost)}</span></div>
              <ProgressBar value={current.progress} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">Condition: {current.condition}</p>
              <Link to="/projects/$projectId" params={{ projectId: current.id }} className="mt-3 inline-block text-sm font-semibold text-primary hover:text-info">View Project →</Link>
            </div>
          )}
          <div className="max-h-[420px] divide-y overflow-y-auto rounded-lg border bg-card">
            {list.map((p) => (
              <button key={p.id} onClick={() => setSel(p.id)} className={cn("flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-accent/60", sel === p.id && "bg-accent")}>
                <span className="min-w-0"><span className="block font-mono text-[11px] text-info">{p.id}</span><span className="block truncate text-sm">{p.name}</span></span>
                <span className="text-xs text-muted-foreground">{p.location}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
