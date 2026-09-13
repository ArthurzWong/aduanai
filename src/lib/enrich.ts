import type { Enrichment, Triage, WeatherContext } from "./types";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_MS = 6_000;
const CACHE_TTL_MS = 30 * 60 * 1000;

const cache = new Map<string, { at: number; value: Enrichment | null }>();

const WMO_SUMMARY: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "depositing rime fog",
  51: "light drizzle",
  53: "drizzle",
  55: "dense drizzle",
  56: "light freezing drizzle",
  57: "freezing drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  66: "light freezing rain",
  67: "freezing rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  80: "light rain showers",
  81: "rain showers",
  82: "violent rain showers",
  85: "snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "thunderstorm with heavy hail",
};

/** Complaint types where local rainfall is meaningful supporting context. */
export function isWeatherRelevant(complaintType: string): boolean {
  const type = complaintType.toLowerCase();
  return ["flood", "water", "drain", "sewer", "waste", "infrastructure", "environment"].some((key) =>
    type.includes(key),
  );
}

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`request failed with status ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Build progressively broader search terms from a free-text location. */
function locationCandidates(location: string): string[] {
  const parts = location
    .split(/,|\bnear\b|\bdekat\b|\bat\b|\bberhampiran\b/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 2);
  const candidates: string[] = [];
  for (let index = 0; index < parts.length && candidates.length < 4; index += 1) {
    candidates.push(parts.slice(index).join(", "));
  }
  if (parts.length > 1) candidates.push(parts[parts.length - 1]);
  return Array.from(new Set(candidates));
}

interface GeocodeHit {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

async function geocode(location: string): Promise<GeocodeHit | null> {
  for (const candidate of locationCandidates(location)) {
    try {
      const payload = (await getJson(
        `${GEOCODE_URL}?name=${encodeURIComponent(candidate)}&count=1&language=en&format=json`,
      )) as { results?: GeocodeHit[] };
      const hit = payload.results?.[0];
      if (hit) return hit;
    } catch {
      // try the next, broader candidate
    }
  }
  return null;
}

async function weatherFor(latitude: number, longitude: number): Promise<WeatherContext | null> {
  try {
    const payload = (await getJson(
      `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,precipitation,weather_code` +
        `&daily=precipitation_sum&timezone=Asia%2FKuala_Lumpur&forecast_days=1`,
    )) as {
      current?: { temperature_2m?: number; precipitation?: number; weather_code?: number };
      daily?: { precipitation_sum?: number[] };
    };
    const code = payload.current?.weather_code ?? 0;
    const rainToday = payload.daily?.precipitation_sum?.[0] ?? null;
    return {
      summary: WMO_SUMMARY[code] ?? "conditions unavailable",
      temperatureC: payload.current?.temperature_2m ?? null,
      precipitationMm: payload.current?.precipitation ?? 0,
      rainTodayMm: rainToday,
      source: "Open-Meteo",
    };
  } catch {
    return null;
  }
}

/**
 * Resolve a free-text complaint location to coordinates and (where relevant)
 * current local weather. Uses keyless public open-data endpoints.
 */
export async function enrichLocation(location: string, complaintType: string): Promise<Enrichment | null> {
  const query = location.trim();
  if (query.length < 3) return null;

  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  let value: Enrichment | null = null;
  try {
    const hit = await geocode(query);
    if (hit) {
      const resolved = [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ");
      const weather = isWeatherRelevant(complaintType) ? await weatherFor(hit.latitude, hit.longitude) : null;
      value = {
        query,
        resolved,
        country: hit.country ?? null,
        latitude: hit.latitude,
        longitude: hit.longitude,
        mapUrl: `https://www.openstreetmap.org/?mlat=${hit.latitude}&mlon=${hit.longitude}#map=16/${hit.latitude}/${hit.longitude}`,
        weather,
        source: "Open-Meteo geocoding",
      };
    }
  } catch {
    value = null;
  }

  cache.set(query, { at: Date.now(), value });
  return value;
}

export async function enrichTriage(triage: Triage): Promise<Enrichment | null> {
  try {
    return await enrichLocation(triage.location, triage.complaintType);
  } catch {
    return null;
  }
}
