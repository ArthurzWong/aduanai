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
  const progress = Math.round((stageIndex / (STATUS_STAGES.length - 1)) * 100);

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">Status tracking</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{record.reference}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {agency.code} — {agency.name}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onAdvance} disabled={atEnd} className="btn-primary py-2 text-xs">
            Advance status
          </button>
          <button type="button" onClick={onReset} className="btn-ghost py-2 text-xs">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{progress}% through the workflow</p>
      </div>

      <ol className="mt-5 space-y-4">
        {STATUS_STAGES.map((stage, index) => {
          const done = index < stageIndex;
          const current = index === stageIndex;
          return (
            <li key={stage} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  done
                    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                    : current
                      ? "border-blue-200 bg-blue-100 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <div>
                <p
                  className={`text-sm font-medium ${
                    current ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {stage}
                </p>
                {current ? <p className="text-xs text-blue-600">Current stage</p> : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="label">Submission channel</p>
        <p className="mt-1 text-sm text-slate-800">{agency.channel}</p>
        <p className="mt-2 text-xs text-slate-500">{agency.scope}</p>
      </div>
    </section>
  );
}
