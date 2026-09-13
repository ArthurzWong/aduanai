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

export interface WeatherContext {
  summary: string;
  temperatureC: number | null;
  precipitationMm: number;
  rainTodayMm: number | null;
  source: string;
}

/** Live context fetched from public data sources to support the complaint. */
export interface Enrichment {
  query: string;
  resolved: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
  weather: WeatherContext | null;
  source: string;
}

export interface TriageResponse {
  triage: Triage;
  source: "live" | "mock";
  model?: string;
  notice?: string;
  enrichment?: Enrichment | null;
  latencyMs?: number;
  cached?: boolean;
}

export interface ComplaintPhoto {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
}

/** One entry in the status workflow timeline. */
export interface StageEvent {
  stage: number;
  at: string;
}

export interface ComplaintRecord extends Triage {
  id: string;
  reference: string;
  input: string;
  createdAt: string;
  source: "live" | "mock";
  model?: string;
  photos: ComplaintPhoto[];
  enrichment?: Enrichment | null;
  history: StageEvent[];
}

export const URGENCIES: Urgency[] = ["low", "medium", "high", "critical"];

export function isUrgency(value: unknown): value is Urgency {
  return typeof value === "string" && (URGENCIES as string[]).includes(value);
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "at", "in", "on", "of", "to", "is", "are", "was", "for", "with",
  "ada", "di", "dan", "yang", "untuk", "dekat", "saya", "ini", "itu", "tak", "tidak", "sudah",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOPWORDS.has(token)),
  );
}

/**
 * Cheap local duplicate detection: returns existing complaints that share a
 * meaningful number of keywords with the incoming text.
 */
export function similarComplaints(text: string, records: ComplaintRecord[], limit = 3): ComplaintRecord[] {
  const tokens = tokenize(text);
  if (tokens.size === 0) return [];
  const scored = records
    .map((record) => {
      const other = tokenize(`${record.input} ${record.complaintType} ${record.location}`);
      let shared = 0;
      tokens.forEach((token) => {
        if (other.has(token)) shared += 1;
      });
      const score = shared / Math.max(tokens.size, 4);
      return { record, score };
    })
    .filter((entry) => entry.score >= 0.34)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((entry) => entry.record);
}
