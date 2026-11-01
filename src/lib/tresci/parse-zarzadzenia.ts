/**
 * Zakładka „Zarządzenia” z arkusza „Treści strony” → rejestr zarządzeń
 * Przewodniczącego (strona /zarzadzenia-przewodniczacego i karta
 * Przewodniczącego na /zarzad).
 *
 * Kolumny: Numer, Data, Tytuł, Tytuł EN (opcjonalnie), Link (opcjonalnie, pełny
 * adres do PDF albo pliku na Dysku). Błędny wiersz jest pomijany i opisany po
 * ludzku - patrz docs/JAK-EDYTOWAC.md.
 */
import { csvRecords } from "../csv";
import type { Zarzadzenie } from "../zarzadzenia";
import { parseSheetDate, type RowError } from "./parse-terminy";

export function parseZarzadzenia(csv: string): { items: Zarzadzenie[]; errors: RowError[] } {
  const items: Zarzadzenie[] = [];
  const errors: RowError[] = [];

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    const number = v.numer ?? "";
    if (!number) {
      fail("brak numeru zarządzenia (np. 1/2026/2027)");
      continue;
    }
    const title = v.tytul ?? "";
    if (!title) {
      fail("brak tytułu");
      continue;
    }
    const date = parseSheetDate(v.data ?? "");
    if (!date) {
      fail(`zła data (${v.data || "puste"}) - wpisz datę jako 2026-10-01 albo 01.10.2026`);
      continue;
    }
    const href = v.link || undefined;
    if (href && !/^https?:\/\//.test(href)) {
      fail(`„link” musi być pełnym adresem (https://…), a jest „${href}”`);
      continue;
    }
    items.push({ number, date, title: { pl: title, en: v.tytulen || title }, ...(href ? { href } : {}) });
  }

  // Od najnowszego; przy tej samej dacie wyższy numer wyżej.
  items.sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number, "pl", { numeric: true }));
  return { items, errors };
}
