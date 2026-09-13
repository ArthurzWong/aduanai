"use client";

import { useState } from "react";
import { DEFAULT_AI_SETTINGS, type AiSettings } from "@/lib/settings";

interface Props {
  settings: AiSettings;
  onSave: (settings: AiSettings) => void;
  onClose: () => void;
}

const SAMPLE = "Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor.";

export function AiSettingsPanel({ settings, onSave, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [offline, setOffline] = useState(settings.offline);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: SAMPLE, mock: false, enrich: false, apiKey, model, baseUrl }),
      });
      const payload = (await response.json()) as { source?: string; notice?: string; error?: string };
      if (!response.ok) {
        setTestResult({ ok: false, message: payload.error ?? `Request failed (${response.status}).` });
      } else if (payload.source === "live") {
        setTestResult({ ok: true, message: "Live model responded. Triage is running live." });
      } else {
        setTestResult({ ok: false, message: payload.notice ?? "The live model did not respond." });
      }
    } catch (error) {
      setTestResult({
        ok: false,
        message: error instanceof Error ? error.message : "Could not reach the triage endpoint.",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm sm:p-8">
      <div className="w-full max-w-xl rounded-3xl border border-line bg-surface p-6 shadow-lift">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">AI settings</h2>
            <p className="mt-1 text-sm text-muted">
              AduanAI triages with a live model when a key is available. Your key is stored in this browser only and is
              never written to our servers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI settings"
            className="rounded-full p-2 text-ink-400 transition hover:bg-surface-muted hover:text-ink-700"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="ai-key" className="text-sm font-medium text-ink-800">
              API key
            </label>
            <input
              id="ai-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-…"
              className="input mt-2 font-mono"
            />
            <p className="mt-1 text-xs text-muted">Any OpenAI-compatible provider key works.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ai-model" className="text-sm font-medium text-ink-800">
                Model
              </label>
              <input
                id="ai-model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="gpt-4o-mini"
                className="input mt-2"
              />
            </div>
            <div>
              <label htmlFor="ai-base" className="text-sm font-medium text-ink-800">
                Base URL
              </label>
              <input
                id="ai-base"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder="https://api.openai.com/v1"
                className="input mt-2"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-muted p-4">
            <input
              type="checkbox"
              checked={offline}
              onChange={(event) => setOffline(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-ember-500"
            />
            <span>
              <span className="text-sm font-medium text-ink-800">Offline rule engine</span>
              <span className="mt-0.5 block text-xs text-muted">
                Skip the live model entirely and use the built-in deterministic engine. Useful on stage or without
                internet.
              </span>
            </span>
          </label>

          {testResult ? (
            <p
              role="status"
              className={`rounded-xl border px-4 py-3 text-sm ${
                testResult.ok
                  ? "border-palm-100 bg-palm-50 text-palm-700"
                  : "border-ember-200 bg-ember-50 text-ember-800"
              }`}
            >
              {testResult.message}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => {
              setApiKey("");
              setModel(DEFAULT_AI_SETTINGS.model);
              setBaseUrl(DEFAULT_AI_SETTINGS.baseUrl);
              setOffline(false);
              setTestResult(null);
            }}
            className="btn-ghost py-2 text-xs"
          >
            Reset fields
          </button>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={testConnection} disabled={testing} className="btn-ghost py-2 text-xs">
              {testing ? "Testing…" : "Test connection"}
            </button>
            <button
              type="button"
              onClick={() => onSave({ apiKey, model, baseUrl, offline, onboarded: true })}
              className="btn-primary py-2 text-xs"
            >
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
