import type { ComplaintRecord } from "./types";

const STORAGE_KEY = "aduanai.records.v1";

export interface PersistedState {
  records: ComplaintRecord[];
  stages: Record<string, number>;
}

/**
 * Photos live only in memory (data URLs can exceed the storage quota), so the
 * persisted copy keeps the metadata and drops the image payload.
 */
function stripPhotoPayload(record: ComplaintRecord): ComplaintRecord {
  return {
    ...record,
    photos: record.photos.map((photo) => ({ ...photo, dataUrl: "" })),
  };
}

export function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") return { records: [], stages: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { records: [], stages: {} };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const records = Array.isArray(parsed.records)
      ? parsed.records.map((record) => ({ ...record, history: record.history ?? [] }))
      : [];
    const stages = parsed.stages && typeof parsed.stages === "object" ? parsed.stages : {};
    return { records, stages };
  } catch {
    return { records: [], stages: {} };
  }
}

export function persistState(records: ComplaintRecord[], stages: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ records: records.slice(0, 50).map(stripPhotoPayload), stages }),
    );
  } catch {
    // quota exceeded — keep working in memory
  }
}

export function clearPersistedState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
