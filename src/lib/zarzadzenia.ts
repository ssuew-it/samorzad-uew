/**
 * Zarządzenia Przewodniczącego Samorządu - typ i wersja awaryjna z kodu.
 *
 * Właściwe źródło to zakładka „Zarządzenia” w arkuszu „Treści strony”
 * (src/lib/tresci). Ta lista jest używana tylko wtedy, gdy arkusz nie działa
 * albo zakładka jest pusta. Pusta lista = rejestr pokazuje stan „czeka na
 * pierwsze zarządzenie”.
 */
export interface Zarzadzenie {
  /** Numer w formacie Samorządu, np. „1/2026/2027”. */
  number: string;
  /** RRRR-MM-DD */
  date: string;
  title: { pl: string; en: string };
  /** Pełny adres pliku (PDF, Dysk). Bez linku zarządzenie widać bez pobierania. */
  href?: string;
  /** PDF wersji angielskiej - na /en zamiast polskiego. */
  hrefEn?: string;
}

export const ZARZADZENIA_Z_KODU: Zarzadzenie[] = [];
