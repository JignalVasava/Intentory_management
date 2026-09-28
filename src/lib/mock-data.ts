import type { Project, CitizenRequest, Decommission, AppNotification, Activity, TimelineEvent, Track } from "./types";
import { addDays, LOCATIONS } from "./format";

let n = 0;
function ev(date: string, title: string, by: string, remarks?: string, status: TimelineEvent["status"] = "done", track: Track = "execution"): TimelineEvent {
  n += 1;
  return { id: `ev-${n}`, date, title, by, remarks, status, track };
}

const DEPT = "R&B Division Office";
const FIN = "R&B Finance Section";

function execHistory(p: { requestedDate: string; engineer: string; contractor?: string; finishedDate?: string }, upto: number): TimelineEvent[] {
  const d = p.requestedDate;
  const steps: TimelineEvent[] = [
    ev(d, "Project Request Submitted", DEPT, "Request raised and forwarded to engineering firm for technical review."),
    ev(addDays(d, 12), "Engineer Review — Approved", p.engineer, "Technical feasibility confirmed; detailed estimate submitted."),
    ev(addDays(d, 22), "Budget Recorded", FIN, "Finalised budget sanctioned and recorded in the portal."),
    ev(addDays(d, 28), "Contractor Assigned", p.engineer, `Work order issued to ${p.contractor ?? "contractor"}.`),
    ev(addDays(d, 32), "Contractor Accepted", p.contractor ?? "Contractor", "Work order accepted; mobilisation started."),
    ev(addDays(d, 38), "Project Execution Started", p.contractor ?? "Contractor", "Site handed over and execution commenced."),
    ev(p.finishedDate ?? addDays(d, 300), "Completion Verified", p.engineer, "Final inspection passed; completion certificate issued."),
    ev(p.finishedDate ?? addDays(d, 300), "Asset Operational", DEPT, "Asset handed over and placed in service."),
  ];
  return steps.slice(0, upto);
}

type Base = Omit<Project, "timeline" | "map">;
function mk(b: Base, upto: number, extra: TimelineEvent[] = []): Project {
  return { ...b, map: LOCATIONS[b.location] ?? { x: 300, y: 250 }, timeline: [...execHistory(b, upto), ...extra] };
}

