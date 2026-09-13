import type { ReactNode } from "react";
import type { Urgency } from "@/lib/types";

// Warm urgency ramp: reserved green for low, gold -> ember -> crimson as severity rises.
const URGENCY_STYLES: Record<Urgency, string> = {
  low: "border-palm-100 bg-palm-100/70 text-palm-700",
  medium: "border-gold-300 bg-gold-100 text-gold-700",
  high: "border-ember-300 bg-ember-100 text-ember-800",
  critical: "border-red-200 bg-red-100 text-red-800",
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${URGENCY_STYLES[urgency]}`}
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
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium ${
        live ? "border-ember-200 bg-ember-50 text-ember-700" : "border-line bg-surface-muted text-ink-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-ember-500" : "bg-ink-400"}`} />
      {live ? "Live AI" : "Mock fallback"}
    </span>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-muted p-4">
      <p className="label">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ember" | "dark";
}) {
  const tones: Record<"neutral" | "ember" | "dark", string> = {
    neutral: "border-line bg-surface text-ink-600",
    ember: "border-ember-200 bg-ember-50 text-ember-700",
    dark: "border-white/15 bg-white/[0.06] text-ink-100",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
