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
  { key: "open", label: "Open", bar: "bg-rose-100 text-rose-900" },
  { key: "inProgress", label: "In progress", bar: "bg-indigo-100 text-indigo-900" },
  { key: "resolved", label: "Resolved", bar: "bg-emerald-100 text-emerald-900" },
];

const URGENCY_TILES: Record<Urgency, string> = {
  critical: "bg-rose-50 text-rose-600",
  high: "bg-orange-50 text-orange-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-emerald-50 text-emerald-600",
};

export function StatusSummary({ counts }: { counts: SummaryCounts }) {
  const total = counts.open + counts.inProgress + counts.resolved;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Status wise summary</h2>
        <p className="text-xs text-slate-500">{total} complaint{total === 1 ? "" : "s"} this session</p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <div className="card space-y-3">
          {STATUS_ROWS.map((row) => {
            const value = counts[row.key];
            const width = total === 0 ? 0 : Math.max(12, Math.round((value / total) * 100));
            return (
              <div key={row.key} className="relative overflow-hidden rounded-xl bg-slate-50">
                <div className={`absolute inset-y-0 left-0 ${row.bar.split(" ")[0]}`} style={{ width: `${width}%` }} />
                <div className="relative flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-slate-800">{row.label}</span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-900">{value}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {URGENCIES.slice()
            .reverse()
            .map((urgency) => (
              <div key={urgency} className="card p-4">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold uppercase ${URGENCY_TILES[urgency]}`}
                >
                  {urgency.slice(0, 1)}
                </span>
                <p className="mt-3 text-xs capitalize text-slate-500">{urgency} urgency</p>
                <p className="text-2xl font-bold text-slate-900">{counts.byUrgency[urgency]}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
