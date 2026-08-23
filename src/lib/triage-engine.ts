import type { Triage, Urgency } from "./types";

interface Rule {
  complaintType: string;
  agency: string;
  urgency: Urgency;
  keywords: string[];
  steps: string[];
  nextAction: string;
}

const RULES: Rule[] = [
  {
    complaintType: "infrastructure",
    agency: "DBKL",
    urgency: "high",
    keywords: [
      "lubang",
      "pothole",
      "jalan rosak",
      "jalan berlubang",
      "road damage",
      "cracked road",
      "turapan",
      "bonggol",
      "kerb",
      "bumpy road",
      "sinkhole",
    ],
    steps: [
      "Log the pothole report with exact road name, direction of travel and nearest landmark.",
      "Attach photos plus a GPS pin so the maintenance crew can locate the defect.",
      "Route the ticket to the city council road maintenance unit for inspection within 24 hours.",
      "Request temporary hazard cones or warning signage while the permanent repair is scheduled.",
      "Track the repair ticket and confirm resurfacing once the crew closes the job.",
    ],
    nextAction: "Submit the report to DBKL road maintenance and request temporary hazard signage today.",
  },
  {
    complaintType: "street lighting",
    agency: "DBKL",
    urgency: "medium",
    keywords: ["lampu jalan", "street light", "streetlight", "lampu gelap", "lighting out", "lampu tidak menyala"],
    steps: [
      "Record the lamp pole number and street name from the nearest pole plate.",
      "Report the faulty lighting to the council lighting unit for a technician visit.",
      "Escalate to the electricity utility if the fault is on the supply cable side.",
      "Confirm restoration after the scheduled maintenance round.",
    ],
    nextAction: "Report the lamp pole number to the council lighting unit for technician dispatch.",
  },
  {
    complaintType: "waste management",
    agency: "SWCorp",
    urgency: "medium",
    keywords: [
      "sampah",
      "rubbish",
      "garbage",
      "tong sampah",
      "illegal dumping",
      "pembuangan haram",
      "busuk",
      "smelly",
      "waste",
    ],
    steps: [
      "Capture photos of the dumping site and note how long it has been uncollected.",
      "File the complaint with the solid waste operator for the collection zone.",
      "Ask for a special clean-up run if the pile is blocking a walkway or drain.",
      "Request enforcement patrols if illegal dumping is recurring.",
    ],
    nextAction: "File a collection request with SWCorp and ask for a special clean-up run.",
  },
  {
    complaintType: "water supply",
    agency: "Air Selangor",
    urgency: "high",
    keywords: [
      "air tak keluar",
      "no water",
      "water supply",
      "paip pecah",
      "burst pipe",
      "air kotor",
      "dirty water",
      "tekanan air",
      "water pressure",
    ],
    steps: [
      "Note the affected address, number of households and how long supply has been down.",
      "Check the utility outage notice board for planned maintenance in the area.",
      "Lodge a supply disruption ticket with the water operator careline.",
      "Request water tanker support if the disruption exceeds 24 hours.",
      "Confirm restoration and report any discoloured water afterwards.",
    ],
    nextAction: "Lodge a supply disruption ticket with Air Selangor and request tanker support if needed.",
  },
  {
    complaintType: "sewerage",
    agency: "IWK",
    urgency: "high",
    keywords: ["najis", "sewage", "kumbahan", "manhole", "longkang tersumbat", "sewer", "septic"],
    steps: [
      "Photograph the overflow point and note any manhole identification number.",
      "Cordon off the area to keep residents and children away from contamination.",
      "Report the overflow to the sewerage operator careline as a health hazard.",
      "Request sanitisation of the affected area after the blockage is cleared.",
    ],
    nextAction: "Report the overflow to IWK as a public health hazard and request same-day clearance.",
  },
  {
    complaintType: "flooding",
    agency: "DBKL",
    urgency: "critical",
    keywords: ["banjir", "flood", "flash flood", "air melimpah", "drain overflow", "longkang melimpah"],
    steps: [
      "Report the flood location, water depth and affected access roads immediately.",
      "Alert residents to move vehicles and valuables to higher ground.",
      "Notify the council drainage and disaster response unit for pump deployment.",
      "Request drain desilting and a flood mitigation assessment for the area.",
      "Document damage with photos for follow-up assistance claims.",
    ],
    nextAction: "Escalate to the council drainage and disaster unit now for pump deployment.",
  },
  {
    complaintType: "electricity",
    agency: "TNB",
    urgency: "high",
    keywords: ["bekalan elektrik", "power outage", "blackout", "elektrik terputus", "kabel", "exposed wire", "wayar"],
    steps: [
      "Record the affected address and whether neighbouring houses are also without supply.",
      "Keep clear of any exposed or sparking cables and warn passers-by.",
      "Report the outage or hazard to the utility careline for emergency dispatch.",
      "Confirm restoration time and log the reference number.",
    ],
    nextAction: "Call the TNB careline to report the fault and request emergency dispatch.",
  },
  {
    complaintType: "public safety",
    agency: "PDRM",
    urgency: "critical",
    keywords: ["pecah rumah", "robbery", "snatch", "gangster", "bahaya jenayah", "crime", "racing", "lumba haram"],
    steps: [
      "If anyone is in immediate danger, call 999 before filing an online report.",
      "Record the time, location and description of the incident or suspects.",
      "Lodge a police report at the nearest station for a case reference.",
      "Request increased patrols for the affected neighbourhood.",
    ],
    nextAction: "Lodge a police report at the nearest station and request patrol coverage.",
  },
  {
    complaintType: "public transport",
    agency: "JPJ",
    urgency: "medium",
    keywords: ["bas", "bus", "teksi", "taxi", "grab", "lrt", "mrt", "komuter", "reckless driver", "pemandu"],
    steps: [
      "Note the vehicle registration number, route and time of the incident.",
      "Collect any photo, video or ticket evidence available.",
      "Submit the report to the road transport authority for enforcement.",
      "Follow up on the enforcement outcome with the case reference.",
    ],
    nextAction: "Submit the vehicle details and evidence to JPJ for enforcement action.",
  },
  {
    complaintType: "public health",
    agency: "KKM",
    urgency: "high",
    keywords: ["denggi", "dengue", "aedes", "food poisoning", "keracunan", "kebersihan makanan", "restoran kotor"],
    steps: [
      "Note the exact premises or breeding site and the number of people affected.",
      "Report to the district health office for inspection and fogging or sampling.",
      "Preserve any food samples or receipts as evidence.",
      "Follow up on the inspection result and enforcement notice.",
    ],
    nextAction: "Report to the district health office for inspection and follow-up action.",
  },
  {
    complaintType: "environment",
    agency: "DOE",
    urgency: "medium",
    keywords: ["pencemaran", "pollution", "open burning", "bakar terbuka", "asap", "smoke", "bunyi bising", "noise", "sungai tercemar"],
    steps: [
      "Record the source, time pattern and severity of the pollution.",
      "Capture photos or short videos as supporting evidence.",
      "Lodge a pollution complaint with the environment department.",
      "Request monitoring visits if the nuisance is recurring.",
    ],
    nextAction: "Lodge a pollution complaint with the Department of Environment with photo evidence.",
  },
];

