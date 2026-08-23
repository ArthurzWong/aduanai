"use client";

import { useRef, useState } from "react";
import { SAMPLE_PROMPTS } from "@/lib/sample-prompts";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, formatBytes, readPhotos } from "@/lib/photos";
import type { ComplaintPhoto } from "@/lib/types";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  mockMode: boolean;
  onMockModeChange: (value: boolean) => void;
  error: string | null;
  photos: ComplaintPhoto[];
  onPhotosChange: (photos: ComplaintPhoto[]) => void;
}

export function ComplaintForm({
  value,
  onChange,
  onSubmit,
  loading,
  mockMode,
  onMockModeChange,
  error,
  photos,
  onPhotosChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const result = await readPhotos(Array.from(files), photos);
    setPhotoError(result.error);
    if (result.photos.length > 0) {
      onPhotosChange([...photos, ...result.photos]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label htmlFor="complaint" className="text-sm font-medium text-slate-800">
          What happened?
        </label>
        <p className="mt-1 text-xs text-slate-500">Write in Malay, English or a mix — AduanAI structures and routes it.</p>
        <textarea
          id="complaint"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          placeholder="Contoh: Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor."
          className="input mt-3 resize-none p-4"
        />
        <p className="mt-2 text-xs text-slate-400">
          {value.trim().length} characters · {photos.length} photo{photos.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Photo evidence</p>
            <p className="mt-1 text-xs text-slate-500">
              Attach up to {MAX_PHOTOS} photos ({formatBytes(MAX_PHOTO_BYTES)} each) to substantiate the complaint.
            </p>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={photos.length >= MAX_PHOTOS} className="btn-ghost py-2 text-xs">
            Upload photos
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void addFiles(event.target.files)}
        />

        {photos.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <li key={photo.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.dataUrl} alt={photo.name} className="h-24 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onPhotosChange(photos.filter((item) => item.id !== photo.id))}
                  aria-label={`Remove ${photo.name}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-slate-600 shadow transition hover:bg-rose-500 hover:text-white"
                >
                  ×
                </button>
                <p className="truncate px-2 py-1 text-[10px] text-slate-500">
                  {photo.name} · {formatBytes(photo.size)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {photoError ? <p className="mt-3 text-xs text-amber-600">{photoError}</p> : null}
      </div>

      <div>
        <p className="label">Sample complaints</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => onChange(prompt.text)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50/40"
            >
              <p className="text-sm font-medium text-slate-800">{prompt.label}</p>
              <p className="mt-1 text-xs text-slate-500">{prompt.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={mockMode}
            onChange={(event) => onMockModeChange(event.target.checked)}
            className="h-3.5 w-3.5 accent-blue-600"
          />
          Force demo mock mode
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onChange("");
              onPhotosChange([]);
              setPhotoError(null);
            }}
            className="btn-ghost"
          >
            Clear
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Triaging…" : "Triage complaint"}
          </button>
        </div>
      </div>
    </form>
  );
}
