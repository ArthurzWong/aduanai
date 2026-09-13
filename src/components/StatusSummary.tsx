"use client";

import type { Urgency } from "@/lib/types";
import { URGENCIES } from "@/lib/types";

export interface SummaryCounts {
  open: number;
  inProgress: number;
  resolved: number;
  byUrgency: Record<Urgency, number>;
  agencies: number;
  photos: number;
}

const STATUS_ROWS: { key: keyof Pick<SummaryCounts, "open" | "inProgress" | "resolved">; label: string; bar: string }[] = [
  { key: "open", label: "Open", bar: "bg-red-100" },
  { key: "inProgress", label: "In progress", bar: "bg-ember-100" },
  { key: "resolved", label: "Resolved", bar: "bg-palm-100" },
];

const URGENCY_TILES: Record<Urgency, string> = {
  critical: "bg-red-50 text-red-600",
  high: "bg-ember-50 text-ember-600",
  medium: "bg-gold-100 text-gold-700",
  low: "bg-palm-50 text-palm-700",
};

export function StatusSummary({ counts }: { counts: SummaryCounts }) {
  const total = counts.open + counts.inProgress + counts.resolved;

  return (
    <section className="animate-rise-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Status-wise summary</h2>
        <p className="text-xs text-muted">This browser session</p>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <div className="card space-y-3">
          {STATUS_ROWS.map((row) => {
            const value = counts[row.key];
            const width = total === 0 || value === 0 ? 0 : Math.max(12, Math.round((value / total) * 100));
            return (
              <div key={row.key} className="relative overflow-hidden rounded-xl bg-surface-muted">
                <div className={`absolute inset-y-0 left-0 ${row.bar}`} style={{ width: `${width}%` }} />
                <div className="relative flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-ink-800">{row.label}</span>
                  <span className="rounded-full bg-surface/85 px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
                    {value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">
          {URGENCIES.slice()
            .reverse()
            .map((urgency, index) => (
              <div
                key={urgency}
                className="card animate-rise-in p-4"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold uppercase ${URGENCY_TILES[urgency]}`}
                >
                  {urgency.slice(0, 1)}
                </span>
                <p className="mt-3 text-xs capitalize text-muted">{urgency} urgency</p>
                <p className="font-display text-2xl font-bold text-foreground">{counts.byUrgency[urgency]}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
