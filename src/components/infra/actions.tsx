import { CONTRACTORS, ENGINEERS, LOCATIONS, today, addDays } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Project, CitizenRequest, Decommission } from "@/lib/types";
import { useFormDialog } from "./FormDialog";
import { RoleButton } from "./ui-bits";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function ProjectActions({ p }: { p: Project }) {
  const { actions } = useStore();
  const [dialog, open] = useFormDialog();
  let content: React.ReactNode = null;

  switch (p.status) {
    case "Engineer Review":
      content = (
        <>
          <RoleButton roles={["Engineer"]} onClick={() => open({ title: "Approve project", description: `${p.id} · ${p.name}`, fields: [{ name: "remarks", label: "Technical remarks", type: "textarea", placeholder: "Feasibility, estimate notes…" }], submitLabel: "Approve", onSubmit: (v) => actions.engineerDecision(p.id, true, v.remarks) })}>Approve</RoleButton>
          <RoleButton roles={["Engineer"]} variant="outline" onClick={() => open({ title: "Reject project", description: `${p.id} · ${p.name}`, destructive: true, fields: [{ name: "reason", label: "Rejection reason", type: "textarea", required: true }], submitLabel: "Reject", onSubmit: (v) => actions.engineerDecision(p.id, false, v.reason) })}>Reject</RoleButton>
        </>
      );
      break;
    case "Approved":
      content = !p.budget ? (
        <RoleButton roles={["Government Official"]} onClick={() => open({ title: "Record finalised budget", description: `Estimated cost ₹${p.estimatedCost} Cr. Enter the budget sanctioned offline.`, fields: [{ name: "budget", label: "Approved budget (₹ Cr)", type: "number", required: true, min: 0.01, max: 10000, defaultValue: String(p.estimatedCost) }], submitLabel: "Record budget", onSubmit: (v) => actions.recordBudget(p.id, Number(v.budget)) })}>Record Budget</RoleButton>
      ) : (
        <RoleButton roles={["Engineer", "Government Official"]} onClick={() => open({ title: "Assign contractor", description: `${p.id} · Budget ₹${p.budget} Cr`, fields: [{ name: "contractor", label: "Contractor", type: "select", options: CONTRACTORS, required: true }], submitLabel: "Assign", onSubmit: (v) => actions.assignContractor(p.id, v.contractor) })}>Assign Contractor</RoleButton>
      );
      break;
    case "Contractor Pending":
      content = (
        <>
          <RoleButton roles={["Contractor"]} onClick={() => actions.contractorDecision(p.id, true)}>Accept Project</RoleButton>
          <RoleButton roles={["Contractor"]} variant="outline" onClick={() => open({ title: "Reject project", destructive: true, fields: [{ name: "reason", label: "Rejection reason", type: "textarea", required: true }], submitLabel: "Reject", onSubmit: (v) => actions.contractorDecision(p.id, false, v.reason) })}>Reject</RoleButton>
        </>
      );
      break;
    case "Under Execution":
      content = (
        <>
          <RoleButton roles={["Contractor"]} variant="outline" onClick={() => open({ title: "Update progress", description: `Currently ${p.progress}% complete`, fields: [{ name: "progress", label: "Progress (%)", type: "number", required: true, min: 0, max: 100, defaultValue: String(Math.min(100, p.progress + 10)) }, { name: "remarks", label: "Work details", type: "textarea" }], submitLabel: "Update", onSubmit: (v) => actions.updateProgress(p.id, Number(v.progress), v.remarks) })}>Update Progress</RoleButton>
          <RoleButton roles={["Contractor"]} onClick={() => open({ title: "Submit completion request", fields: [{ name: "finalCost", label: "Final cost (₹ Cr)", type: "number", required: true, min: 0.01, defaultValue: String(p.budget ?? p.estimatedCost) }, { name: "remarks", label: "Work completed / remarks", type: "textarea", required: true }, { name: "docs", label: "Completion documents & photos", placeholder: "e.g. completion-certificate.pdf, site-photos.zip" }], submitLabel: "Submit", onSubmit: (v) => actions.submitCompletion(p.id, Number(v.finalCost), v.remarks) })}>Submit Completion</RoleButton>
        </>
      );
      break;
    case "Completion Submitted":
      content = (
        <>
          <RoleButton roles={["Engineer", "Government Official"]} onClick={() => open({ title: "Verify completion", description: "Project will be marked Completed and the asset Operational.", fields: [{ name: "remarks", label: "Inspection remarks", type: "textarea" }], submitLabel: "Verify & Complete", onSubmit: (v) => actions.verifyCompletion(p.id, true, v.remarks) })}>Verify Completion</RoleButton>
          <RoleButton roles={["Engineer", "Government Official"]} variant="outline" onClick={() => open({ title: "Return completion", destructive: true, fields: [{ name: "reason", label: "Deficiencies found", type: "textarea", required: true }], submitLabel: "Return", onSubmit: (v) => actions.verifyCompletion(p.id, false, v.reason) })}>Return</RoleButton>
        </>
      );
      break;
  }
  if (!content) return null;
  return <div className="flex flex-wrap gap-2">{content}{dialog}</div>;
}

