/**
 * Rekrutacje: do komisji Samorządu i do zespołów projektów.
 *
 * Właściwe źródło to zakładka „Rekrutacje” w arkuszu „Treści strony”
 * (src/lib/tresci, opis kolumn w docs/JAK-EDYTOWAC.md). Lista poniżej jest
 * wersją awaryjną z kodu. Nabór z minionym terminem znika ze strony sam.
 *
 * Aplikuje się mailem (decyzja Samorządu, 1.11.2026): kandydat dostaje
 * przewodnik z pytaniami aplikacyjnymi i odsyła odpowiedzi na APPLY_EMAIL.
 */
export type RecruitmentKind = "samorzad" | "projekt";

export interface Recruitment {
  kind: RecruitmentKind;
  /** Nazwa naboru, np. „Komisja ds. Kultury” albo „Team TEDxUEW”. */
  title: { pl: string; en: string };
  /** Klucz projektu ze strony Nasze projekty (np. „tedx”) - dodaje zdjęcie. */
  project?: string;
  desc?: { pl: string; en: string };
  /** Termin zgłoszeń, RRRR-MM-DD. */
  deadline?: string;
  /** Przewodnik z pytaniami aplikacyjnymi (PDF, Dysk). Opcjonalny. */
  guideUrl?: string;
}

export const recruitments: Recruitment[] = [];

/** Adres, na który kandydaci wysyłają odpowiedzi na pytania aplikacyjne. */
export const APPLY_EMAIL = "aplikacje@samorzad.ue.wroc.pl";

// Wspólny folder Drive z materiałami rekrutacyjnymi (opcjonalnie).
export const recruitmentDrive = "https://drive.google.com/drive/folders/1Zrt8yenJUbDs1GcVHJJkbgr-zxNPm2wx?usp=sharing";

// Ogólny formularz „zostaw zgłoszenie", gdy brak otwartych naborów (opcjonalnie).
export const recruitmentGeneralForm = "";

/**
 * Zdjęcia rekruterów z dwóch edycji rekrutacji do komisji (jesiennej
 * i wiosennej; decyzja Samorządu 2.11.2026). Bez imion i nazwisk - same
 * zdjęcia i opis edycji. Pliki: public/photos/rekrutacja/ (np. jesien.webp),
 * kilka zdjęć na edycję jest w porządku. Pusta lista = karta bez zdjęć.
 */
export const recruiterPhotos: { autumn: string[]; spring: string[] } = {
  // Stoisko z ulotką „Bingooo!” (nabór 29.09-07.10).
  autumn: ["/photos/rekrutacja/stoisko-jesien.webp"],
  // Ulotka „Nowy sezon, nowe możliwości” (nabór 02.03-07.03).
  spring: ["/photos/rekrutacja/stoisko-wiosna.webp", "/photos/rekrutacja/ulotka-wiosna.webp"],
};

/**
 * Galeria pod kartami edycji: zdjęcia z ostatnich rekrutacji do komisji
 * (przesłane przez Samorząd 11.2026). Bez podpisów o konkretnych wydarzeniach -
 * tylko opis tego, co widać (`key` → rekrutacja.gallery.<key> = tekst alternatywny).
 * `span`: big = 2x2, wide = 2 kolumny, brak = 1 pole.
 */
export const recruitmentGallery: { src: string; key: string; span?: "big" | "wide" }[] = [
  { src: "/photos/rekrutacja/grupa-schody-jesien.webp", key: "groupStairs", span: "big" },
  { src: "/photos/rekrutacja/biuro-telefony.webp", key: "officePhones", span: "wide" },
  { src: "/photos/rekrutacja/schody-telefony.webp", key: "stairsPhones" },
  { src: "/photos/rekrutacja/schody-telefony-2.webp", key: "stairsPhones2" },
  { src: "/photos/rekrutacja/grupa-flaga-osrodek.webp", key: "groupFlag" },
  { src: "/photos/rekrutacja/stand-ssuew.webp", key: "standScreen", span: "wide" },
  { src: "/photos/rekrutacja/sala-wykladowa.webp", key: "lectureHall" },
];

/** Nabory otwarte w dniu `today` (RRRR-MM-DD): bez terminu albo z terminem dziś lub później. */
export function openRecruitments(list: Recruitment[], today: string): Recruitment[] {
  return list.filter((r) => !r.deadline || r.deadline >= today);
}
