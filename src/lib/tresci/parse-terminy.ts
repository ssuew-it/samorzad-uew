/**
 * Zakładki „Terminy” i „Zamiany dni” z arkusza „Treści strony” → dane strony.
 *
 * Czysta funkcja (bez sieci), żeby dało się ją przetestować. Każdy błędny
 * wiersz jest POMIJANY i opisany po ludzku z numerem wiersza - strona dalej
 * działa, a Strefa działacza pokazuje, co poprawić. Kolumny i dopuszczalne
 * wartości opisuje docs/JAK-EDYTOWAC.md.
 */
import { csvRecords } from "../csv";
import type { Termin, TerminKind, ZamianaDnia } from "../terminy";

export interface RowError {
  line: number;
  message: string;
}

const KINDS: Record<string, TerminKind> = {
  zajecia: "zajecia",
  semestr: "zajecia",
  sesja: "sesja",
  poprawka: "poprawka",
  sesjapoprawkowa: "poprawka",
  przerwa: "przerwa",
  dzienwolny: "wolne",
  wolne: "wolne",
  dzienrektorski: "wolne",
  wniosek: "wniosek",
  termin: "wniosek",
  uroczystosc: "uroczystosc",
  wydarzenie: "uroczystosc",
};

const WEEKDAYS: Record<string, ZamianaDnia["weekday"]> = {
  poniedzialek: "mon",
  pon: "mon",
  wtorek: "tue",
  wt: "tue",
  sroda: "wed",
  sr: "wed",
  czwartek: "thu",
  czw: "thu",
  piatek: "fri",
  pt: "fri",
};

function key(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/gi, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Data z arkusza → RRRR-MM-DD. Arkusz w polskich ustawieniach sam zamienia
 * „2027-02-09” na „9.02.2027”, więc przyjmujemy oba zapisy.
 */
export function parseSheetDate(v: string): string | null {
  const s = v.trim();
  let y: number, m: number, d: number;
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else if ((match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s))) {
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    return null;
  }
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const DATE_HINT = "wpisz datę jako 2027-02-09 albo 09.02.2027";

export function parseTerminy(csv: string): { items: Termin[]; errors: RowError[] } {
  const items: Termin[] = [];
  const errors: RowError[] = [];
  const ids = new Set<string>();

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    const title = v.tytul ?? "";
    if (!title) {
      fail("brak tytułu");
      continue;
    }
    const kind = KINDS[key(v.rodzaj ?? "")];
    if (!kind) {
      fail(`„${v.rodzaj || "(puste)"}” to nie jest znany rodzaj - wybierz: zajęcia, sesja, poprawka, przerwa, dzień wolny, wniosek, uroczystość`);
      continue;
    }
    const start = parseSheetDate(v.od ?? "");
    if (!start) {
      fail(`zła data w kolumnie „od” (${v.od || "puste"}) - ${DATE_HINT}`);
      continue;
    }
    let end: string | undefined;
    if (v.do) {
      const parsed = parseSheetDate(v.do);
      if (!parsed) {
        fail(`zła data w kolumnie „do” (${v.do}) - ${DATE_HINT}`);
        continue;
      }
      if (parsed < start) {
        fail("data „do” jest wcześniejsza niż „od”");
        continue;
      }
      if (parsed !== start) end = parsed;
    }
    const href = v.linknastronie || undefined;
    if (href && !href.startsWith("/")) {
      fail(`„link na stronie” musi zaczynać się od „/” (np. /stypendia#fundusz), a jest „${href}”`);
      continue;
    }
    const sourceHref = v.linkzrodla || undefined;
    if (sourceHref && !/^https?:\/\//.test(sourceHref)) {
      fail(`„link źródła” musi być pełnym adresem (https://…), a jest „${sourceHref}”`);
      continue;
    }

    let id = v.id || `${kind}-${start}`;
    while (ids.has(id)) id += "-2";
    ids.add(id);

    items.push({
      id,
      kind,
      title: { pl: title, en: v.tytulen || title },
      start,
      ...(end ? { end } : {}),
      ...(v.dlakogo ? { audience: { pl: v.dlakogo, en: v.dlakogoen || v.dlakogo } } : {}),
      source: { label: { pl: v.zrodlo || "Samorząd Studentów UEW", en: v.zrodloen || v.zrodlo || "UEW Student Government" }, ...(sourceHref ? { href: sourceHref } : {}) },
      ...(href ? { href } : {}),
    });
  }
  return { items, errors };
}

export function parseZamiany(csv: string): { items: ZamianaDnia[]; errors: RowError[] } {
  const items: ZamianaDnia[] = [];
  const errors: RowError[] = [];
  for (const { line, values: v } of csvRecords(csv)) {
    const date = parseSheetDate(v.data ?? "");
    if (!date) {
      errors.push({ line, message: `zła data (${v.data || "puste"}) - ${DATE_HINT}` });
      continue;
    }
    const weekday = WEEKDAYS[key(v.planzdnia ?? "")];
    if (!weekday) {
      errors.push({ line, message: `„plan z dnia” powinien być dniem tygodnia (np. poniedziałek), a jest „${v.planzdnia || "puste"}”` });
      continue;
    }
    const week = (v.tydzien ?? "").toUpperCase().replace(/\s/g, "");
    if (week && week !== "T1" && week !== "T2") {
      errors.push({ line, message: `„tydzień” to T1 albo T2 (albo puste), a jest „${v.tydzien}”` });
      continue;
    }
    items.push({ date, weekday, ...(week ? { week: week as "T1" | "T2" } : {}) });
  }
  return { items, errors };
}
