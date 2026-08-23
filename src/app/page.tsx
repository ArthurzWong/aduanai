"use client";

import { useMemo, useState } from "react";
import { ComplaintForm } from "@/components/ComplaintForm";
import { MobileNav, Sidebar, type View } from "@/components/Sidebar";
import { StatusSummary, type SummaryCounts } from "@/components/StatusSummary";
import { StatusTracker, STATUS_STAGES } from "@/components/StatusTracker";
import { TriageResult } from "@/components/TriageResult";
import { UrgencyBadge } from "@/components/ui";
import { AGENCIES } from "@/lib/agencies";
import { referenceFor } from "@/lib/markdown";
import { URGENCIES, type ComplaintPhoto, type ComplaintRecord, type TriageResponse, type Urgency } from "@/lib/types";

const DEMO_COMPLAINT = "Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor.";
const RESOLVED_STAGE = STATUS_STAGES.length - 1;

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [complaint, setComplaint] = useState(DEMO_COMPLAINT);
  const [photos, setPhotos] = useState<ComplaintPhoto[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [records, setRecords] = useState<ComplaintRecord[]>([]);
  const [stages, setStages] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

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

    for (const record of records) {
      byUrgency[record.urgency] += 1;
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
        body: JSON.stringify({ complaint: text, mock: mockMode }),
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
        photos,
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
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        view={view}
        onViewChange={setView}
        counts={{ dashboard: 0, complaints: records.length, agencies: Object.keys(AGENCIES).length }}
      />

      <main className="min-w-0 flex-1 px-5 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {view === "dashboard" ? "Dashboard" : view === "complaints" ? "Complaints" : "Agency directory"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Intelligent public complaint &amp; service request triage for Malaysia
            </p>
          </div>
          <button type="button" onClick={() => setFormOpen(true)} className="btn-primary">
            <span className="text-base leading-none">+</span> New complaint
          </button>
        </header>

        <div className="mt-5 space-y-5">
          <MobileNav view={view} onViewChange={setView} />

          {view !== "agencies" ? (
            <div className="relative max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reference, agency, location…"
                className="input pl-9"
              />
            </div>
          ) : null}

          {notice ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>
          ) : null}

          {view === "dashboard" ? (
            <>
              <StatusSummary counts={counts} />

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                {active ? (
                  <>
                    <TriageResult record={active} />
                    <StatusTracker
                      record={{ ...active, status: STATUS_STAGES[activeStage] }}
                      stageIndex={activeStage}
                      onAdvance={() => setStage(active.id, Math.min(activeStage + 1, RESOLVED_STAGE))}
                      onReset={() => setStage(active.id, 1)}
                    />
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
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <ComplaintTable
                  records={filtered}
                  stages={stages}
                  activeId={activeId}
                  onSelect={(id) => setActiveId(id)}
                  title={`${filtered.length} complaint${filtered.length === 1 ? "" : "s"}`}
                />
                {active ? (
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
              {Object.values(AGENCIES).map((agency) => (
                <article key={agency.code} className="card">
                  <p className="text-sm font-semibold text-slate-900">{agency.code}</p>
                  <p className="text-xs text-slate-500">{agency.name}</p>
                  <p className="mt-3 text-sm text-slate-600">{agency.scope}</p>
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{agency.channel}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Complaints stay in this browser session — AduanAI falls back to a deterministic engine when the AI model is
          unavailable.
        </footer>
      </main>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-8">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">New complaint</h2>
                <p className="mt-1 text-sm text-slate-500">AduanAI structures it and routes it to the right agency.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              <ComplaintForm
                value={complaint}
                onChange={setComplaint}
                onSubmit={submit}
                loading={loading}
                mockMode={mockMode}
                onMockModeChange={setMockMode}
                error={error}
                photos={photos}
                onPhotosChange={setPhotos}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
    <section className="card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>

      {records.length === 0 ? (
        <p className="px-6 py-8 text-sm text-slate-500">No complaints match your search.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {records.map((record) => {
            const stage = stages[record.id] ?? 1;
            return (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => onSelect(record.id)}
                  className={`flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left transition ${
                    record.id === activeId ? "bg-blue-50/60" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-slate-900">{record.complaintType}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {record.agency}
                      </span>
                      {record.photos.length > 0 ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {record.photos.length} photo{record.photos.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
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
    <section className="card flex min-h-[16rem] flex-col items-center justify-center text-center">
      <p className="text-base font-semibold text-slate-900">No complaint triaged yet</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Lodge a complaint in Malay or English to see structured triage, agency routing, next steps and the markdown
        report.
      </p>
      <button type="button" onClick={onStart} className="btn-primary mt-5">
        New complaint
      </button>
    </section>
  );
}
