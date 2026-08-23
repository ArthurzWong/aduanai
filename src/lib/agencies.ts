export interface Agency {
  code: string;
  name: string;
  scope: string;
  channel: string;
}

export const AGENCIES: Record<string, Agency> = {
  DBKL: {
    code: "DBKL",
    name: "Dewan Bandaraya Kuala Lumpur",
    scope: "Roads, potholes, drainage, street lighting and public cleanliness in Kuala Lumpur",
    channel: "Portal Aduan DBKL / talian 03-2617 9999",
  },
  JKR: {
    code: "JKR",
    name: "Jabatan Kerja Raya",
    scope: "Federal and state road maintenance outside city council boundaries",
    channel: "MyJalan app / talian JKR 03-2610 8888",
  },
  IWK: {
    code: "IWK",
    name: "Indah Water Konsortium",
    scope: "Sewerage overflow, manhole and treatment plant issues",
    channel: "IWK Careline 1800-88-9111",
  },
  SWCorp: {
    code: "SWCorp",
    name: "Solid Waste Management Corporation",
    scope: "Uncollected rubbish, illegal dumping, public cleansing contractors",
    channel: "SWCorp hotline 1-800-88-7472",
  },
  "Air Selangor": {
    code: "Air Selangor",
    name: "Pengurusan Air Selangor",
    scope: "Water supply disruption, burst pipes, low pressure and water quality",
    channel: "Air Selangor Careline 15300",
  },
  TNB: {
    code: "TNB",
    name: "Tenaga Nasional Berhad",
    scope: "Power outage, faulty street lighting cables, exposed electrical hazards",
    channel: "TNB Careline 15454",
  },
  PDRM: {
    code: "PDRM",
    name: "Polis Diraja Malaysia",
    scope: "Crime, public safety threats, illegal racing and traffic obstruction",
    channel: "Talian 999 / balai polis berdekatan",
  },
  JPJ: {
    code: "JPJ",
    name: "Jabatan Pengangkutan Jalan",
    scope: "Reckless commercial vehicles, unsafe buses, licensing and road transport",
    channel: "JPJ hotline 03-8000 8000",
  },
  KKM: {
    code: "KKM",
    name: "Kementerian Kesihatan Malaysia",
    scope: "Food safety, dengue hotspots, clinic and hospital service issues",
    channel: "MyHealth hotline 03-8883 4000",
  },
  DOE: {
    code: "DOE",
    name: "Jabatan Alam Sekitar",
    scope: "Air, river and noise pollution, open burning and industrial discharge",
    channel: "DOE hotline 1-800-88-2727",
  },
  "Local Council": {
    code: "Local Council",
    name: "Pihak Berkuasa Tempatan (PBT)",
    scope: "General municipal complaints outside Kuala Lumpur",
    channel: "Portal aduan PBT setempat",
  },
};

export function agencyInfo(code: string): Agency {
  return (
    AGENCIES[code] ?? {
      code,
      name: code,
      scope: "Routed by AduanAI triage",
      channel: "Refer to the agency public complaint channel",
    }
  );
}
