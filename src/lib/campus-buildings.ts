/**
 * Budynki Uczelni na mapie kampusu (/mapa-kampusu).
 *
 * Lekki moduł bez geometrii - można go importować w przeglądarce (np. linki
 * „sala na mapie” przy dyżurach). Geometria i dostępność: lib/campus-map-data.ts.
 *
 * „Co tu znajdziesz” zawiera WYŁĄCZNIE sprawdzone fakty - każdy ma źródło
 * w komentarzu. Budynek bez potwierdzonych informacji ma pustą listę, zamiast
 * zgadywanych „sal wykładowych”. Nowy fakt dopisuj ze źródłem.
 */

type L10n = { pl: string; en: string };

export interface CampusFact {
  text: L10n;
  /** Ścieżka podstrony serwisu, np. "/stypendia". */
  href?: string;
}

export interface CampusBuilding {
  code: string;
  /** Krótka etykieta na mapie (litera albo skrót). */
  short: string;
  name: L10n;
  group: "kampus" | "kamienna" | "akademiki" | "poza";
  /** Nadpisuje adres z deklaracji Uczelni, gdy znamy dokładniejszy. */
  address?: string;
  facts: CampusFact[];
}

export const CAMPUS_BUILDINGS_LIST: CampusBuilding[] = [
  {
    code: "A", short: "A", group: "kampus",
    name: { pl: "Budynek A", en: "Building A" },
    facts: [
      // Strona Dziekana i Prodziekanów (lib/dyzury, messages: mapa.buildings.A).
      { text: { pl: "Dziekanat: pok. 122 i 134", en: "Dean's Office: rooms 122 and 134" }, href: "/dziekan-i-prodziekani" },
      { text: { pl: "Dyżury Dziekana i Prodziekanów: pok. 121", en: "Dean and Vice-Deans' office hours: room 121" }, href: "/dziekan-i-prodziekani" },
    ],
  },
  {
    code: "A1", short: "A1", group: "kampus",
    name: { pl: "Budynek A1", en: "Building A1" },
    facts: [
      // Strona Stypendia (messages: stypendia.*.office).
      { text: { pl: "Dział Świadczeń Stypendialnych: pok. 1 i 2", en: "Scholarship Office: rooms 1 and 2" }, href: "/stypendia" },
    ],
  },
  { code: "B", short: "B", group: "kampus", name: { pl: "Budynek B", en: "Building B" }, facts: [] },
  { code: "C", short: "C", group: "kampus", name: { pl: "Budynek C", en: "Building C" }, facts: [] },
  {
    code: "CKU", short: "CKU", group: "kamienna",
    name: { pl: "Centrum Kształcenia Ustawicznego", en: "Centre for Continuing Education" },
    // Plan kampusu Działu Zarządzania Nieruchomościami: „CKU - Centrum Kształcenia Ustawicznego, Sala Audytoryjna (AULA)”.
    facts: [{ text: { pl: "Sala Audytoryjna (Aula)", en: "Main auditorium (Aula)" } }],
  },
  { code: "D", short: "D", group: "kampus", name: { pl: "Budynek D", en: "Building D" }, facts: [] },
  { code: "E", short: "E", group: "kampus", name: { pl: "Budynek E", en: "Building E" }, facts: [] },
  {
    code: "F", short: "F", group: "kampus",
    name: { pl: "Budynek F", en: "Building F" },
    // Deklaracja dostępności Uczelni: „Budynek F - Kancelaria Ogólna”.
    facts: [{ text: { pl: "Kancelaria Ogólna Uczelni", en: "University General Office" } }],
  },
  {
    code: "G", short: "G", group: "kampus",
    name: { pl: "Rektorat", en: "Rector's Office" },
    // Deklaracja dostępności Uczelni: „Budynek G - Rektorat”.
    facts: [{ text: { pl: "Władze Uczelni", en: "University authorities" }, href: "/wladze-rektorskie" }],
  },
  { code: "H", short: "H", group: "kampus", name: { pl: "Budynek H", en: "Building H" }, facts: [] },
  {
    code: "I", short: "I", group: "kamienna",
    name: { pl: "Budynek I", en: "Building I" },
    // Plan kampusu (budynek I z basenem) i OpenStreetMap (leisure=swimming_pool).
    facts: [{ text: { pl: "Basen", en: "Swimming pool" } }],
  },
  { code: "J", short: "J", group: "kamienna", name: { pl: "Budynek J", en: "Building J" }, facts: [] },
  {
    code: "K", short: "K", group: "kampus",
    name: { pl: "Budynek K", en: "Building K" },
    // Deklaracja dostępności Uczelni: „Budynek K - Archiwum”.
    facts: [{ text: { pl: "Archiwum Uczelni", en: "University Archive" } }],
  },
  {
    code: "L", short: "L", group: "kamienna",
    name: { pl: "Budynek L", en: "Building L" },
    // Adres potwierdzony przez Samorząd (4.11.2026); deklaracja Uczelni podaje „Kamienna 43-45”.
    address: "ul. Kamienna 44, 53-307 Wrocław",
    facts: [{ text: { pl: "Siedziba Samorządu Studentów: 1. piętro, pok. 110", en: "Student Government office: 1st floor, room 110" }, href: "/kontakt" }],
  },
  {
    code: "N", short: "N", group: "kampus",
    name: { pl: "Centrum Symulacji Procesów Biznesowych", en: "Business Process Simulation Centre" },
    facts: [],
  },
  { code: "P", short: "P", group: "kampus", name: { pl: "Budynek P", en: "Building P" }, facts: [] },
  {
    code: "W", short: "U/W", group: "kampus",
    name: { pl: "Biblioteka Główna (budynek U/W)", en: "Main Library (building U/W)" },
    // Plan kampusu: „U, W - Dolnośląskie Centrum Informacji Naukowej i Ekonomicznej, BIBLIOTEKA GŁÓWNA”.
    facts: [{ text: { pl: "Dolnośląskie Centrum Informacji Naukowej i Ekonomicznej", en: "Lower Silesian Centre for Scientific and Economic Information" }, href: "/infopacki/biblioteka" }],
  },
  {
    code: "Z", short: "Z", group: "kampus",
    name: { pl: "Budynek Z", en: "Building Z" },
    // Samorząd (4.11.2026).
    facts: [
      { text: { pl: "Wydział Zarządzania", en: "Faculty of Management" } },
      { text: { pl: "Sale komputerowe i biura, głównie techniczne", en: "Computer labs and offices, mostly technical" } },
    ],
  },
  { code: "Z1", short: "Z1", group: "kampus", name: { pl: "Budynek Z1", en: "Building Z1" }, facts: [] },
  {
    code: "INQUBE", short: "inQ", group: "kampus",
    name: { pl: "inQUBE", en: "inQUBE" },
    // Deklaracja dostępności Uczelni: „Budynek inQUBE - Uniwersytecki Inkubator Przedsiębiorczości”.
    facts: [{ text: { pl: "Uniwersytecki Inkubator Przedsiębiorczości", en: "University Business Incubator" } }],
  },
  { code: "BB", short: "B/B", group: "kamienna", name: { pl: "Budynek B/B", en: "Building B/B" }, facts: [] },
  { code: "BF", short: "B/F", group: "kamienna", name: { pl: "Budynek B/F", en: "Building B/F" }, facts: [] },
  {
    code: "SJO", short: "SJO", group: "poza",
    name: { pl: "Studium Języków Obcych", en: "Foreign Language Centre" },
    facts: [],
  },
  {
    code: "SWFIS", short: "SWFiS", group: "kamienna",
    name: { pl: "Studium Wychowania Fizycznego i Sportu", en: "Physical Education and Sports Centre" },
    facts: [],
  },
  { code: "SLEZAK", short: "DS", group: "akademiki", name: { pl: "Dom Studencki Ślężak", en: "Ślężak student residence" }, facts: [] },
  { code: "PRZEGUBOWIEC", short: "DS", group: "akademiki", name: { pl: "Dom Studencki Przegubowiec", en: "Przegubowiec student residence" }, facts: [] },
];