export function seedProjects(): Project[] {
  n = 0;
  return [
    mk({ id: "RAB-2026-001", name: "Riverfront Government Building", type: "Building", location: "Ahmedabad", address: "Sabarmati Riverfront, Ellisbridge", engineer: "ABC Engineering Consultants", contractor: "XYZ Construction Co.", budget: 12.5, estimatedCost: 12.1, requestedDate: "2025-12-02", startDate: "2026-01-12", expectedEnd: "2026-12-31", status: "Under Execution", progress: 68, priority: "High", condition: "N/A", description: "G+6 administrative building to consolidate district-level government offices along the Sabarmati Riverfront.", scale: "18,400 sq m built-up" }, 6),
    mk({ id: "RAB-2026-002", name: "SG Highway Service Road Widening", type: "Road", location: "Ahmedabad", address: "Sarkhej–Gandhinagar Highway, Thaltej to Sola", engineer: "Metro Roads Consultancy", contractor: "Patel Infracon Ltd", budget: 8.2, estimatedCost: 8.0, requestedDate: "2026-01-05", startDate: "2026-02-20", expectedEnd: "2026-11-15", status: "Under Execution", progress: 42, priority: "Medium", condition: "N/A", description: "Widening of service roads from 7 m to 10.5 m with storm-water drainage and footpaths.", scale: "6.4 km, 4-lane" }, 6),
    mk({ id: "RAB-2026-006", name: "Govt. Polytechnic Hostel Block", type: "Building", location: "Mehsana", address: "Govt. Polytechnic Campus, Visnagar Road", engineer: "Shah & Associates Structural", contractor: "Narmada Builders", budget: 6.8, estimatedCost: 6.5, requestedDate: "2026-02-10", startDate: "2026-04-01", expectedEnd: "2027-03-31", status: "Under Execution", progress: 20, priority: "Medium", condition: "N/A", description: "200-bed student hostel with mess, reading hall and solar water heating.", scale: "7,200 sq m built-up" }, 6),
    mk({ id: "RAB-2026-003", name: "District Collectorate Annex", type: "Building", location: "Surat", address: "Athwa Lines, Surat", engineer: "Shah & Associates Structural", estimatedCost: 18.4, requestedDate: "2026-09-14", expectedEnd: "2028-03-31", status: "Engineer Review", progress: 0, priority: "High", condition: "N/A", description: "Annex building for Collectorate record room, e-governance centre and public facilitation hall.", scale: "22,000 sq m built-up" }, 1),
    mk({ id: "RAB-2026-004", name: "Vadodara–Halol State Highway Resurfacing", type: "Road", location: "Vadodara", address: "SH-87, Km 4 to Km 31", engineer: "Gujarat Infra Design Pvt Ltd", contractor: "Saurashtra Roadways Pvt Ltd", budget: 22.0, estimatedCost: 21.4, requestedDate: "2026-07-01", expectedEnd: "2027-05-30", status: "Contractor Pending", progress: 0, priority: "High", condition: "N/A", description: "Full-depth resurfacing with bituminous concrete, junction improvements and crash barriers.", scale: "27 km, 2-lane" }, 4),
    mk({ id: "RAB-2026-005", name: "Sector 21 Internal Roads", type: "Road", location: "Gandhinagar", address: "Sector 21, Gandhinagar", engineer: "Metro Roads Consultancy", estimatedCost: 4.6, requestedDate: "2026-08-18", expectedEnd: "2027-02-28", status: "Approved", progress: 0, priority: "Low", condition: "N/A", description: "Reconstruction of internal CC roads with paver-block footpaths and LED street lighting.", scale: "5.1 km" }, 2),
    mk({ id: "RAB-2025-014", name: "Civil Hospital OPD Block", type: "Building", location: "Rajkot", address: "Civil Hospital Campus, Jam Tower Road", engineer: "ABC Engineering Consultants", contractor: "Narmada Builders", budget: 15.2, estimatedCost: 14.8, finalCost: 15.0, requestedDate: "2024-10-10", startDate: "2024-12-01", expectedEnd: "2025-11-30", finishedDate: "2025-11-26", status: "Operational", progress: 100, priority: "Medium", condition: "Good", description: "Outpatient department block with 60 consultation rooms and diagnostic wing.", scale: "12,600 sq m built-up" }, 8,
      [ev("2026-03-02", "Maintenance — Broken Railing Resolved", "Deccan Civil Works", "Staircase railing replaced (CR-2026-106).", "done", "maintenance")]),
    mk({ id: "RAB-2024-022", name: "Surat Ring Road — Stretch 4", type: "Road", location: "Surat", address: "Outer Ring Road, Sarthana to Kadodara", engineer: "Metro Roads Consultancy", contractor: "Patel Infracon Ltd", budget: 31.0, estimatedCost: 30.2, finalCost: 30.8, requestedDate: "2023-06-01", startDate: "2023-08-15", expectedEnd: "2024-10-31", finishedDate: "2024-10-20", status: "Maintenance", progress: 100, priority: "High", condition: "Poor", description: "Six-lane ring road stretch with service lanes and two minor bridges.", scale: "9.8 km, 6-lane" }, 8,
      [
        ev("2026-08-04", "Citizen Request Received", "Citizen — Ramesh Desai", "Multiple potholes near Kadodara junction (CR-2026-101).", "info", "maintenance"),
        ev("2026-08-06", "Government Verification — Verified", DEPT, "Site visit confirmed 14 potholes over 600 m.", "done", "maintenance"),
        ev("2026-08-11", "Engineer Assessment — Maintenance Required", "Metro Roads Consultancy", "Patch repair and 40 mm BC overlay recommended.", "done", "maintenance"),
        ev("2026-08-14", "Contractor Assigned", "Metro Roads Consultancy", "Maintenance work order to Patel Infracon Ltd.", "done", "maintenance"),
        ev("2026-08-16", "Contractor Accepted", "Patel Infracon Ltd", undefined, "done", "maintenance"),
        ev("2026-08-20", "Maintenance Execution Started", "Patel Infracon Ltd", undefined, "done", "maintenance"),
      ]),
    mk({ id: "RAB-2023-011", name: "Taluka Panchayat Bhavan", type: "Building", location: "Bhavnagar", address: "Station Road, Bhavnagar", engineer: "Gujarat Infra Design Pvt Ltd", contractor: "XYZ Construction Co.", budget: 5.4, estimatedCost: 5.2, finalCost: 5.5, requestedDate: "2022-04-12", startDate: "2022-06-01", expectedEnd: "2023-05-31", finishedDate: "2023-06-10", status: "Operational", progress: 100, priority: "Medium", condition: "Fair", description: "Two-storey Taluka Panchayat office with council hall.", scale: "3,900 sq m built-up" }, 8,
      [
        ev("2026-09-10", "Citizen Request Received", "Citizen — Meena Joshi", "Cracks in council hall wall (CR-2026-103).", "info", "maintenance"),
        ev("2026-09-12", "Government Verification — Verified", DEPT, "Forwarded to engineer for structural assessment.", "done", "maintenance"),
      ]),
    mk({ id: "RAB-2019-008", name: "Old PWD Rest House", type: "Building", location: "Junagadh", address: "Talav Gate, Junagadh", engineer: "Shah & Associates Structural", contractor: "Narmada Builders", budget: 1.2, estimatedCost: 1.1, finalCost: 1.2, requestedDate: "1994-02-01", startDate: "1994-05-01", expectedEnd: "1995-06-30", finishedDate: "1995-07-15", status: "Decommissioning", progress: 100, priority: "Critical", condition: "Critical", description: "Single-storey load-bearing masonry rest house for visiting officials.", scale: "860 sq m built-up" }, 8,
      [
        ev("2026-07-22", "Citizen Request Received", "Citizen — Harish Vora", "Roof portion collapsed after monsoon (CR-2026-104).", "warning", "maintenance"),
        ev("2026-07-23", "Government Verification — Verified", DEPT, "Building cordoned off; occupants relocated.", "done", "maintenance"),
        ev("2026-08-02", "Engineer Assessment — Beyond Repair", "Shah & Associates Structural", "Severe masonry cracking and roof failure; rehabilitation not economical.", "rejected", "maintenance"),
        ev("2026-08-03", "Decommissioning Recommended", "Shah & Associates Structural", "Sent for government review (DEC-2026-001).", "warning", "decommissioning"),
      ]),
    mk({ id: "RAB-2012-003", name: "Coastal Link Road Km 12–18", type: "Road", location: "Jamnagar", address: "Jamnagar–Bedi Port Link Road", engineer: "Metro Roads Consultancy", contractor: "Saurashtra Roadways Pvt Ltd", budget: 9.0, estimatedCost: 8.7, finalCost: 9.3, requestedDate: "2010-03-01", startDate: "2010-06-01", expectedEnd: "2012-03-31", finishedDate: "2012-04-20", status: "Decommissioning", progress: 100, priority: "Critical", condition: "Critical", description: "Two-lane coastal link road; segment damaged by saline intrusion and embankment failure.", scale: "6 km, 2-lane" }, 8,
      [
        ev("2026-05-10", "Engineer Assessment — Beyond Repair", "Metro Roads Consultancy", "Embankment failure; realignment required.", "rejected", "maintenance"),
        ev("2026-05-25", "Decommissioning Approved", DEPT, "Approved for reconstruction on new alignment (DEC-2026-002).", "done", "decommissioning"),
        ev("2026-06-12", "Decommissioning Works Started", "Saurashtra Roadways Pvt Ltd", "Pavement removal and material salvage underway.", "done", "decommissioning"),
      ]),
    mk({ id: "RAB-2008-005", name: "Old Market Complex", type: "Building", location: "Anand", address: "Station Road, Anand", engineer: "Gujarat Infra Design Pvt Ltd", contractor: "Deccan Civil Works", budget: 2.1, estimatedCost: 2.0, finalCost: 2.2, requestedDate: "1988-01-10", startDate: "1988-04-01", expectedEnd: "1989-09-30", finishedDate: "1989-11-01", status: "Disposed", progress: 100, priority: "Low", condition: "N/A", description: "Former market complex; demolished and site handed over for new civic centre.", scale: "4,100 sq m built-up" }, 8,
      [
        ev("2025-06-15", "Engineer Assessment — Beyond Repair", "Gujarat Infra Design Pvt Ltd", undefined, "rejected", "maintenance"),
        ev("2025-07-01", "Decommissioning Approved", DEPT, undefined, "done", "decommissioning"),
        ev("2025-10-30", "Decommissioned", "Deccan Civil Works", "Demolition completed; debris recycled.", "done", "decommissioning"),
        ev("2025-11-20", "Disposed / Replaced", DEPT, "Site allotted for new Civic Centre project.", "done", "decommissioning"),
      ]),
  ];
}