export function RequestActions({ r }: { r: CitizenRequest }) {
  const { actions } = useStore();
  const [dialog, open] = useFormDialog();
  let content: React.ReactNode = null;
  switch (r.stage) {
    case "Pending Verification":
      content = (
        <>
          <RoleButton roles={["Government Official"]} onClick={() => actions.verifyRequest(r.id, true)}>Verify & Send to Engineer</RoleButton>
          <RoleButton roles={["Government Official"]} variant="outline" onClick={() => open({ title: "Reject request", destructive: true, fields: [{ name: "reason", label: "Reason", type: "textarea", required: true }], submitLabel: "Reject", onSubmit: (v) => actions.verifyRequest(r.id, false, v.reason) })}>Reject</RoleButton>
        </>
      );
      break;
    case "Engineer Assessment":
      content = (
        <RoleButton roles={["Engineer"]} onClick={() => open({ title: "Engineer assessment", description: `${r.id} · ${r.category}`, fields: [
          { name: "outcome", label: "Outcome", type: "select", required: true, options: ["Maintenance Required", "Rehabilitation Required", "No Maintenance Required", "Beyond Repair"] },
          { name: "cost", label: "Estimated cost (₹ Cr)", type: "number", min: 0 },
          { name: "remarks", label: "Assessment remarks", type: "textarea", required: true },
        ], submitLabel: "Record assessment", onSubmit: (v) => actions.assessRequest(r.id, v.outcome as never, v.remarks, v.cost ? Number(v.cost) : undefined) })}>Assess Issue</RoleButton>
      );
      break;
    case "Maintenance Approved":
      content = <RoleButton roles={["Engineer", "Government Official"]} onClick={() => open({ title: "Assign maintenance contractor", fields: [{ name: "contractor", label: "Contractor", type: "select", options: CONTRACTORS, required: true }], submitLabel: "Assign", onSubmit: (v) => actions.assignMaintContractor(r.id, v.contractor) })}>Assign Contractor</RoleButton>;
      break;
    case "Contractor Pending":
      content = (
        <>
          <RoleButton roles={["Contractor"]} onClick={() => actions.maintContractorDecision(r.id, true)}>Accept</RoleButton>
          <RoleButton roles={["Contractor"]} variant="outline" onClick={() => open({ title: "Reject maintenance work", destructive: true, fields: [{ name: "reason", label: "Reason", type: "textarea", required: true }], submitLabel: "Reject", onSubmit: (v) => actions.maintContractorDecision(r.id, false, v.reason) })}>Reject</RoleButton>
        </>
      );
      break;
    case "Under Maintenance":
      content = (
        <>
          <RoleButton roles={["Contractor"]} variant="outline" onClick={() => open({ title: "Update maintenance progress", fields: [{ name: "progress", label: "Progress (%)", type: "number", required: true, min: 0, max: 100, defaultValue: String(Math.min(100, r.progress + 20)) }], submitLabel: "Update", onSubmit: (v) => actions.updateMaintProgress(r.id, Number(v.progress)) })}>Update Progress</RoleButton>
          <RoleButton roles={["Contractor"]} onClick={() => open({ title: "Submit maintenance completion", fields: [{ name: "remarks", label: "Work details", type: "textarea", required: true }, { name: "docs", label: "Photos / documents", placeholder: "after-photos.zip" }], submitLabel: "Submit", onSubmit: (v) => actions.submitMaintCompletion(r.id, v.remarks) })}>Submit Completion</RoleButton>
        </>
      );
      break;
    case "Completion Submitted":
      content = <RoleButton roles={["Government Official", "Engineer"]} onClick={() => actions.verifyMaintCompletion(r.id)}>Verify & Close</RoleButton>;
      break;
  }
  if (!content) return null;
  return <div className="flex flex-wrap gap-2">{content}{dialog}</div>;
}

