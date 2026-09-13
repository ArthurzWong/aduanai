import { AGENCIES } from "./agencies";
import { isUrgency, type Triage } from "./types";

export const DEFAULT_MODEL = "gpt-4o-mini";
export const DEFAULT_BASE_URL = "https://api.openai.com/v1";

const REQUEST_TIMEOUT_MS = 25_000;

export interface AiCredentials {
  apiKey: string;
  model: string;
  baseUrl: string;
  origin: "request" | "server";
}

export const SYSTEM_PROMPT = `You are AduanAI, a triage assistant for Malaysian public complaints and service requests.
Complaints may be written in Malay, English or mixed Manglish. The user may be a resident, a business owner or an agency officer.

Reply with a single JSON object and nothing else, matching exactly:
{"complaintType":"","location":"","urgency":"low|medium|high|critical","agency":"","summary":"","steps":[],"status":"","nextAction":""}

Rules:
- "agency" must be exactly one of: ${Object.keys(AGENCIES).join(", ")}.
- Kuala Lumpur municipal issues (potholes, drains, street lighting, flash flooding, public cleanliness) route to DBKL.
- Roads outside Kuala Lumpur city boundaries route to JKR; general municipal issues elsewhere route to "Local Council".
- Water supply issues route to "Air Selangor" in Selangor/KL and to "Local Council" elsewhere.
- "urgency" reflects public safety risk: hazards to motorcyclists, children, the elderly or homes are at least "high"; life-threatening or widespread damage is "critical"; cosmetic issues are "low".
- "steps" holds 3 to 5 short imperative actions in English, ordered by what the complainant should do first.
- "summary" is one or two factual sentences in English, restating the issue, place and risk.
- "status" is the current triage state, e.g. "Received — triaged and ready for submission".
- "nextAction" is the single most important immediate action, as one sentence.
- "location" should be the most specific place you can infer (road, area, city, state). Use the user's own words for place names.
- Never invent addresses, phone numbers or reference IDs. If information is missing, keep the field short rather than guessing.`;

export function isTriage(value: unknown): value is Triage {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.complaintType === "string" &&
    candidate.complaintType.length > 0 &&
    typeof candidate.location === "string" &&
    isUrgency(candidate.urgency) &&
    typeof candidate.agency === "string" &&
    candidate.agency.length > 0 &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.steps) &&
    candidate.steps.length > 0 &&
    candidate.steps.every((step) => typeof step === "string") &&
    typeof candidate.status === "string" &&
    typeof candidate.nextAction === "string"
  );
}

/** Pull the first JSON object out of a model response, tolerating code fences. */
export function parseModelJson(content: string): unknown {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("model response contained no JSON object");
  return JSON.parse(raw.slice(start, end + 1));
}

const PRIVATE_HOST =
  /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

function safeBaseUrl(candidate: string | undefined, fallback: string): string {
  const raw = (candidate ?? "").trim().replace(/\/+$/, "");
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return fallback;
    if (PRIVATE_HOST.test(url.hostname)) return fallback;
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return fallback;
  }
}

/**
 * A request-provided key wins; otherwise fall back to the server env.
 * Returns null when no key is available, which means "run offline".
 */
export function resolveCredentials(overrides: {
  apiKey?: unknown;
  model?: unknown;
  baseUrl?: unknown;
}): AiCredentials | null {
  const requestKey = typeof overrides.apiKey === "string" ? overrides.apiKey.trim() : "";
  const envKey = (process.env.OPENAI_API_KEY ?? "").trim();
  const apiKey = requestKey || envKey;
  if (!apiKey) return null;

  const model =
    (typeof overrides.model === "string" && overrides.model.trim()) ||
    (process.env.AI_MODEL ?? "").trim() ||
    DEFAULT_MODEL;

  const baseUrl = safeBaseUrl(
    typeof overrides.baseUrl === "string" ? overrides.baseUrl : (process.env.OPENAI_BASE_URL ?? ""),
    DEFAULT_BASE_URL,
  );

  return { apiKey, model, baseUrl, origin: requestKey ? "request" : "server" };
}

async function callModel(
  complaint: string,
  credentials: AiCredentials,
  useJsonMode: boolean,
): Promise<{ triage: Triage; model: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${credentials.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credentials.apiKey}`,
      },
      body: JSON.stringify({
        model: credentials.model,
        temperature: 0.2,
        ...(useJsonMode ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: complaint },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`model request failed (${response.status})${detail ? `: ${detail.slice(0, 160)}` : ""}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("model response was empty");

    const parsed = parseModelJson(content);
    if (!isTriage(parsed)) throw new Error("model response did not match the AduanAI schema");

    return { triage: { ...parsed, steps: parsed.steps.slice(0, 6) }, model: payload.model ?? credentials.model };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Live triage with one retry. Some OpenAI-compatible providers reject
 * `response_format`, so a 4xx on the first attempt retries without it.
 */
export async function triageWithModel(
  complaint: string,
  credentials: AiCredentials,
): Promise<{ triage: Triage; model: string }> {
  try {
    return await callModel(complaint, credentials, true);
  } catch (firstError) {
    try {
      return await callModel(complaint, credentials, false);
    } catch {
      throw firstError;
    }
  }
}
