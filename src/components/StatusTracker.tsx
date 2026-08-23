"use client";

import { agencyInfo } from "@/lib/agencies";
import type { ComplaintRecord } from "@/lib/types";

export const STATUS_STAGES = [
  "Received",
  "Triaged by AI",
  "Routed to agency",
  "Agency in progress",
  "Resolved",
] as const;

interface Props {
  record: ComplaintRecord;
  stageIndex: number;
  onAdvance: () => void;
  onReset: () => void;
}

export function StatusTracker({ record, stageIndex, onAdvance, onReset }: Props) {
  const agency = agencyInfo(record.agency);
  const atEnd = stageIndex >= STATUS_STAGES.length - 1;

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">Status tracking</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{record.reference}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {agency.code} — {agency.name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAdvance}
            disabled={atEnd}
            className="rounded-xl bg-emerald-500/90 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Advance status
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:border-white/25 hover:text-white"
          >
            Reset
          </button>
        </div>
      </div>

      <ol className="mt-6 space-y-4">
        {STATUS_STAGES.map((stage, index) => {
          const done = index < stageIndex;
          const current = index === stageIndex;
          return (
            <li key={stage} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  done
                    ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-200"
                    : current
                      ? "border-sky-400/60 bg-sky-400/20 text-sky-200"
                      : "border-white/10 bg-slate-900/60 text-slate-500"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <div>
                <p className={`text-sm font-medium ${current ? "text-white" : done ? "text-slate-300" : "text-slate-500"}`}>
                  {stage}
                </p>
                {current ? <p className="text-xs text-sky-300/80">Current stage</p> : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/40 p-4">
        <p className="label">Submission channel</p>
        <p className="mt-1 text-sm text-slate-200">{agency.channel}</p>
        <p className="mt-2 text-xs text-slate-400">{agency.scope}</p>
      </div>
    </section>
  );
}
