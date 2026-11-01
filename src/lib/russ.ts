/**
 * Posiedzenia i uchwały Rady Uczelnianej Samorządu Studentów - typy i wersja
 * awaryjna z kodu.
 *
 * Właściwe źródło to zakładki „Posiedzenia RUSS” i „Uchwały RUSS” w arkuszu
 * „Treści strony” (src/lib/tresci). Listy poniżej są używane tylko wtedy, gdy
 * arkusz nie działa albo zakładka jest pusta. Puste = strona Rady pokazuje
 * „brak ogłoszonych terminów” i „rejestr w przygotowaniu”.
 */
export interface RussMeeting {
  /** RRRR-MM-DD */
  date: string;
  /** GG:MM */
  time?: string;
  place?: { pl: string; en: string };
  extraordinary?: boolean;
  /** Pełny adres protokołu (PDF, Dysk). Dodaje się po posiedzeniu. */
  protocolHref?: string;
}

export interface RussResolution {
  /** Numer w formacie Rady, np. „1/2026/2027”. */
  number: string;
  /** RRRR-MM-DD */
  date: string;
  title: { pl: string; en: string };
  href?: string;
}

export const POSIEDZENIA_Z_KODU: RussMeeting[] = [];
export const UCHWALY_Z_KODU: RussResolution[] = [];

/** Dzisiejsza data w Polsce jako RRRR-MM-DD - granica „najbliższe / minione”. */
export function todayInWarsaw(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(now);
}
