export const ALGERIA_WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Bejaia",
  "Biskra",
  "Bechar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tebessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Setif",
  "Saida",
  "Skikda",
  "Sidi Bel Abbes",
  "Annaba",
  "Guelma",
  "Constantine",
  "Medea",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arreridj",
  "Boumerdes",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Ain Defla",
  "Naama",
  "Ain Temouchent",
  "Ghardaia",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Beni Abbes",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Meniaa",
] as const;

const WILAYA_ALIASES: Record<string, string> = {
  alger: "Alger",
  algiers: "Alger",
  bejaia: "Bejaia",
  bejaiaa: "Bejaia",
  setif: "Setif",
  saida: "Saida",
  "sidi bel abbes": "Sidi Bel Abbes",
  "m'sila": "M'Sila",
  msila: "M'Sila",
  "bordj bou areridj": "Bordj Bou Arreridj",
  "bordj bou arreridj": "Bordj Bou Arreridj",
  boumerdes: "Boumerdes",
  "ain defla": "Ain Defla",
  naama: "Naama",
  "ain temouchent": "Ain Temouchent",
  ghardaia: "Ghardaia",
  "beni abbes": "Beni Abbes",
  "el mghair": "El M'Ghair",
};

export const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const WILAYA_BY_NORMALIZED = new Map(
  ALGERIA_WILAYAS.map((wilaya) => [normalizeText(wilaya), wilaya])
);

export function normalizeWilayaValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const normalized = normalizeText(trimmed);
  const aliasMatch = WILAYA_ALIASES[normalized];
  if (aliasMatch) {
    return aliasMatch;
  }
  return WILAYA_BY_NORMALIZED.get(normalized) ?? trimmed;
}

export function matchesWilaya(location: string, selectedWilaya: string): boolean {
  if (selectedWilaya === "all") {
    return true;
  }
  const normalizedSelected = normalizeText(normalizeWilayaValue(selectedWilaya));
  if (!normalizedSelected) {
    return true;
  }
  return normalizeText(location).includes(normalizedSelected);
}
