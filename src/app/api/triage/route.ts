import { NextResponse } from "next/server";
import { resolveCredentials, triageWithModel } from "@/lib/ai";
import { enrichTriage } from "@/lib/enrich";
import { triageWithRules } from "@/lib/triage-engine";
import type { TriageResponse } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function safeReason(error: unknown): string {
  const raw = error instanceof Error ? error.message : "unknown error";
  return raw
    .replace(/sk-[A-Za-z0-9_*\-]{6,}/g, "sk-***")
    .replace(/Bearer\s+\S+/gi, "Bearer ***")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function POST(request: Request) {
  let complaint = "";
  let forceOffline = false;
  let enrich = true;
  let credentials: ReturnType<typeof resolveCredentials> = null;

  try {
    const body = (await request.json()) as {
      complaint?: unknown;
      mock?: unknown;
      enrich?: unknown;
      apiKey?: unknown;
      model?: unknown;
      baseUrl?: unknown;
    };
    complaint = typeof body.complaint === "string" ? body.complaint.trim() : "";
    forceOffline = body.mock === true;
    enrich = body.enrich !== false;
    credentials = forceOffline ? null : resolveCredentials(body);
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (complaint.length < 10) {
    return NextResponse.json(
      { error: "Please describe the complaint in at least 10 characters." },
      { status: 400 },
    );
  }

  const startedAt = Date.now();

  // Live model first. Only fall back to the deterministic engine when the live
  // call is unavailable or fails, and always say why.
  if (credentials) {
    try {
      const { triage, model } = await triageWithModel(complaint, credentials);
      const enrichment = enrich ? await enrichTriage(triage) : null;
      const result: TriageResponse = {
        triage,
        source: "live",
        model,
        enrichment,
        latencyMs: Date.now() - startedAt,
      };
      return NextResponse.json(result);
    } catch (error) {
      const reason = safeReason(error);
      const triage = triageWithRules(complaint);
      const result: TriageResponse = {
        triage,
        source: "mock",
        notice: `Live AI could not complete this triage (${reason}). Showing the deterministic rule-engine result instead.`,
        enrichment: enrich ? await enrichTriage(triage) : null,
        latencyMs: Date.now() - startedAt,
      };
      return NextResponse.json(result);
    }
  }

  const triage = triageWithRules(complaint);
  const result: TriageResponse = {
    triage,
    source: "mock",
    notice: forceOffline
      ? "Offline mode is on — triage produced by the deterministic rule engine."
      : "Live AI is not configured yet. Add your OpenAI-compatible API key in AI settings (or set OPENAI_API_KEY on the server) to triage with a live model. Showing the deterministic rule-engine result for now.",
    enrichment: enrich ? await enrichTriage(triage) : null,
    latencyMs: Date.now() - startedAt,
  };
  return NextResponse.json(result);
}
