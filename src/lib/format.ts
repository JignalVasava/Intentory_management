import type { AssetType, ProjectStatus, Project } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(iso?: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

export function fmtCr(v?: number) {
  if (v === undefined || v === null || Number.isNaN(v)) return "—";
  return `₹${v.toFixed(v < 10 ? 2 : 1).replace(/\.?0+$/, "")} Cr`;
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export type Phase =
  | "Project Execution"
  | "Operational"
  | "Maintenance & Rehabilitation"
  | "Decommissioning / Disposal";

export function phaseOf(status: ProjectStatus): Phase {
  switch (status) {
    case "Completed":
    case "Operational":
      return "Operational";
    case "Maintenance":
    case "Rehabilitation":
      return "Maintenance & Rehabilitation";
    case "Decommissioning":
    case "Disposed":
      return "Decommissioning / Disposal";
    default:
      return "Project Execution";
  }
}

export type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "navy";

export function statusTone(status: string): Tone {
  const map: Record<string, Tone> = {
    Proposed: "neutral",
    "Engineer Review": "warning",
    "Pending Verification": "warning",
    "Engineer Assessment": "warning",
    "Government Review": "warning",
    "Contractor Pending": "warning",
    "Completion Submitted": "info",
    Approved: "info",
    "Maintenance Approved": "info",
    "Decommissioning Approved": "info",
    "Contractor Accepted": "info",
    "Under Execution": "navy",
    "Under Maintenance": "navy",
    "Under Demolition": "navy",
    Completed: "success",
    Operational: "success",
    Resolved: "success",
    "No Maintenance Required": "neutral",
    Maintenance: "warning",
    Rehabilitation: "warning",
    Decommissioning: "danger",
    Decommissioned: "danger",
    "Beyond Repair": "danger",
    Disposed: "neutral",
    "Disposed / Replaced": "neutral",
    Rejected: "danger",
    Critical: "danger",
    High: "warning",
    Medium: "info",
    Low: "neutral",
  };
  return map[status] ?? "neutral";
}

export function milestonesFor(type: AssetType) {
  return type === "Building"
    ? ["Foundation", "Structural Work", "Electrical & Plumbing", "Finishing & Handover"]
    : ["Earthwork & Sub-base", "Base Course (WMM)", "Bituminous Surfacing", "Markings & Signage"];
}

export function milestoneState(progress: number, index: number) {
  const hi = (index + 1) * 25;
  const lo = index * 25;
  if (progress >= hi) return "Completed" as const;
  if (progress > lo) return "In Progress" as const;
  return "Pending" as const;
}

export function isActive(p: Project) {
  return ["Approved", "Contractor Pending", "Contractor Accepted", "Under Execution", "Completion Submitted", "Maintenance", "Rehabilitation"].includes(p.status);
}

export const ENGINEERS = [
  "ABC Engineering Consultants",
  "Shah & Associates Structural",
  "Gujarat Infra Design Pvt Ltd",
  "Metro Roads Consultancy",
];
export const CONTRACTORS = [
  "XYZ Construction Co.",
  "Patel Infracon Ltd",
  "Narmada Builders",
  "Saurashtra Roadways Pvt Ltd",
  "Deccan Civil Works",
];
export const LOCATIONS: Record<string, { x: number; y: number }> = {
  Ahmedabad: { x: 352, y: 214 },
  Gandhinagar: { x: 362, y: 188 },
  Surat: { x: 372, y: 372 },
  Vadodara: { x: 410, y: 262 },
  Rajkot: { x: 212, y: 276 },
  Bhavnagar: { x: 300, y: 318 },
  Jamnagar: { x: 150, y: 246 },
  Junagadh: { x: 186, y: 334 },
  Anand: { x: 384, y: 246 },
  Mehsana: { x: 350, y: 150 },
};