export function DecommActions({ d }: { d: Decommission }) {
  const { actions } = useStore();
  const [dialog, open] = useFormDialog();
  let content: React.ReactNode = null;
  switch (d.stage) {
    case "Government Review":
      content = (
        <>
          <RoleButton roles={["Government Official"]} onClick={() => open({ title: "Approve decommissioning", fields: [{ name: "remarks", label: "Government order / remarks", type: "textarea", required: true }], submitLabel: "Approve", onSubmit: (v) => actions.decommDecision(d.id, true, v.remarks) })}>Approve Decommissioning</RoleButton>
          <RoleButton roles={["Government Official"]} variant="outline" onClick={() => open({ title: "Reject recommendation", description: "Asset will be sent for rehabilitation instead.", destructive: true, fields: [{ name: "remarks", label: "Reason", type: "textarea", required: true }], submitLabel: "Reject", onSubmit: (v) => actions.decommDecision(d.id, false, v.remarks) })}>Reject</RoleButton>
        </>
      );
      break;
    case "Decommissioning Approved":
      content = <RoleButton roles={["Government Official", "Engineer"]} onClick={() => open({ title: "Start decommissioning / demolition", fields: [{ name: "contractor", label: "Contractor", type: "select", options: CONTRACTORS, required: true }], submitLabel: "Start works", onSubmit: (v) => actions.startDemolition(d.id, v.contractor) })}>Assign & Start Works</RoleButton>;
      break;
    case "Under Demolition":
      content = <RoleButton roles={["Contractor"]} onClick={() => actions.completeDemolition(d.id)}>Mark Decommissioned</RoleButton>;
      break;
    case "Decommissioned":
      content = <RoleButton roles={["Government Official"]} onClick={() => open({ title: "Record disposal / replacement", fields: [{ name: "outcome", label: "Outcome", type: "textarea", required: true, placeholder: "e.g. Site allotted for new building / road reconstructed on new alignment" }], submitLabel: "Mark Disposed", onSubmit: (v) => actions.dispose(d.id, v.outcome) })}>Mark Disposed / Replaced</RoleButton>;
      break;
  }
  if (!content) return null;
  return <div className="flex flex-wrap gap-2">{content}{dialog}</div>;
}

export function CreateProjectButton() {
  const { actions, role } = useStore();
  const navigate = useNavigate();
  const [dialog, open] = useFormDialog();
  if (role !== "Government Official") return null;
  return (
    <>
      <Button size="sm" className="gap-1.5" onClick={() => open({
        title: "Create project request",
        description: "The request will be sent to the selected engineer / firm for technical review.",
        submitLabel: "Submit request",
        fields: [
          { name: "name", label: "Project name", required: true, maxLength: 120 },
          { name: "type", label: "Asset type", type: "select", options: ["Building", "Road"], required: true, half: true },
          { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"], required: true, half: true, defaultValue: "Medium" },
          { name: "location", label: "District", type: "select", options: Object.keys(LOCATIONS), required: true, half: true },
          { name: "address", label: "Site address", required: true, half: true, maxLength: 160 },
          { name: "engineer", label: "Engineer / firm", type: "select", options: ENGINEERS, required: true },
          { name: "estimatedCost", label: "Estimated cost (₹ Cr)", type: "number", required: true, min: 0.01, max: 10000, half: true },
          { name: "expectedEnd", label: "Target completion", type: "date", required: true, half: true, defaultValue: addDays(today(), 365) },
          { name: "scale", label: "Scale (length / area)", placeholder: "e.g. 4.2 km or 6,000 sq m", maxLength: 80 },
          { name: "description", label: "Scope description", type: "textarea", required: true, maxLength: 600 },
        ],
        onSubmit: (v) => {
          const id = actions.createProject({ name: v.name, type: v.type as "Road" | "Building", priority: v.priority as "Medium", location: v.location, address: v.address, engineer: v.engineer, estimatedCost: Number(v.estimatedCost), expectedEnd: v.expectedEnd, scale: v.scale || "—", description: v.description });
          setTimeout(() => navigate({ to: "/projects/$projectId", params: { projectId: id } }), 0);
        },
      })}>
        <Plus className="h-4 w-4" /> Create Project
      </Button>
      {dialog}
    </>
  );
}

export function ReportIssueButton({ defaultProjectId }: { defaultProjectId?: string }) {
  const { actions, projects } = useStore();
  const [dialog, open] = useFormDialog();
  const assets = projects.filter((p) => ["Operational", "Maintenance", "Rehabilitation", "Under Execution"].includes(p.status));
  const label = (p: Project) => `${p.id} — ${p.name}`;
  return (
    <>
      <RoleButton roles={["Citizen", "Government Official"]} onClick={() => open({
        title: "Report infrastructure issue",
        description: "Your request will be verified by the R&B department.",
        submitLabel: "Submit report",
        fields: [
          { name: "asset", label: "Road / building", type: "select", options: assets.map(label), required: true, defaultValue: defaultProjectId && assets[0] ? label(assets.find((a) => a.id === defaultProjectId) ?? assets[0]) : "" },
          { name: "category", label: "Issue type", type: "select", options: ["Potholes", "Broken road", "Damaged building", "Structural issue", "Water leakage", "Other"], required: true, half: true },
          { name: "priority", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"], required: true, half: true, defaultValue: "Medium" },
          { name: "description", label: "Describe the issue", type: "textarea", required: true, maxLength: 600 },
          { name: "citizen", label: "Your name", required: true, half: true, maxLength: 80 },
          { name: "contact", label: "Phone / email", required: true, half: true, maxLength: 80 },
          { name: "photos", label: "Photos", placeholder: "Photo file names (optional)" },
        ],
        onSubmit: (v) => actions.submitRequest({ projectId: v.asset.split(" — ")[0] ?? "", category: v.category, priority: v.priority as "Medium", description: v.description, citizen: v.citizen, contact: v.contact }),
      })}>
        <Megaphone className="mr-1.5 h-4 w-4" /> Report Issue
      </RoleButton>
      {dialog}
    </>
  );
}
