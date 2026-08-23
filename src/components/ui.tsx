import type { Urgency } from "@/lib/types";

const URGENCY_STYLES: Record<Urgency, string> = {
  low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  high: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  critical: "border-rose-400/40 bg-rose-500/15 text-rose-200",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${URGENCY_STYLES[urgency]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {urgency}
    </span>
  );
}

export function SourceBadge({ source }: { source: "live" | "mock" }) {
  const live = source === "live";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
        live
          ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
          : "border-slate-400/20 bg-slate-400/10 text-slate-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-sky-300" : "bg-slate-400"}`} />
      {live ? "Live AI" : "Mock fallback"}
    </span>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <p className="label">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