export function seedRequests(): CitizenRequest[] {
  return [
    { id: "CR-2026-101", projectId: "RAB-2024-022", category: "Potholes", description: "Multiple deep potholes near Kadodara junction causing two-wheeler accidents.", citizen: "Ramesh Desai", contact: "98250 •••• 21", date: "2026-08-04", priority: "High", stage: "Under Maintenance", contractor: "Patel Infracon Ltd", progress: 55, workType: "Maintenance", estimatedCost: 0.42 },
    { id: "CR-2026-102", projectId: "RAB-2025-014", category: "Water leakage", description: "Water seepage from terrace into 2nd-floor consultation rooms during rain.", citizen: "Dr. Kavita Mehta", contact: "99099 •••• 44", date: "2026-09-22", priority: "Medium", stage: "Pending Verification", progress: 0 },
    { id: "CR-2026-103", projectId: "RAB-2023-011", category: "Structural issue", description: "Diagonal cracks visible in council hall wall near window openings.", citizen: "Meena Joshi", contact: "97240 •••• 08", date: "2026-09-10", priority: "High", stage: "Engineer Assessment", progress: 0 },
    { id: "CR-2026-104", projectId: "RAB-2019-008", category: "Damaged building", description: "Part of roof collapsed after heavy rainfall; walls show wide cracks.", citizen: "Harish Vora", contact: "98795 •••• 67", date: "2026-07-22", priority: "Critical", stage: "Beyond Repair", progress: 0 },
    { id: "CR-2026-105", projectId: "RAB-2012-003", category: "Broken road", description: "Road embankment washed away near Km 14; road closed to traffic.", citizen: "Salim Sheikh", contact: "90990 •••• 12", date: "2026-04-28", priority: "Critical", stage: "Beyond Repair", progress: 0 },
    { id: "CR-2026-106", projectId: "RAB-2025-014", category: "Other", description: "Staircase railing broken on ground floor.", citizen: "Nilesh Parmar", contact: "94260 •••• 90", date: "2026-02-14", priority: "Low", stage: "Resolved", contractor: "Deccan Civil Works", progress: 100, workType: "Maintenance" },
    { id: "CR-2026-107", projectId: "RAB-2026-002", category: "Other", description: "Temporary diversion lacks signage at Sola junction at night.", citizen: "Anjali Trivedi", contact: "98980 •••• 33", date: "2026-09-25", priority: "Medium", stage: "Pending Verification", progress: 0 },
  ];
}

