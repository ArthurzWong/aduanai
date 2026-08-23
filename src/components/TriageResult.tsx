"use client";

import { useMemo, useState } from "react";
import { toMarkdown } from "@/lib/markdown";
import type { ComplaintRecord } from "@/lib/types";
import { Field, SourceBadge, UrgencyBadge } from "./ui";

interface Props {
  record: ComplaintRecord;
}

export function TriageResult({ record }: Props) {
  const [tab, setTab] = useState<"triage" | "json" | "markdown">("triage");
  const [copied, setCopied] = useState<string | null>(null);

  const markdown = useMemo(() => toMarkdown(record), [record]);
  const json = useMemo(
    () =>
      JSON.stringify(
        {
          complaintType: record.complaintType,
          location: record.location,
          urgency: record.urgency,
          agency: record.agency,
          summary: record.summary,
          steps: record.steps,
          status: record.status,
          nextAction: record.nextAction,
        },
        null,
        2,
      ),
    [record],
  );

  async function copy(kind: "json" | "markdown") {
    const text = kind === "json" ? json : markdown;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${record.reference}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">Triage result</p>
          <h2 className="mt-1 text-xl font-semibold capitalize text-white">{record.complaintType} complaint</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge urgency={record.urgency} />
          <SourceBadge source={record.source} />
        </div>
      </div>

      <div className="mt-5 flex gap-1 rounded-xl border border-white/10 bg-slate-900/50 p-1 text-xs">
        {(["triage", "json", "markdown"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-3 py-2 font-medium capitalize transition ${
              tab === key ? "bg-sky-500 text-slate-950" : "text-slate-300 hover:text-white"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {tab === "triage" ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Location" value={record.location} />
            <Field label="Routed agency" value={record.agency} />
            <Field label="Status" value={record.status} />
          </div>

          <div>
            <p className="label">Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{record.summary}</p>
          </div>

          <div>
            <p className="label">Recommended steps</p>
            <ol className="mt-2 space-y-2">
              {record.steps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-xl border border-white/5 bg-slate-900/40 p-3 text-sm text-slate-200">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-200">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-4">
            <p className="label text-sky-200">Next action</p>
            <p className="mt-1 text-sm font-medium text-sky-50">{record.nextAction}</p>
          </div>
        </div>
      ) : null}

      {tab === "json" ? (
        <pre className="mt-5 max-h-96 overflow-auto rounded-xl border border-white/10 bg-slate-950/80 p-4 text-xs leading-relaxed text-emerald-200">
          {json}
        </pre>
      ) : null}

      {tab === "markdown" ? (
        <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/80 p-4 text-xs leading-relaxed text-slate-200">
          {markdown}
        </pre>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={download}
          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          Download markdown
        </button>
        <button
          type="button"
          onClick={() => copy("markdown")}
          className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:border-white/25 hover:text-white"
        >
          {copied === "markdown" ? "Copied!" : "Copy markdown"}
        </button>
        <button
          type="button"
          onClick={() => copy("json")}
          className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:border-white/25 hover:text-white"
        >
          {copied === "json" ? "Copied!" : "Copy JSON"}
        </button>
      </div>
    </section>
  );
}