const CRITICAL_HINTS = [
  "kemalangan",
  "accident",
  "maut",
  "death",
  "cedera parah",
  "life threatening",
  "kebakaran",
  "fire",
  "runtuh",
  "collapse",
  "emergency",
  "kecemasan",
];

const HIGH_HINTS = [
  "bahaya",
  "danger",
  "dangerous",
  "risiko",
  "urgent",
  "segera",
  "besar",
  "serious",
  "motosikal",
  "motor",
  "kanak-kanak",
  "children",
  "sekolah",
  "hospital",
];

const LOCATION_HINTS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bklcc\b/i, label: "Kuala Lumpur" },
  { pattern: /\bkuala lumpur\b|\bk\.?l\.?\b/i, label: "Kuala Lumpur" },
  { pattern: /\bpetaling jaya\b|\bpj\b/i, label: "Petaling Jaya, Selangor" },
  { pattern: /\bshah alam\b/i, label: "Shah Alam, Selangor" },
  { pattern: /\bsubang\b/i, label: "Subang, Selangor" },
  { pattern: /\bcheras\b/i, label: "Cheras, Kuala Lumpur" },
  { pattern: /\bpenang\b|\bpulau pinang\b/i, label: "Pulau Pinang" },
  { pattern: /\bjohor\b/i, label: "Johor" },
  { pattern: /\bipoh\b/i, label: "Ipoh, Perak" },
];

