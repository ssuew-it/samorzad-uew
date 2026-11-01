/**
 * Rekrutacje: do Samorządu (komisje, funkcje) i do zespołów projektów.
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

/** Nabory otwarte w dniu `today` (RRRR-MM-DD): bez terminu albo z terminem dziś lub później. */
export function openRecruitments(list: Recruitment[], today: string): Recruitment[] {
  return list.filter((r) => !r.deadline || r.deadline >= today);
}
