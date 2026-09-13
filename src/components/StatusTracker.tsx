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
    <section className="card animate-rise-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">Status tracking</p>
          <h2 className="mt-1 font-display text-lg font-bold tracking-tight text-foreground">{record.reference}</h2>
          <p className="mt-1 text-sm text-muted">
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
        <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-ember-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{progress}% through the workflow</p>
      </div>

      <ol className="relative mt-5 space-y-4">
        <span className="absolute bottom-3 left-3 top-3 w-px bg-line" aria-hidden />
        {STATUS_STAGES.map((stage, index) => {
          const done = index < stageIndex;
          const current = index === stageIndex;
          return (
            <li key={stage} className="relative flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  done
                    ? "border-palm-100 bg-palm-50 text-palm-700"
                    : current
                      ? "border-ember-200 bg-ember-100 text-ember-700"
                      : "border-line bg-surface-muted text-ink-500"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <div>
                <p
                  className={`text-sm font-medium ${
                    current ? "text-foreground" : done ? "text-ink-700" : "text-ink-500"
                  }`}
                >
                  {stage}
                </p>
                {current ? <p className="text-xs text-ember-600">Current stage</p> : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-xl border border-line bg-surface-muted p-4">
        <p className="label">Submission channel</p>
        <p className="mt-1 text-sm text-ink-800">{agency.channel}</p>
        <p className="mt-2 text-xs text-muted">{agency.scope}</p>
      </div>
    </section>
  );
}
