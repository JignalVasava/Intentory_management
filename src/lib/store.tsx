import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Project, CitizenRequest, Decommission, AppNotification, Activity, Role, TimelineEvent, Track, AssetType, Priority } from "./types";
import { seedProjects, seedRequests, seedDecomm, seedNotifications, seedActivity } from "./mock-data";
import { today, LOCATIONS } from "./format";

interface State {
  projects: Project[];
  requests: CitizenRequest[];
  decomm: Decommission[];
  notifications: AppNotification[];
  activity: Activity[];
}

export const ROLE_ACTOR: Record<Role, string> = {
  "Government Official": "R&B Division Office",
  Engineer: "Engineer / Firm",
  Contractor: "Contractor",
  Citizen: "Citizen",
};

function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 9)}`;
}

function useStoreValue() {
  const [state, setState] = useState<State>(() => ({
    projects: seedProjects(),
    requests: seedRequests(),
    decomm: seedDecomm(),
    notifications: seedNotifications(),
    activity: seedActivity(),
  }));
  const [role, setRole] = useState<Role>("Government Official");

  const mutate = useCallback((fn: (s: State) => void) => {
    setState((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  // helpers operating on a draft
  const log = (s: State, projectId: string, title: string, by: string, opts: { remarks?: string; status?: TimelineEvent["status"]; track?: Track; notify?: boolean } = {}) => {
    const p = s.projects.find((x) => x.id === projectId);
    const date = today();
    if (p) p.timeline.push({ id: uid("ev"), date, title, by, remarks: opts.remarks, status: opts.status ?? "done", track: opts.track ?? "execution" });
    s.activity.unshift({ id: uid("ac"), date, text: title, projectId, actor: by });
    if (opts.notify !== false) s.notifications.unshift({ id: uid("nt"), date, title, body: `${projectId}${p ? " · " + p.name : ""}${opts.remarks ? " — " + opts.remarks : ""}`, read: false, projectId });
  };
  const proj = (s: State, id: string) => s.projects.find((p) => p.id === id)!;
  const req = (s: State, id: string) => s.requests.find((r) => r.id === id)!;
  const dec = (s: State, id: string) => s.decomm.find((d) => d.id === id)!;

  const actions = {
    // ---------- Project Execution ----------
    createProject(input: { name: string; type: AssetType; location: string; address: string; engineer: string; estimatedCost: number; expectedEnd: string; priority: Priority; description: string; scale: string }) {
      let newId = "";
      mutate((s) => {
        const year = today().slice(0, 4);
        const count = s.projects.filter((p) => p.id.startsWith(`RAB-${year}`)).length + 1;
        newId = `RAB-${year}-${String(count).padStart(3, "0")}`;
        while (s.projects.some((p) => p.id === newId)) newId = `RAB-${year}-${String(Math.floor(Math.random() * 900) + 100)}`;
        s.projects.unshift({ ...input, id: newId, requestedDate: today(), status: "Engineer Review", progress: 0, condition: "N/A", map: LOCATIONS[input.location] ?? { x: 300, y: 250 }, timeline: [] });
        log(s, newId, "Project Request Submitted", ROLE_ACTOR["Government Official"], { remarks: `Sent to ${input.engineer} for review.` });
      });
      toast.success("Project request created", { description: "Sent to the engineering firm for review." });
      return newId;
    },
    engineerDecision(id: string, approve: boolean, reason?: string) {
      mutate((s) => {
        const p = proj(s, id);
        if (approve) {
          p.status = "Approved";
          log(s, id, "Engineer Review — Approved", p.engineer, { remarks: reason || "Technically feasible." });
        } else {
          p.status = "Rejected";
          p.rejectionReason = reason;
          log(s, id, "Engineer Review — Rejected", p.engineer, { remarks: reason, status: "rejected" });
        }
      });
      toast.success(approve ? "Project approved" : "Project rejected");
    },
    recordBudget(id: string, budget: number) {
      mutate((s) => {
        proj(s, id).budget = budget;
        log(s, id, "Budget Recorded", "R&B Finance Section", { remarks: `Finalised budget ₹${budget} Cr.` });
      });
      toast.success("Budget recorded");
    },
    assignContractor(id: string, contractor: string) {
      mutate((s) => {
        const p = proj(s, id);
        p.contractor = contractor;
        p.status = "Contractor Pending";
        log(s, id, "Contractor Assigned", p.engineer, { remarks: `Work order issued to ${contractor}.` });
      });
      toast.success("Contractor assigned", { description: "Awaiting contractor acceptance." });
    },
    contractorDecision(id: string, accept: boolean, reason?: string) {
      mutate((s) => {
        const p = proj(s, id);
        if (accept) {
          p.status = "Under Execution";
          p.startDate = today();
          p.progress = 0;
          log(s, id, "Contractor Accepted", p.contractor!, { remarks: "Work order accepted." });
          log(s, id, "Project Execution Started", p.contractor!, { notify: false });
        } else {
          log(s, id, "Contractor Rejected", p.contractor!, { remarks: reason, status: "rejected" });
          p.contractor = undefined;
          p.status = "Approved";
        }
      });
      toast.success(accept ? "Project accepted — execution started" : "Contractor declined; reassignment needed");
    },
    updateProgress(id: string, progress: number, remarks?: string) {
      mutate((s) => {
        const p = proj(s, id);
        p.progress = Math.min(100, Math.max(0, progress));
        log(s, id, `Progress Updated — ${p.progress}%`, p.contractor ?? "Contractor", { remarks, status: "info", notify: false });
      });
      toast.success(`Progress updated to ${progress}%`);
    },
    submitCompletion(id: string, finalCost: number, remarks: string) {
      mutate((s) => {
        const p = proj(s, id);
        p.progress = 100;
        p.finalCost = finalCost;
        p.status = "Completion Submitted";
        log(s, id, "Completion Request Submitted", p.contractor!, { remarks: `Final cost ₹${finalCost} Cr. ${remarks}` });
      });
      toast.success("Completion request submitted", { description: "Awaiting verification." });
    },
    verifyCompletion(id: string, approve: boolean, remarks?: string) {
      mutate((s) => {
        const p = proj(s, id);
        if (approve) {
          p.finishedDate = today();
          p.status = "Operational";
          p.condition = "New";
          log(s, id, "Completion Verified — Completed", p.engineer, { remarks: remarks || "Completion certificate issued." });
          log(s, id, "Asset Operational", ROLE_ACTOR["Government Official"], { notify: false });
        } else {
          p.status = "Under Execution";
          p.progress = 90;
          log(s, id, "Completion Returned", p.engineer, { remarks, status: "rejected" });
        }
      });
      toast.success(approve ? "Project completed — asset is now Operational" : "Completion returned to contractor");
    },

    // ---------- Maintenance ----------
    submitRequest(input: { projectId: string; category: string; description: string; citizen: string; contact: string; priority: Priority }) {
      let id = "";
      mutate((s) => {
        id = `CR-${today().slice(0, 4)}-${100 + s.requests.length + 1}`;
        s.requests.unshift({ ...input, id, date: today(), stage: "Pending Verification", progress: 0 });
        log(s, input.projectId, "Citizen Request Received", `Citizen — ${input.citizen}`, { remarks: `${input.category}: ${input.description} (${id})`, status: "info", track: "maintenance" });
      });
      toast.success("Issue reported", { description: "Pending government verification." });
      return id;
    },
    verifyRequest(id: string, ok: boolean, reason?: string) {
      mutate((s) => {
        const r = req(s, id);
        r.stage = ok ? "Engineer Assessment" : "Rejected";
        r.remarks = reason;
        log(s, r.projectId, ok ? "Government Verification — Verified" : "Government Verification — Rejected", ROLE_ACTOR["Government Official"], { remarks: ok ? `Sent to engineer (${id}).` : reason, status: ok ? "done" : "rejected", track: "maintenance" });
      });
      toast.success(ok ? "Issue verified and sent to engineer" : "Request rejected");
    },
    assessRequest(id: string, outcome: "Maintenance Required" | "Rehabilitation Required" | "No Maintenance Required" | "Beyond Repair", remarks: string, estimatedCost?: number) {
      mutate((s) => {
        const r = req(s, id);
        const p = proj(s, r.projectId);
        r.remarks = remarks;
        if (outcome === "No Maintenance Required") {
          r.stage = "No Maintenance Required";
          log(s, p.id, "Engineer Assessment — No Maintenance Required", p.engineer, { remarks, track: "maintenance" });
        } else if (outcome === "Beyond Repair") {
          r.stage = "Beyond Repair";
          p.status = "Decommissioning";
          p.condition = "Critical";
          const decId = `DEC-${today().slice(0, 4)}-${String(s.decomm.length + 1).padStart(3, "0")}`;
          s.decomm.unshift({ id: decId, projectId: p.id, requestId: id, reason: `${r.category}: ${r.description}`, assessment: remarks, estimatedCost: estimatedCost ?? 0, stage: "Government Review", createdDate: today(), documents: ["Engineer Assessment Report.pdf"] });
          log(s, p.id, "Engineer Assessment — Beyond Repair", p.engineer, { remarks, status: "rejected", track: "maintenance" });
          log(s, p.id, "Decommissioning Recommended", p.engineer, { remarks: `Sent for government review (${decId}).`, status: "warning", track: "decommissioning" });
        } else {
          r.stage = "Maintenance Approved";
          r.workType = outcome === "Rehabilitation Required" ? "Rehabilitation" : "Maintenance";
          r.estimatedCost = estimatedCost;
          p.status = r.workType;
          p.condition = "Poor";
          log(s, p.id, `Engineer Assessment — ${outcome}`, p.engineer, { remarks, track: "maintenance" });
          log(s, p.id, `${r.workType} Approved`, ROLE_ACTOR["Government Official"], { track: "maintenance", notify: false });
        }
      });
      toast.success(`Assessment recorded: ${outcome}`);
    },
    assignMaintContractor(id: string, contractor: string) {
      mutate((s) => {
        const r = req(s, id);
        r.contractor = contractor;
        r.stage = "Contractor Pending";
        log(s, r.projectId, "Maintenance Contractor Assigned", ROLE_ACTOR.Engineer, { remarks: `${contractor} (${id})`, track: "maintenance" });
      });
      toast.success("Contractor assigned");
    },
    maintContractorDecision(id: string, accept: boolean, reason?: string) {
      mutate((s) => {
        const r = req(s, id);
        if (accept) {
          r.stage = "Under Maintenance";
          r.progress = 0;
          log(s, r.projectId, "Contractor Accepted — Maintenance Execution Started", r.contractor!, { track: "maintenance" });
        } else {
          log(s, r.projectId, "Maintenance Contractor Rejected", r.contractor!, { remarks: reason, status: "rejected", track: "maintenance" });
          r.contractor = undefined;
          r.stage = "Maintenance Approved";
        }
      });
      toast.success(accept ? "Maintenance work started" : "Contractor declined");
    },
    updateMaintProgress(id: string, progress: number) {
      mutate((s) => {
        const r = req(s, id);
        r.progress = Math.min(100, Math.max(0, progress));
        log(s, r.projectId, `Maintenance Progress — ${r.progress}%`, r.contractor ?? "Contractor", { status: "info", track: "maintenance", notify: false });
      });
      toast.success(`Progress updated to ${progress}%`);
    },
    submitMaintCompletion(id: string, remarks: string) {
      mutate((s) => {
        const r = req(s, id);
        r.progress = 100;
        r.stage = "Completion Submitted";
        log(s, r.projectId, "Maintenance Completion Submitted", r.contractor!, { remarks, track: "maintenance" });
      });
      toast.success("Completion submitted for verification");
    },
    verifyMaintCompletion(id: string) {
      mutate((s) => {
        const r = req(s, id);
        const p = proj(s, r.projectId);
        r.stage = "Resolved";
        p.status = "Operational";
        p.condition = "Good";
        log(s, p.id, "Maintenance Verified — Asset Operational", ROLE_ACTOR["Government Official"], { remarks: `${id} closed.`, track: "maintenance" });
      });
      toast.success("Maintenance verified — asset back to Operational");
    },

    // ---------- Decommissioning ----------
    decommDecision(id: string, approve: boolean, remarks: string) {
      mutate((s) => {
        const d = dec(s, id);
        const p = proj(s, d.projectId);
        d.decision = remarks;
        if (approve) {
          d.stage = "Decommissioning Approved";
          log(s, p.id, "Decommissioning Approved", ROLE_ACTOR["Government Official"], { remarks, track: "decommissioning" });
        } else {
          d.stage = "Rejected";
          p.status = "Rehabilitation";
          log(s, p.id, "Decommissioning Rejected — Rehabilitation Ordered", ROLE_ACTOR["Government Official"], { remarks, status: "rejected", track: "decommissioning" });
        }
      });
      toast.success(approve ? "Decommissioning approved" : "Recommendation rejected");
    },
    startDemolition(id: string, contractor: string) {
      mutate((s) => {
        const d = dec(s, id);
        d.contractor = contractor;
        d.stage = "Under Demolition";
        log(s, d.projectId, "Decommissioning Works Started", contractor, { track: "decommissioning" });
      });
      toast.success("Decommissioning works started");
    },
    completeDemolition(id: string) {
      mutate((s) => {
        const d = dec(s, id);
        d.stage = "Decommissioned";
        d.documents.push("Decommissioning Completion Certificate.pdf");
        log(s, d.projectId, "Asset Decommissioned", d.contractor ?? "Contractor", { track: "decommissioning" });
      });
      toast.success("Asset decommissioned");
    },
    dispose(id: string, outcome: string) {
      mutate((s) => {
        const d = dec(s, id);
        d.stage = "Disposed / Replaced";
        d.outcome = outcome;
        d.completionDate = today();
        const p = proj(s, d.projectId);
        p.status = "Disposed";
        p.condition = "N/A";
        log(s, p.id, "Disposed / Replaced", ROLE_ACTOR["Government Official"], { remarks: outcome, track: "decommissioning" });
      });
      toast.success("Asset marked Disposed / Replaced");
    },

    markRead(id?: string) {
      mutate((s) => s.notifications.forEach((n) => { if (!id || n.id === id) n.read = true; }));
    },
  };

  return { ...state, role, setRole, actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  const memo = useMemo(() => value, [value]);
  return <Ctx.Provider value={memo}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
