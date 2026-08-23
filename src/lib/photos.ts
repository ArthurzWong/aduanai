import type { ComplaintPhoto } from "./types";

export const MAX_PHOTOS = 4;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export async function readPhotos(
  files: File[],
  existing: ComplaintPhoto[],
): Promise<{ photos: ComplaintPhoto[]; error: string | null }> {
  const photos: ComplaintPhoto[] = [];
  const rejected: string[] = [];
  let slots = MAX_PHOTOS - existing.length;

  for (const file of files) {
    if (slots <= 0) {
      rejected.push(`${file.name} (max ${MAX_PHOTOS} photos)`);
      continue;
    }
    if (!file.type.startsWith("image/")) {
      rejected.push(`${file.name} (not an image)`);
      continue;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      rejected.push(`${file.name} (over ${formatBytes(MAX_PHOTO_BYTES)})`);
      continue;
    }

    try {
      photos.push({
        id: `${Date.now()}-${file.name}-${file.size}`,
        name: file.name,
        size: file.size,
        dataUrl: await readAsDataUrl(file),
      });
      slots -= 1;
    } catch {
      rejected.push(`${file.name} (unreadable)`);
    }
  }

  return { photos, error: rejected.length ? `Skipped ${rejected.join(", ")}.` : null };
}
