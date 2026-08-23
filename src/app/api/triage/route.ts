import { NextResponse } from "next/server";
import { AGENCIES } from "@/lib/agencies";
import { triageWithRules } from "@/lib/triage-engine";
import { isUrgency, type Triage, type TriageResponse } from "@/lib/types";

const LIVE_TIMEOUT_MS = 12_000;

const SYSTEM_PROMPT = `You are AduanAI, a triage assistant for Malaysian public complaints and service requests.
Complaints may be in Malay, English or mixed Manglish. Reply with JSON only, no prose, matching:
{"complaintType":"","location":"","urgency":"low|medium|high|critical","agency":"","summary":"","steps":[],"status":"","nextAction":""}
Rules:
- "agency" must be one of: ${Object.keys(AGENCIES).join(", ")}.
- Kuala Lumpur municipal issues (potholes, drains, street lighting, flooding) route to DBKL.
- "urgency" reflects public safety risk: hazards to motorcyclists, children or homes are at least "high"; life threatening or widespread damage is "critical".
- "steps" holds 3 to 5 short imperative actions written in English.
- "summary" is one or two sentences in English.
- "status" describes the current triage state, e.g. "Received — triaged and ready for submission".
- "nextAction" is the single most important immediate action.`;

function isTriage(value: unknown): value is Triage {
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

function parseModelJson(content: string): unknown {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("model response contained no JSON object");
  return JSON.parse(raw.slice(start, end + 1));
}

async function triageWithModel(complaint: string): Promise<{ triage: Triage; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: complaint },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`model request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("model response was empty");

    const parsed = parseModelJson(content);
    if (!isTriage(parsed)) throw new Error("model response did not match the AduanAI schema");

    return { triage: { ...parsed, steps: parsed.steps.slice(0, 6) }, model };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let complaint = "";
  let forceMock = false;

  try {
    const body = (await request.json()) as { complaint?: unknown; mock?: unknown };
    complaint = typeof body.complaint === "string" ? body.complaint.trim() : "";
    forceMock = body.mock === true;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (complaint.length < 10) {
    return NextResponse.json(
      { error: "Please describe the complaint in at least 10 characters." },
      { status: 400 },
    );
  }

  if (!forceMock && process.env.OPENAI_API_KEY) {
    try {
      const { triage, model } = await triageWithModel(complaint);
      const result: TriageResponse = { triage, source: "live", model };
      return NextResponse.json(result);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      const result: TriageResponse = {
        triage: triageWithRules(complaint),
        source: "mock",
        notice: `Live model unavailable (${reason}). Showing deterministic mock triage.`,
      };
      return NextResponse.json(result);
    }
  }

  const result: TriageResponse = {
    triage: triageWithRules(complaint),
    source: "mock",
    notice: forceMock
      ? "Mock mode is on — triage produced by the deterministic rule engine."
      : "No OPENAI_API_KEY configured — triage produced by the deterministic mock engine.",
  };
  return NextResponse.json(result);
}
