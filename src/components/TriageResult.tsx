"use client";

import { useMemo, useState } from "react";
import { toMarkdown } from "@/lib/markdown";
import { formatBytes } from "@/lib/photos";
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
    <section className="card animate-rise-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">{record.reference}</p>
          <h2 className="mt-1 font-display text-xl font-bold capitalize tracking-tight text-foreground">
            {record.complaintType} complaint
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge urgency={record.urgency} />
          <SourceBadge source={record.source} />
        </div>
      </div>

      <div className="mt-5 flex gap-1 rounded-xl bg-surface-muted p-1 text-xs">
        {([["triage", "Triage"], ["json", "JSON"], ["markdown", "Markdown"]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`flex-1 rounded-lg px-3 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 ${
              tab === key ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-ink-800"
            }`}
          >
            {label}
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
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{record.summary}</p>
          </div>

          <div>
            <p className="label">Recommended steps</p>
            <ol className="mt-2 space-y-2">
              {record.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-xl border border-line bg-surface-muted p-3 text-sm text-ink-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember-100 text-[10px] font-bold text-ember-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="label">Photo evidence</p>
            {record.photos.length > 0 ? (
              <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {record.photos.map((photo) => (
                  <li key={photo.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                    <a href={photo.dataUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="h-24 w-full object-cover transition hover:opacity-80"
                      />
                    </a>
                    <p className="truncate px-2 py-1 text-[10px] text-muted">
                      {photo.name} · {formatBytes(photo.size)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-xl border border-dashed border-line bg-surface-muted px-4 py-6 text-center text-xs text-muted">
                No photos attached to this complaint.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-ember-200 bg-ember-50 p-4">
            <p className="label text-ember-700">Next action</p>
            <p className="mt-1 text-sm font-medium text-ember-900">{record.nextAction}</p>
          </div>
        </div>
      ) : null}

      {tab === "json" ? (
        <pre className="mt-5 max-h-96 overflow-auto rounded-xl border border-ink-800 bg-ink-950 p-4 text-xs leading-relaxed text-ember-300">
          {json}
        </pre>
      ) : null}

      {tab === "markdown" ? (
        <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-surface-muted p-4 text-xs leading-relaxed text-ink-700">
          {markdown}
        </pre>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={download} className="btn-primary py-2 text-xs">
          Download markdown
        </button>
        <button type="button" onClick={() => copy("markdown")} className="btn-ghost py-2 text-xs">
          {copied === "markdown" ? "Copied!" : "Copy markdown"}
        </button>
        <button type="button" onClick={() => copy("json")} className="btn-ghost py-2 text-xs">
          {copied === "json" ? "Copied!" : "Copy JSON"}
        </button>
      </div>
    </section>
  );
}
