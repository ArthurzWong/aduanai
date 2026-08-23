export interface SamplePrompt {
  label: string;
  text: string;
  hint: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    label: "Pothole at Jalan Ampang (demo)",
    text: "Tolong, ada lubang besar di Jalan Ampang dekat KLCC, bahaya untuk motor.",
    hint: "infrastructure · high · DBKL",
  },
  {
    label: "Rubbish uncollected in Cheras",
    text: "Sampah tak dikutip dah seminggu di Jalan Cheras, busuk dan banyak lalat.",
    hint: "waste management · SWCorp",
  },
  {
    label: "Water cut in Shah Alam",
    text: "Air tak keluar sejak semalam di Seksyen 7 Shah Alam, ada baby kat rumah.",
    hint: "water supply · Air Selangor",
  },
  {
    label: "Flash flood in Taman Desa",
    text: "Banjir kilat di Taman Desa Kuala Lumpur, air masuk rumah dan longkang melimpah.",
    hint: "flooding · critical · DBKL",
  },
  {
    label: "Street light out (English)",
    text: "The street lights along Jalan Bukit Bintang have been out for two weeks and it feels unsafe at night.",
    hint: "street lighting · DBKL",
  },
  {
    label: "Sewage overflow in Petaling Jaya",
    text: "Kumbahan melimpah dari manhole depan rumah di Jalan SS2/24 Petaling Jaya, sangat busuk.",
    hint: "sewerage · IWK",
  },
];