export function seedDecomm(): Decommission[] {
  return [
    { id: "DEC-2026-001", projectId: "RAB-2019-008", requestId: "CR-2026-104", reason: "Roof collapse and severe masonry failure after monsoon.", assessment: "Load-bearing walls cracked beyond repair; rehabilitation cost exceeds 80% of replacement cost.", estimatedCost: 0.85, stage: "Government Review", createdDate: "2026-08-03", documents: ["Structural Assessment Report.pdf", "Site Photographs.zip"] },
    { id: "DEC-2026-002", projectId: "RAB-2012-003", requestId: "CR-2026-105", reason: "Embankment failure due to saline intrusion; segment unusable.", assessment: "Realignment on higher ground recommended; existing pavement to be removed and material salvaged.", decision: "Approved by Superintending Engineer, R&B Circle Rajkot.", estimatedCost: 3.2, contractor: "Saurashtra Roadways Pvt Ltd", stage: "Under Demolition", createdDate: "2026-05-10", documents: ["Assessment Report.pdf", "Govt. Approval Order.pdf"] },
    { id: "DEC-2025-004", projectId: "RAB-2008-005", reason: "Structurally unsafe 35+ year old complex.", assessment: "Beyond economical repair.", decision: "Approved — demolish and allot site for Civic Centre.", estimatedCost: 0.6, contractor: "Deccan Civil Works", stage: "Disposed / Replaced", createdDate: "2025-06-15", completionDate: "2025-11-20", outcome: "Replaced — site allotted to new Civic Centre", documents: ["Demolition Certificate.pdf"] },
  ];
}

export function seedNotifications(): AppNotification[] {
  return [
    { id: "nt-1", date: "2026-09-25", title: "New citizen request", body: "CR-2026-107 reported on SG Highway Service Road Widening.", read: false, projectId: "RAB-2026-002" },
    { id: "nt-2", date: "2026-09-22", title: "New citizen request", body: "CR-2026-102 — water leakage at Civil Hospital OPD Block.", read: false, projectId: "RAB-2025-014" },
    { id: "nt-3", date: "2026-09-14", title: "Engineer review pending", body: "RAB-2026-003 District Collectorate Annex awaiting engineer review.", read: false, projectId: "RAB-2026-003" },
    { id: "nt-4", date: "2026-08-03", title: "Decommissioning recommended", body: "Old PWD Rest House assessed as beyond repair.", read: true, projectId: "RAB-2019-008" },
  ];
}

export function seedActivity(): Activity[] {
  return [
    { id: "ac-1", date: "2026-09-25", text: "Citizen reported missing diversion signage", projectId: "RAB-2026-002", actor: "Anjali Trivedi" },
    { id: "ac-2", date: "2026-09-24", text: "Progress updated to 68%", projectId: "RAB-2026-001", actor: "XYZ Construction Co." },
    { id: "ac-3", date: "2026-09-22", text: "Water leakage reported", projectId: "RAB-2025-014", actor: "Dr. Kavita Mehta" },
    { id: "ac-4", date: "2026-09-14", text: "Project request submitted", projectId: "RAB-2026-003", actor: DEPT },
    { id: "ac-5", date: "2026-09-12", text: "Structural complaint verified", projectId: "RAB-2023-011", actor: DEPT },
  ];
}
