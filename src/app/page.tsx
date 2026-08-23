"use client";

import { useMemo, useState } from "react";
import { ComplaintForm } from "@/components/ComplaintForm";
import { StatusTracker, STATUS_STAGES } from "@/components/StatusTracker";
import { TriageResult } from "@/components/TriageResult";
import { UrgencyBadge } from "@/components/ui";
import { referenceFor } from "@/lib/markdown";
import type { ComplaintRecord, TriageResponse } from "@/lib/types";

const DEMO_COMPLAINT = "Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor.";

export default function Home() {
  const [complaint, setComplaint] = useState(DEMO_COMPLAINT);
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [records, setRecords] = useState<ComplaintRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(1);

  const active = useMemo(() => records.find((record) => record.id === activeId) ?? null, [records, activeId]);

  const stats = useMemo(() => {
    const urgent = records.filter((record) => record.urgency === "high" || record.urgency === "critical").length;
    const agencies = new Set(records.map((record) => record.agency));
    return { total: records.length, urgent, agencies: agencies.size };
  }, [records]);

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
      };

      setRecords((previous) => [record, ...previous]);
      setActiveId(record.id);
      setStageIndex(1);
      setNotice(payload.notice ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Triage failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-lg font-black text-slate-950">
              AI
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AduanAI</h1>
              <p className="text-sm text-slate-400">Intelligent Public Complaint &amp; Service Request Triage for Malaysia</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Complaints" value={stats.total} />
          <Stat label="High / critical" value={stats.urgent} />
          <Stat label="Agencies" value={stats.agencies} />
        </div>
      </header>

      {notice ? (
        <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{notice}</p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <ComplaintForm
            value={complaint}
            onChange={setComplaint}
            onSubmit={submit}
            loading={loading}
            mockMode={mockMode}
            onMockModeChange={setMockMode}
            error={error}
          />

          {records.length > 0 ? (
            <section className="card">
              <p className="label">Complaint queue</p>
              <ul className="mt-3 space-y-2">
                {records.map((record) => (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(record.id);
                        setStageIndex(1);
                      }}
                      className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left transition ${
                        record.id === activeId
                          ? "border-sky-400/50 bg-sky-400/10"
                          : "border-white/10 bg-slate-900/40 hover:border-white/25"
                      }`}
                    >
                      <span>
                        <span className="text-sm font-medium capitalize text-slate-100">{record.complaintType}</span>
                        <span className="block text-xs text-slate-400">
                          {record.reference} · {record.agency} · {record.location}
                        </span>
                      </span>
                      <UrgencyBadge urgency={record.urgency} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          {active ? (
            <>
              <TriageResult record={active} />
              <StatusTracker
                record={{ ...active, status: STATUS_STAGES[stageIndex] }}
                stageIndex={stageIndex}
                onAdvance={() => setStageIndex((index) => Math.min(index + 1, STATUS_STAGES.length - 1))}
                onReset={() => setStageIndex(1)}
              />
            </>
          ) : (
            <section className="card flex h-full min-h-[18rem] flex-col items-center justify-center text-center">
              <p className="text-base font-semibold text-white">No complaint triaged yet</p>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Pick a sample prompt or paste a complaint, then hit <span className="text-sky-300">Triage complaint</span> to
                see structured JSON, agency routing, next steps and markdown export.
              </p>
            </section>
          )}
        </div>
      </div>

      <footer className="mt-10 text-center text-xs text-slate-500">
        AduanAI runs a deterministic mock triage engine whenever the live model is unavailable, so demos never break.
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}