/** Kod z linku (?budynek=a1) albo z wyszukiwarki („bud. A1”, „U/W”) → kod budynku. */
export function findBuilding(input: string): CampusBuilding | null {
  const raw = input.trim().toUpperCase().replace(/^BUD(YNEK|\.)?\s*/, "");
  const code = raw === "U" || raw === "U/W" || raw === "UW" ? "W" : raw.replace("/", "");
  return CAMPUS_BUILDINGS_LIST.find((b) => b.code === code || b.short.toUpperCase() === raw) ?? null;
}

/** „A1 2”, „bud. A, pok. 121”, „Z/205” → budynek i sala. */
export function parseRoomQuery(q: string): { building: CampusBuilding; room: string | null } | null {
  const m = /^\s*(?:bud(?:ynek|\.)?\s*)?([a-z]{1,3}\d?|u\/w|b\/[bf])\s*(?:[,/\s-]+\s*(?:pok(?:ój|oj|\.)?|sala|s\.)?\s*([\d]{1,4}[a-z]?))?\s*$/i.exec(q);
  if (!m) return null;
  const building = findBuilding(m[1]);
  return building ? { building, room: m[2] ?? null } : null;
}



/** „Gdzie załatwię…” - sprawy, z którymi student szuka budynku. Tylko budynki z potwierdzonym faktem wyżej. */
export const CAMPUS_TASKS: { label: L10n; code: string; href?: string }[] = [
  { label: { pl: "Dziekanat", en: "Dean's Office" }, code: "A", href: "/dziekan-i-prodziekani" },
  { label: { pl: "Stypendia i zapomogi", en: "Scholarships and grants" }, code: "A1", href: "/stypendia" },
  { label: { pl: "Biblioteka Główna", en: "Main Library" }, code: "W", href: "/infopacki/biblioteka" },
  { label: { pl: "Samorząd Studentów", en: "Student Government" }, code: "L", href: "/kontakt" },
  { label: { pl: "Rektorat i Władze Uczelni", en: "Rector's Office" }, code: "G", href: "/wladze-rektorskie" },
  { label: { pl: "Pismo do Uczelni (Kancelaria Ogólna)", en: "Letters to the University (General Office)" }, code: "F" },
  { label: { pl: "Aula", en: "Main auditorium" }, code: "CKU" },
  { label: { pl: "Wydział Zarządzania", en: "Faculty of Management" }, code: "Z" },
  { label: { pl: "Basen", en: "Swimming pool" }, code: "I" },
  { label: { pl: "Inkubator przedsiębiorczości", en: "Business incubator" }, code: "INQUBE" },
  { label: { pl: "Dom studencki", en: "Student residence" }, code: "SLEZAK" },
];

/**
 * Kolor budynku na planie według funkcji - tylko tam, gdzie funkcja jest
 * potwierdzona faktem wyżej. Reszta to „inne”, zamiast zgadywać „dydaktyczny”.
 */
export type BuildingKind = "samorzad" | "obsluga" | "administracja" | "biblioteka" | "wydzial" | "aula" | "sport" | "akademik" | "inne";
export const BUILDING_KIND: Record<string, BuildingKind> = {
  L: "samorzad",
  A: "obsluga",
  A1: "obsluga",
  F: "administracja",
  G: "administracja",
  K: "administracja",
  W: "biblioteka",
  Z: "wydzial",
  CKU: "aula",
  I: "sport",
  SWFIS: "sport",
  SLEZAK: "akademik",
  PRZEGUBOWIEC: "akademik",
};
export const kindOf = (code: string): BuildingKind => BUILDING_KIND[code] ?? "inne";
