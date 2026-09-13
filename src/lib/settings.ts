export interface AiSettings {
  apiKey: string;
  model: string;
  baseUrl: string;
  /** When true, triage always uses the deterministic rule engine. */
  offline: boolean;
  /** Whether the user has seen the setup prompt at least once. */
  onboarded: boolean;
}

const STORAGE_KEY = "aduanai.ai-settings.v1";

export const DEFAULT_AI_SETTINGS: AiSettings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1",
  offline: false,
  onboarded: false,
};

export function loadAiSettings(): AiSettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return { ...DEFAULT_AI_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAiSettings(settings: AiSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage full or blocked — settings simply will not persist
  }
}

export function hasClientKey(settings: AiSettings): boolean {
  return settings.apiKey.trim().length > 0;
}
