/**
 * Zakładka „Wydarzenia” z arkusza „Treści strony” → wydarzenia Samorządu
 * na /kalendarz, w pasku pod hero i w „Najbliższym wydarzeniu” na głównej.
 *
 * Kolumny: nazwa, nazwa EN, data, godzina, miejsce, link, tag. Wymagane są
 * tylko nazwa i data. Błędny wiersz jest pomijany i opisany po ludzku -
 * patrz docs/JAK-EDYTOWAC.md. Daty z przeszłości nie są błędem: strona sama
 * pokazuje tylko nadchodzące.
 */
import { csvRecords } from "../csv";
import { parseSheetDate, type RowError } from "./parse-terminy";
import { parseSheetTime } from "./parse-dyzury";

export interface SheetEvent {
  name: string;
  nameEn?: string;
  /** RRRR-MM-DD */
  date: string;
  /** GG:MM */
  time?: string;
  place?: string;
  href?: string;
  tag: string;
}

export function parseWydarzenia(csv: string): { items: SheetEvent[]; errors: RowError[] } {
  const items: SheetEvent[] = [];
  const errors: RowError[] = [];

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    const name = v.nazwa ?? "";
    if (!name) {
      fail("brak nazwy wydarzenia");
      continue;
    }
    const date = parseSheetDate(v.data ?? "");
    if (!date) {
      fail(`„${v.data || "(puste)"}” to nie jest data - wpisz np. 2026-11-20 albo 20.11.2026`);
      continue;
    }
    const event: SheetEvent = { name, date, tag: v.tag ?? "" };
    if (v.nazwaen) event.nameEn = v.nazwaen;
    if (v.godzina) {
      const time = parseSheetTime(v.godzina);
      // Zła godzina nie ukrywa wydarzenia - pokazujemy je bez godziny.
      if (time) event.time = time;
      else fail(`„${v.godzina}” to nie jest godzina - wydarzenie pokazujemy bez niej (wpisz np. 18:00)`);
    }
    if (v.miejsce) event.place = v.miejsce;
    if (v.link) {
      if (/^https:\/\//.test(v.link)) event.href = v.link;
      else fail(`link „${v.link}” musi zaczynać się od https:// - wydarzenie pokazujemy bez linku`);
    }
    items.push(event);
  }

  items.sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  return { items, errors };
}
