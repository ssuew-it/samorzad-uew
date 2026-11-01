/**
 * Zakładka „Rekrutacje” z arkusza „Treści strony” → strona /rekrutacja.
 *
 * Kolumny: rodzaj (samorząd / projekt), nazwa, nazwa EN, projekt (klucz ze
 * strony Nasze projekty, opcjonalnie), opis, opis EN, termin, przewodnik
 * (link do przewodnika z pytaniami aplikacyjnymi, opcjonalnie).
 */
import { csvRecords } from "../csv";
import type { Recruitment } from "../recruitment";
import { parseSheetDate, type RowError } from "./parse-terminy";

const PROJECT_KEYS = new Set(["adapciak", "dni", "party", "animalia", "bal", "juwenalia", "mosty", "test", "tedx", "graduetion"]);

function key(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/gi, "l").toLowerCase().replace(/[^a-z]/g, "");
}

export function parseRekrutacje(csv: string): { items: Recruitment[]; errors: RowError[] } {
  const items: Recruitment[] = [];
  const errors: RowError[] = [];

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    const kindKey = key(v.rodzaj ?? "");
    const kind = kindKey === "samorzad" ? "samorzad" : kindKey === "projekt" ? "projekt" : null;
    if (!kind) {
      fail(`„${v.rodzaj || "(puste)"}” to nie jest znany rodzaj - wpisz „samorząd” albo „projekt”`);
      continue;
    }
    const title = v.nazwa ?? "";
    if (!title) {
      fail("brak nazwy naboru");
      continue;
    }
    const guideUrl = v.przewodnik || undefined;
    if (guideUrl && !/^https?:\/\//.test(guideUrl)) {
      fail(`„przewodnik” musi być pełnym adresem (https://…), a jest „${guideUrl}”`);
      continue;
    }
    let deadline: string | undefined;
    if (v.termin) {
      const parsed = parseSheetDate(v.termin);
      if (!parsed) {
        fail(`zły termin (${v.termin}) - wpisz datę jako 2026-11-30 albo 30.11.2026`);
        continue;
      }
      deadline = parsed;
    }
    const project = v.projekt ? key(v.projekt) : undefined;
    if (project && !PROJECT_KEYS.has(project)) {
      fail(`nieznany projekt „${v.projekt}” - wpisz jeden z: ${[...PROJECT_KEYS].join(", ")} (albo zostaw puste)`);
      continue;
    }
    items.push({
      kind,
      title: { pl: title, en: v.nazwaen || title },
      ...(project ? { project } : {}),
      ...(v.opis ? { desc: { pl: v.opis, en: v.opisen || v.opis } } : {}),
      ...(deadline ? { deadline } : {}),
      ...(guideUrl ? { guideUrl } : {}),
    });
  }

  // Najpierw te, którym szybciej mija termin; bez terminu na końcu.
  items.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
  return { items, errors };
}
