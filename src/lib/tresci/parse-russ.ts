/**
 * Zakładki „Posiedzenia RUSS” i „Uchwały RUSS” z arkusza „Treści strony”.
 *
 * Posiedzenia: data, godzina, miejsce, miejsce EN, rodzaj (zwyczajne /
 * nadzwyczajne), protokół (link, dopisywany po posiedzeniu).
 * Uchwały: numer, data, tytuł, tytuł EN, link.
 *
 * Błędny wiersz jest pomijany i opisany po ludzku - patrz docs/JAK-EDYTOWAC.md.
 */
import { csvRecords } from "../csv";
import type { RussMeeting, RussResolution } from "../russ";
import { parseSheetDate, type RowError } from "./parse-terminy";

const DATE_HINT = "wpisz datę jako 2026-11-18 albo 18.11.2026";
const isUrl = (v: string) => /^https?:\/\//.test(v);
/** „…” w adresie to przykład przepisany z instrukcji (JAK-EDYTOWAC.md), nie prawdziwy plik. */
const isPlaceholder = (v: string) => v.includes("…");

/** „18:00”, „18.00”, „18:00:00” (tak eksportuje komórka czasu) albo „18”. */
export function parseSheetTime(v: string): string | null {
  const s = v.trim();
  let match = /^(\d{1,2})[:.](\d{2})(?::\d{2})?$/.exec(s);
  const [h, m] = match ? [Number(match[1]), Number(match[2])] : (match = /^(\d{1,2})$/.exec(s)) ? [Number(match[1]), 0] : [NaN, NaN];
  if (!(h >= 0 && h <= 23 && m >= 0 && m <= 59)) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function key(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/gi, "l").toLowerCase().replace(/[^a-z]/g, "");
}

export function parsePosiedzenia(csv: string): { items: RussMeeting[]; errors: RowError[] } {
  const items: RussMeeting[] = [];
  const errors: RowError[] = [];

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    const date = parseSheetDate(v.data ?? "");
    if (!date) {
      fail(`zła data (${v.data || "puste"}) - ${DATE_HINT}`);
      continue;
    }
    let time: string | undefined;
    if (v.godzina) {
      const parsed = parseSheetTime(v.godzina);
      if (!parsed) {
        fail(`zła godzina (${v.godzina}) - wpisz np. 18:00`);
        continue;
      }
      time = parsed;
    }
    const kind = key(v.rodzaj ?? "");
    if (kind && kind !== "zwyczajne" && kind !== "nadzwyczajne") {
      fail(`„${v.rodzaj}” to nie jest znany rodzaj - wpisz „zwyczajne” albo „nadzwyczajne” (albo zostaw puste)`);
      continue;
    }
    let protocolHref = v.protokol || undefined;
    if (protocolHref && isPlaceholder(protocolHref)) {
      // Termin zostaje, znika tylko udawany link - inaczej przykład z instrukcji
      // ukrywałby całe posiedzenie.
      fail(`„protokół” to przykład z instrukcji (${protocolHref}) - wklej prawdziwy link albo zostaw puste`);
      protocolHref = undefined;
    }
    if (protocolHref && !isUrl(protocolHref)) {
      fail(`„protokół” musi być pełnym adresem (https://…), a jest „${protocolHref}”`);
      continue;
    }
    items.push({
      date,
      ...(time ? { time } : {}),
      ...(v.miejsce ? { place: { pl: v.miejsce, en: v.miejsceen || v.miejsce } } : {}),
      ...(kind === "nadzwyczajne" ? { extraordinary: true } : {}),
      ...(protocolHref ? { protocolHref } : {}),
    });
  }

  items.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
  return { items, errors };
}

export function parseUchwaly(csv: string): { items: RussResolution[]; errors: RowError[] } {
  const items: RussResolution[] = [];
  const errors: RowError[] = [];

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    const number = v.numer ?? "";
    if (!number) {
      fail("brak numeru uchwały (np. 1/2026/2027)");
      continue;
    }
    const title = v.tytul ?? "";
    if (!title) {
      fail("brak tytułu");
      continue;
    }
    const date = parseSheetDate(v.data ?? "");
    if (!date) {
      fail(`zła data (${v.data || "puste"}) - ${DATE_HINT}`);
      continue;
    }
    const href = v.link || undefined;
    if (href && !isUrl(href)) {
      fail(`„link” musi być pełnym adresem (https://…), a jest „${href}”`);
      continue;
    }
    items.push({ number, date, title: { pl: title, en: v.tytulen || title }, ...(href ? { href } : {}) });
  }

  // Od najnowszej; przy tej samej dacie wyższy numer wyżej.
  items.sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number, "pl", { numeric: true }));
  return { items, errors };
}
