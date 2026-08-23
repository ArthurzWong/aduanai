export type Urgency = "low" | "medium" | "high" | "critical";

export interface Triage {
  complaintType: string;
  location: string;
  urgency: Urgency;
  agency: string;
  summary: string;
  steps: string[];
  status: string;
  nextAction: string;
}

export interface TriageResponse {
  triage: Triage;
  source: "live" | "mock";
  model?: string;
  notice?: string;
}

export interface ComplaintPhoto {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
}

export interface ComplaintRecord extends Triage {
  id: string;
  reference: string;
  input: string;
  createdAt: string;
  source: "live" | "mock";
  photos: ComplaintPhoto[];
}

export const URGENCIES: Urgency[] = ["low", "medium", "high", "critical"];

export function isUrgency(value: unknown): value is Urgency {
  return typeof value === "string" && (URGENCIES as string[]).includes(value);
}
