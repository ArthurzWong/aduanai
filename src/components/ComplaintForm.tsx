"use client";

import { SAMPLE_PROMPTS } from "@/lib/sample-prompts";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  mockMode: boolean;
  onMockModeChange: (value: boolean) => void;
  error: string | null;
}

export function ComplaintForm({
  value,
  onChange,
  onSubmit,
  loading,
  mockMode,
  onMockModeChange,
  error,
}: Props) {
  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Lodge a complaint</h2>
          <p className="mt-1 text-sm text-slate-400">
            Write in Malay, English or a mix. AduanAI extracts the structure and routes it.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={mockMode}
            onChange={(event) => onMockModeChange(event.target.checked)}
            className="h-3.5 w-3.5 accent-sky-400"
          />
          Demo mock mode
        </label>
      </div>

      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          placeholder="Contoh: Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor."
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Triaging…" : "Triage complaint"}
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/25 hover:text-white"
          >
            Clear
          </button>
          <span className="text-xs text-slate-500">{value.trim().length} characters</span>
        </div>
      </form>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
      ) : null}

      <div className="mt-6">
        <p className="label">Sample prompts</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => onChange(prompt.text)}
              className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-left transition hover:border-sky-400/40 hover:bg-slate-900/70"
            >
              <p className="text-sm font-medium text-slate-100">{prompt.label}</p>
              <p className="mt-1 text-xs text-slate-400">{prompt.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
