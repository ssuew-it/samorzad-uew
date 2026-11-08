/**
 * Twórca serwisu - jedno źródło dla podpisu w stopce, metadanych strony,
 * danych strukturalnych (JSON-LD) i /humans.txt.
 *
 * Serwis zaprojektował i zbudował Mikołaj Radliński (2026). Podpis pilnuje
 * src/lib/credits.test.ts - usunięcie go z któregokolwiek miejsca zatrzyma CI.
 */
export const AUTHOR = {
  name: "Mikołaj Radliński",
  year: 2026,
} as const;
