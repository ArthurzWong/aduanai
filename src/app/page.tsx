"use client";

import { useEffect, useMemo, useState } from "react";
import { AiSettingsPanel } from "@/components/AiSettings";
import { ComplaintForm } from "@/components/ComplaintForm";
import { MobileNav, Sidebar, type View } from "@/components/Sidebar";
import { StatusSummary, type SummaryCounts } from "@/components/StatusSummary";
import { StatusTracker, STATUS_STAGES } from "@/components/StatusTracker";
import { TriageResult } from "@/components/TriageResult";
import { Chip, UrgencyBadge } from "@/components/ui";
import { AGENCIES } from "@/lib/agencies";
import { referenceFor } from "@/lib/markdown";
import { DEFAULT_AI_SETTINGS, loadAiSettings, saveAiSettings, type AiSettings } from "@/lib/settings";
import { clearPersistedState, loadPersistedState, persistState } from "@/lib/store";
import {
  URGENCIES,
  similarComplaints,
  type ComplaintPhoto,
  type ComplaintRecord,
  type Enrichment,
  type TriageResponse,
  type Urgency,
} from "@/lib/types";

const DEMO_COMPLAINT = "Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor.";
const RESOLVED_STAGE = STATUS_STAGES.length - 1;

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [complaint, setComplaint] = useState(DEMO_COMPLAINT);
  const [photos, setPhotos] = useState<ComplaintPhoto[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [records, setRecords] = useState<ComplaintRecord[]>([]);
  const [stages, setStages] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Restore the session and AI settings after mount (client-only storage).
  useEffect(() => {
    const persisted = loadPersistedState();
    setRecords(persisted.records);
    setStages(persisted.stages);
    setActiveId(persisted.records[0]?.id ?? null);
    const stored = loadAiSettings();
    setSettings(stored);
    setOfflineMode(stored.offline);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistState(records, stages);
  }, [records, stages, hydrated]);

  const active = useMemo(() => records.find((record) => record.id === activeId) ?? null, [records, activeId]);
  const activeStage = active ? (stages[active.id] ?? 1) : 1;

  const counts = useMemo<SummaryCounts>(() => {
    const byUrgency = URGENCIES.reduce(
      (acc, urgency) => ({ ...acc, [urgency]: 0 }),
      {} as Record<Urgency, number>,
    );
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let live = 0;

    for (const record of records) {
      byUrgency[record.urgency] += 1;
      if (record.source === "live") live += 1;
      const stage = stages[record.id] ?? 1;
      if (stage >= RESOLVED_STAGE) resolved += 1;
      else if (stage >= 2) inProgress += 1;
      else open += 1;
    }

    return {
      open,
      inProgress,
      resolved,
      byUrgency,
      agencies: new Set(records.map((record) => record.agency)).size,
      photos: records.reduce((total, record) => total + record.photos.length, 0),
      live,
    };
  }, [records, stages]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      [record.reference, record.complaintType, record.agency, record.location, record.input]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [records, search]);

  const duplicates = useMemo(
    () => (complaint.trim().length >= 10 ? similarComplaints(complaint, records) : []),
    [complaint, records],
  );

  const agencyCount = Object.keys(AGENCIES).length;
  const liveReady = !offlineMode && settings.apiKey.trim().length > 0;
  const title = view === "dashboard" ? "Dashboard" : view === "complaints" ? "Complaints" : "Agency directory";

  function updateSettings(next: AiSettings) {
    setSettings(next);
    setOfflineMode(next.offline);
    saveAiSettings(next);
    setSettingsOpen(false);
  }

  async function submit() {
    const text = complaint.trim();
    if (text.length < 10) {
      setError("Please describe the complaint in at least 10 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint: text,
          mock: offlineMode,
          enrich: true,
          apiKey: settings.apiKey,
          model: settings.model,
          baseUrl: settings.baseUrl,
        }),
      });

      const payload = (await response.json()) as TriageResponse & { error?: string };
      if (!response.ok || !payload.triage) {
        throw new Error(payload.error ?? "Triage failed. Please try again.");
      }

      const now = new Date();
      const record: ComplaintRecord = {
        ...payload.triage,
        id: `${now.getTime()}`,
        reference: referenceFor(now, records.length + 1),
        input: text,
        createdAt: now.toISOString(),
        source: payload.source,
        model: payload.model,
        photos,
        enrichment: (payload.enrichment ?? null) as Enrichment | null,
        history: [{ stage: 1, at: now.toISOString() }],
      };

      setRecords((previous) => [record, ...previous]);
      setStages((previous) => ({ ...previous, [record.id]: 1 }));
      setPhotos([]);
      setActiveId(record.id);
      setNotice(payload.notice ?? null);
      setFormOpen(false);
      setView("dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Triage failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function setStage(id: string, next: number) {
    setStages((previous) => ({ ...previous, [id]: next }));
    setRecords((previous) =>
      previous.map((record) =>
        record.id === id
          ? { ...record, history: [...record.history.filter((entry) => entry.stage !== next), { stage: next, at: new Date().toISOString() }].sort((a, b) => a.stage - b.stage) }
          : record,
      ),
    );
  }

  function resetSession() {
    setRecords([]);
    setStages({});
    setActiveId(null);
    setNotice(null);
    clearPersistedState();
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar
        view={view}
        onViewChange={setView}
        counts={{ dashboard: 0, complaints: records.length, agencies: agencyCount }}
      />

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
        <section className="band animate-rise-in overflow-hidden rounded-3xl px-6 py-6 shadow-lift sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-300">
                Public complaint triage
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                Turn a messy complaint in Malay, English or Manglish into a structured, agency-routed service request
                with clear next steps.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    liveReady
                      ? "border-palm-100/40 bg-palm-500/20 text-palm-100 hover:bg-palm-500/30"
                      : "border-white/15 bg-white/[0.06] text-ink-100 hover:bg-white/10"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${liveReady ? "bg-palm-100" : "bg-gold-400"}`} />
                  {offlineMode ? "Offline engine" : liveReady ? "Live AI active" : "Add API key"}
                </button>
                <button type="button" onClick={() => setFormOpen(true)} className="btn-primary">
                  <span className="text-base leading-none">+</span> New complaint
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip tone="dark">
                  {records.length} complaint{records.length === 1 ? "" : "s"} filed
                </Chip>
                <Chip tone="dark">{counts.live} live-triaged</Chip>
                <Chip tone="dark">
                  {counts.photos} photo{counts.photos === 1 ? "" : "s"} attached
                </Chip>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 space-y-5">
          <MobileNav view={view} onViewChange={setView} />

          {view !== "agencies" ? (
            <div className="relative max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reference, agency, location…"
                aria-label="Search complaints"
                className="input pl-9"
              />
            </div>
          ) : null}

          {notice ? (
            <p className="rounded-2xl border border-gold-300 bg-gold-100 px-4 py-3 text-sm text-ink-800">{notice}</p>
          ) : null}

          {view === "dashboard" ? (
            <>
              <StatusSummary counts={counts} />

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                {loading ? (
                  <TriageSkeleton />
                ) : active ? (
                  <>
                    <TriageResult record={active} />
                    <div className="flex flex-col gap-5">
                      <StatusTracker
                        record={{ ...active, status: STATUS_STAGES[activeStage] }}
                        stageIndex={activeStage}
                        onAdvance={() => setStage(active.id, Math.min(activeStage + 1, RESOLVED_STAGE))}
                        onReset={() => setStage(active.id, 1)}
                      />
                      <ComplaintCategories records={records} />
                    </div>
                  </>
                ) : (
                  <EmptyState onStart={() => setFormOpen(true)} />
                )}
              </div>

              {records.length > 0 ? (
                <ComplaintTable
                  records={filtered}
                  stages={stages}
                  activeId={activeId}
                  onSelect={(id) => setActiveId(id)}
                  title="Recent complaints"
                />
              ) : null}
            </>
          ) : null}

          {view === "complaints" ? (
            records.length > 0 ? (
              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <ComplaintTable
                  records={filtered}
                  stages={stages}
                  activeId={activeId}
                  onSelect={(id) => setActiveId(id)}
                  title={`${filtered.length} complaint${filtered.length === 1 ? "" : "s"}`}
                />
                {loading ? (
                  <TriageSkeleton />
                ) : active ? (
                  <div className="space-y-5">
                    <TriageResult record={active} />
                    <StatusTracker
                      record={{ ...active, status: STATUS_STAGES[activeStage] }}
                      stageIndex={activeStage}
                      onAdvance={() => setStage(active.id, Math.min(activeStage + 1, RESOLVED_STAGE))}
                      onReset={() => setStage(active.id, 1)}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState onStart={() => setFormOpen(true)} />
            )
          ) : null}

          {view === "agencies" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.values(AGENCIES).map((agency, index) => (
                <article
                  key={agency.code}
                  className="card animate-rise-in p-5"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-bold tracking-tight text-foreground">{agency.code}</p>
                      <p className="text-xs text-muted">{agency.name}</p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ember-50 text-[11px] font-bold uppercase text-ember-600">
                      {agency.code.slice(0, 2)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-ink-600">{agency.scope}</p>
                  <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-xs text-ink-600">{agency.channel}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="mt-10 flex flex-col items-center gap-2 text-center text-xs text-ink-600">
          <p>
            Complaints are kept in this browser and restored on reload. Triage runs on a live model when a key is set,
            and falls back to a deterministic rule engine when it is not.
          </p>
          {records.length > 0 ? (
            <button type="button" onClick={resetSession} className="text-xs font-medium text-ember-600 hover:underline">
              Clear this session
            </button>
          ) : null}
        </footer>
      </main>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm sm:p-8">
          <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">New complaint</h2>
                <p className="mt-1 text-sm text-muted">AduanAI structures it and routes it to the right agency.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-ink-400 transition hover:bg-surface-muted hover:text-ink-700"
              >
                ×
              </button>
            </div>

            {!liveReady ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-300 bg-gold-100 px-4 py-3 text-sm text-ink-800">
                <span>
                  {offlineMode
                    ? "Offline rule engine is on — triage will not use a live model."
                    : "No live AI key yet. Add one to triage with a live model, or continue with the rule engine."}
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-lg border border-ink-800/20 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-800"
                >
                  AI settings
                </button>
              </div>
            ) : null}

            {duplicates.length > 0 ? (
              <div className="mt-4 rounded-xl border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-900">
                <p className="font-medium">Possible duplicate</p>
                <p className="mt-1 text-xs text-ember-800">
                  This looks similar to {duplicates.length} existing complaint{duplicates.length === 1 ? "" : "s"}:
                </p>
                <ul className="mt-2 space-y-1 text-xs">
                  {duplicates.map((record) => (
                    <li key={record.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(record.id);
                          setView("dashboard");
                          setFormOpen(false);
                        }}
                        className="text-left underline decoration-ember-300 hover:text-ember-700"
                      >
                        {record.reference} · {record.complaintType} · {record.location}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-5">
              <ComplaintForm
                value={complaint}
                onChange={setComplaint}
                onSubmit={submit}
                loading={loading}
                mockMode={offlineMode}
                onMockModeChange={setOfflineMode}
                error={error}
                photos={photos}
                onPhotosChange={setPhotos}
              />
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <AiSettingsPanel settings={settings} onSave={updateSettings} onClose={() => setSettingsOpen(false)} />
      ) : null}
    </div>
  );
}

function TriageSkeleton() {
  return (
    <section className="card animate-rise-in" aria-busy="true" aria-live="polite">
      <p className="label">Triaging</p>
      <div className="mt-3 space-y-3">
        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded-lg bg-surface-muted" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-12 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
    </section>
  );
}

const COMPLAINT_CATEGORIES = [
  "infrastructure",
  "street lighting",
  "waste management",
  "water supply",
  "sewerage",
  "flooding",
  "electricity",
  "public safety",
  "public transport",
  "public health",
  "environment",
];

function ComplaintCategories({ records }: { records: ComplaintRecord[] }) {
  const counts = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.complaintType] = (acc[record.complaintType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="card animate-rise-in">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold tracking-tight text-foreground">Complaint categories</h2>
        <span className="text-xs text-muted">AduanAI triage scope</span>
      </div>
      <ul className="mt-4 space-y-0.5">
        {COMPLAINT_CATEGORIES.map((category) => {
          const count = counts[category] ?? 0;
          return (
            <li key={category} className="flex items-center justify-between gap-3 rounded-lg px-3 py-1">
              <span className="text-sm capitalize text-ink-700">{category}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  count > 0 ? "bg-ember-100 text-ember-700" : "bg-surface-muted text-ink-500"
                }`}
              >
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ComplaintTable({
  records,
  stages,
  activeId,
  onSelect,
  title,
}: {
  records: ComplaintRecord[];
  stages: Record<string, number>;
  activeId: string | null;
  onSelect: (id: string) => void;
  title: string;
}) {
  return (
    <section className="card animate-rise-in overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h2>
      </div>

      {records.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">No complaints match your search.</p>
      ) : (
        <ul className="divide-y divide-line">
          {records.map((record) => {
            const stage = stages[record.id] ?? 1;
            return (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => onSelect(record.id)}
                  className={`flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ember-300 ${
                    record.id === activeId ? "bg-ember-50/70" : "hover:bg-surface-muted"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-foreground">{record.complaintType}</span>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-600">
                        {record.agency}
                      </span>
                      {record.source === "live" ? (
                        <span className="rounded-full bg-palm-50 px-2 py-0.5 text-[11px] text-palm-700">live</span>
                      ) : null}
                      {record.photos.length > 0 ? (
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-600">
                          {record.photos.length} photo{record.photos.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted">
                      {record.reference} · {record.location} · {STATUS_STAGES[stage]}
                    </span>
                  </span>
                  <UrgencyBadge urgency={record.urgency} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <section className="card animate-rise-in flex min-h-[16rem] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-50 text-ember-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden
        >
          <path d="M5 3h9l5 5v13H5zM14 3v5h5M8 12h8M8 16h5" />
        </svg>
      </span>
      <p className="mt-4 font-display text-lg font-bold tracking-tight text-foreground">No complaint triaged yet</p>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Lodge a complaint in Malay or English to see structured triage, agency routing, next steps and the markdown
        report.
      </p>
      <button type="button" onClick={onStart} className="btn-primary mt-5">
        New complaint
      </button>
    </section>
  );
}
