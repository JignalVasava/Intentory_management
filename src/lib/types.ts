export type AssetType = "Road" | "Building";
export type Role = "Government Official" | "Engineer" | "Contractor" | "Citizen";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type Condition = "New" | "Good" | "Fair" | "Poor" | "Critical" | "N/A";

export type ProjectStatus =
  | "Proposed"
  | "Engineer Review"
  | "Rejected"
  | "Approved"
  | "Contractor Pending"
  | "Contractor Accepted"
  | "Under Execution"
  | "Completion Submitted"
  | "Completed"
  | "Operational"
  | "Maintenance"
  | "Rehabilitation"
  | "Decommissioning"
  | "Disposed";

export type Track = "execution" | "maintenance" | "decommissioning";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  by: string;
  status: "done" | "rejected" | "info" | "warning";
  remarks?: string;
  track: Track;
}

export interface Project {
  id: string;
  name: string;
  type: AssetType;
  location: string;
  address: string;
  engineer: string;
  contractor?: string;
  budget?: number;
  estimatedCost: number;
  finalCost?: number;
  requestedDate: string;
  startDate?: string;
  expectedEnd: string;
  finishedDate?: string;
  status: ProjectStatus;
  progress: number;
  priority: Priority;
  condition: Condition;
  description: string;
  scale: string;
  map: { x: number; y: number };
  timeline: TimelineEvent[];
  rejectionReason?: string;
}

export type RequestStage =
  | "Pending Verification"
  | "Rejected"
  | "Engineer Assessment"
  | "No Maintenance Required"
  | "Maintenance Approved"
  | "Contractor Pending"
  | "Under Maintenance"
  | "Completion Submitted"
  | "Resolved"
  | "Beyond Repair";

export interface CitizenRequest {
  id: string;
  projectId: string;
  category: string;
  description: string;
  citizen: string;
  contact: string;
  date: string;
  priority: Priority;
  stage: RequestStage;
  contractor?: string;
  progress: number;
  estimatedCost?: number;
  workType?: "Maintenance" | "Rehabilitation";
  remarks?: string;
}

export type DecommStage =
  | "Government Review"
  | "Rejected"
  | "Decommissioning Approved"
  | "Under Demolition"
  | "Decommissioned"
  | "Disposed / Replaced";

export interface Decommission {
  id: string;
  projectId: string;
  requestId?: string;
  reason: string;
  assessment: string;
  decision?: string;
  estimatedCost: number;
  contractor?: string;
  stage: DecommStage;
  createdDate: string;
  completionDate?: string;
  outcome?: string;
  documents: string[];
}

export interface AppNotification {
  id: string;
  date: string;
  title: string;
  body: string;
  read: boolean;
  projectId?: string;
}

export interface Activity {
  id: string;
  date: string;
  text: string;
  projectId: string;
  actor: string;
}