const ROAD_PATTERN =
  /\b(?:jalan|jln|lebuhraya|lebuh|persiaran|lorong|taman|kampung|kg|bandar|seksyen|presint)(?:\s+[A-Za-z0-9./'-]+){1,3}/i;

/** Words that end a road name when scanning forward from the road prefix. */
const ROAD_STOPWORDS = new Set([
  "dekat",
  "near",
  "depan",
  "hadapan",
  "berhadapan",
  "opposite",
  "di",
  "ke",
  "dan",
  "atau",
  "yang",
  "sangat",
  "amat",
  "bahaya",
  "ada",
  "tak",
  "tidak",
  "dah",
  "sudah",
  "sejak",
  "ni",
  "itu",
  "kawasan",
  "and",
  "the",
  "have",
  "has",
  "been",
  "for",
  "with",
  "out",
  "is",
  "are",
  "along",
  "at",
  "in",
]);

const LANDMARK_SKIP = new Set(["rumah", "di", "sini", "sana", "situ", "kawasan", "tempat", "area", "my", "the"]);

function normalise(text: string): string {
  return text.toLowerCase();
}

function stripCityPhrases(text: string): string {
  return LOCATION_HINTS.reduce((current, hint) => current.replace(new RegExp(hint.pattern.source, "gi"), ","), text);
}

function extractRoad(text: string): string | null {
  const match = stripCityPhrases(text).match(ROAD_PATTERN);
  if (!match) return null;

  const [prefix, ...rest] = match[0].trim().replace(/\s+/g, " ").split(" ");
  const kept: string[] = [];
  for (const token of rest) {
    const clean = token.replace(/[.,;:]+$/, "");
    if (!clean || ROAD_STOPWORDS.has(clean.toLowerCase())) break;
    kept.push(clean);
  }
  if (kept.length === 0) return null;
  return titleCase([prefix, ...kept].join(" "));
}

function extractLandmark(text: string): string | null {
  const match = text.match(/\b(?:dekat|near|berhadapan|opposite)\s+([A-Za-z0-9][A-Za-z0-9\s./'-]{1,30})/i);
  if (!match) return null;

  const kept: string[] = [];
  for (const token of match[1].trim().split(/\s+/)) {
    const clean = token.replace(/[.,;:]+$/, "");
    if (!clean || LANDMARK_SKIP.has(clean.toLowerCase()) || ROAD_STOPWORDS.has(clean.toLowerCase())) break;
    kept.push(clean);
    if (kept.length === 3) break;
  }
  if (kept.length === 0) return null;
  return titleCase(kept.join(" "));
}

export function extractLocation(text: string): string {
  const parts: string[] = [];

  const road = extractRoad(text);
  if (road) parts.push(road);

  const landmark = extractLandmark(text);
  if (landmark && !parts.some((part) => part.toLowerCase().includes(landmark.toLowerCase()))) {
    parts.push(`near ${landmark}`);
  }

  const city = LOCATION_HINTS.find((hint) => hint.pattern.test(text));
  if (city && !parts.some((part) => part.toLowerCase().includes(city.label.split(",")[0].toLowerCase()))) {
    parts.push(city.label);
  }

  return parts.length > 0 ? parts.join(", ") : "Location not specified";
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => {
      if (/\d/.test(word) || word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function pickAgency(rule: Rule, text: string): string {
  const inKL = /\bklcc\b|\bkuala lumpur\b|\bk\.?l\.?\b|\bbukit bintang\b|\bcheras\b|\bsetapak\b|\bwangsa maju\b/i.test(text);
  if (rule.agency === "DBKL" && !inKL) {
    return /\blebuhraya\b|\bhighway\b|\bfederal\b/i.test(text) ? "JKR" : "Local Council";
  }
  return rule.agency;
}

function escalate(urgency: Urgency, text: string): Urgency {
  const lower = normalise(text);
  if (CRITICAL_HINTS.some((hint) => lower.includes(hint))) return "critical";
  if (urgency === "low" && HIGH_HINTS.some((hint) => lower.includes(hint))) return "medium";
  if (urgency === "medium" && HIGH_HINTS.some((hint) => lower.includes(hint))) return "high";
  return urgency;
}

function scoreRule(rule: Rule, lower: string): number {
  return rule.keywords.reduce((score, keyword) => (lower.includes(keyword) ? score + keyword.length : score), 0);
}

const GENERIC_RULE: Rule = {
  complaintType: "general public service",
  agency: "Local Council",
  urgency: "medium",
  keywords: [],
  steps: [
    "Clarify the exact location, date and impact of the issue with the complainant.",
    "Collect supporting photos or documents before submission.",
    "Submit the complaint to the local council one-stop complaint counter.",
    "Record the reference number and follow up within five working days.",
  ],
  nextAction: "Submit the complaint to the local council complaint counter and record the reference number.",
};

/**
 * Deterministic rule-based triage used for the mock fallback mode and as a
 * safety net whenever the live model is unavailable or returns bad data.
 */
export function triageWithRules(input: string): Triage {
  const text = input.trim();
  const lower = normalise(text);

  const ranked = RULES.map((rule) => ({ rule, score: scoreRule(rule, lower) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const rule = ranked[0]?.rule ?? GENERIC_RULE;
  const urgency = escalate(rule.urgency, text);
  const location = extractLocation(text);
  const agency = pickAgency(rule, text);

  return {
    complaintType: rule.complaintType,
    location,
    urgency,
    agency,
    summary: buildSummary(rule.complaintType, location, urgency, text),
    steps: rule.steps,
    status: "Received — triaged and ready for submission",
    nextAction: rule.nextAction,
  };
}

function buildSummary(complaintType: string, location: string, urgency: Urgency, text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const snippet = trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
  return `${urgency.toUpperCase()} priority ${complaintType} complaint at ${location}. Reported: "${snippet}"`;
}
