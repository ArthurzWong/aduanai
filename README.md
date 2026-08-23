# AduanAI

**Intelligent Public Complaint & Service Request Triage for Malaysia.**

AduanAI turns a messy, code-switched complaint ("Tolong, ada lubang besar di Jalan Ampang…") into a structured, agency-routed service request with an urgency rating, clear next steps, a status card, and a markdown report you can paste into any official complaint channel.

## Why

Malaysians file complaints in Malay, English and Manglish across a dozen agencies (DBKL, JKR, IWK, SWCorp, Air Selangor, TNB, JPJ, KKM, DOE). Most complaints stall because they land at the wrong agency, lack location detail, or have no urgency signal. AduanAI does that triage in one step.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- One API route (`POST /api/triage`)
- Live LLM triage with a **deterministic rule-based mock fallback** — the demo never breaks

## Quick start

```bash
npm install
npm run dev     # http://localhost:3000
```

No API key needed: with no `OPENAI_API_KEY` set, AduanAI runs the built-in mock triage engine and the full flow works offline.

### Optional live AI mode

```bash
cp .env.example .env.local
# OPENAI_API_KEY=sk-...
# AI_MODEL=gpt-4o-mini            (optional)
# OPENAI_BASE_URL=https://api.openai.com/v1   (optional, any OpenAI-compatible endpoint)
```

If the key is missing, the request fails, times out (12s), or the model returns off-schema JSON, the API automatically falls back to the mock engine and the UI shows a "Mock fallback" badge with the reason. Toggle **Demo mock mode** in the UI to force the deterministic path.

## Core flow

1. User pastes a complaint (Malay / English / mixed) and optionally attaches photo evidence.
2. `POST /api/triage` returns structured JSON validated against the schema.
3. Dashboard renders the triage card, attached photos, agency routing, next steps and status tracker.
4. User exports markdown (download / copy) or copies raw JSON.

## Core JSON schema

```json
{
  "complaintType": "",
  "location": "",
  "urgency": "low|medium|high|critical",
  "agency": "",
  "summary": "",
  "steps": [],
  "status": "",
  "nextAction": ""
}
```

`POST /api/triage`

```json
// request
{ "complaint": "Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor.", "mock": false }

// response
{ "triage": { /* schema above */ }, "source": "live" | "mock", "model": "gpt-4o-mini", "notice": "…" }
```

## Demo scenario (30 seconds)

Input:

> Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor.

Output:

| Field | Value |
| --- | --- |
| complaintType | `infrastructure` |
| location | `Jalan Ampang, near KLCC, Kuala Lumpur` |
| urgency | `high` |
| agency | `DBKL` (Dewan Bandaraya Kuala Lumpur) |
| nextAction | Submit the report to DBKL road maintenance and request temporary hazard signage today |

Then: **Advance status** to walk the tracker (Received → Triaged → Routed → In progress → Resolved) and **Download markdown** for the filled report.

## Sample prompts

Also available as one-click buttons in the UI (see `src/lib/sample-prompts.ts`):

| Prompt | Expected triage |
| --- | --- |
| Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor. | infrastructure · high · DBKL |
| Sampah tak dikutip dah seminggu di Jalan Cheras, busuk dan banyak lalat. | waste management · SWCorp |
| Air tak keluar sejak semalam di Seksyen 7 Shah Alam, ada baby kat rumah. | water supply · high · Air Selangor |
| Banjir kilat di Taman Desa Kuala Lumpur, air masuk rumah dan longkang melimpah. | flooding · critical · DBKL |
| The street lights along Jalan Bukit Bintang have been out for two weeks and it feels unsafe at night. | street lighting · DBKL |
| Kumbahan melimpah dari manhole depan rumah di Jalan SS2/24 Petaling Jaya, sangat busuk. | sewerage · high · IWK |

## How triage works

- **Live mode** — a JSON-only system prompt constrains the model to the schema and the known agency list; the response is schema-validated before use.
- **Mock mode** — a keyword-scored rule engine (`src/lib/triage-engine.ts`) covering 11 complaint categories, bilingual keyword sets, urgency escalation hints ("bahaya", "banjir", "kemalangan"), road/landmark/city extraction, and KL-vs-outside routing (DBKL vs JKR vs local council).

## Project structure

```
src/
  app/
    api/triage/route.ts     # triage endpoint: live model + mock fallback
    page.tsx                # dashboard
  components/
    ComplaintForm.tsx       # input + photo uploads + sample prompts + mock toggle
    TriageResult.tsx        # triage / JSON / markdown tabs + export
    StatusTracker.tsx       # 5-stage status card + agency channel
    ui.tsx                  # urgency & source badges, fields
  lib/
    triage-engine.ts        # deterministic rule-based triage
    agencies.ts             # agency registry + submission channels
    markdown.ts             # markdown report + reference numbers
    photos.ts               # photo validation, previews, size formatting
    sample-prompts.ts       # demo prompts
    types.ts                # shared schema types
```

## Scope notes

Complaints are kept in browser state for the demo (no database), and status advancement is manual — both are deliberate to keep the hackathon flow reliable.

Photo evidence (up to 4 images, 5 MB each) is read in the browser and never uploaded to a server, so there is no storage bucket to provision for the demo. The markdown export lists the attached filenames and sizes; wiring real uploads (S3 / Vercel Blob) is the natural next step for production.
