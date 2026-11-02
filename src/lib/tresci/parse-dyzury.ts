/**
 * Zakładka „Dyżury” z arkusza „Treści strony” → dyżury Dziekana
 * i Prodziekanów na /dziekan-i-prodziekani.
 *
 * Kolumny: osoba (nazwisko albo „Dziekan”), dzień, od, do, budynek, sala,
 * teams („tak” = można dołączyć online), uwagi, uwagi EN, odwołane (daty
 * po przecinku). Jedna osoba może mieć kilka wierszy (kilka dyżurów
 * w tygodniu). Błędny wiersz jest pomijany i opisany po ludzku - patrz
 * docs/JAK-EDYTOWAC.md.
 */
import { csvRecords } from "../csv";
import type { DutyPerson, Dyzur } from "../dyzury";
import { parseSheetDate, type RowError } from "./parse-terminy";

function key(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/gi, "l").toLowerCase().replace(/[^a-z]/g, "");
}

const PEOPLE: Record<string, DutyPerson> = {
  dziekan: "dziekan",
  michalczyk: "dziekan",
  turowska: "turowska",
  werenska: "werenska",
  bobowski: "bobowski",
};

const DAYS: Record<string, number> = {
  poniedzialek: 1, pon: 1, pn: 1,
  wtorek: 2, wt: 2,
  sroda: 3, sr: 3,
  czwartek: 4, czw: 4, cz: 4,
  piatek: 5, pt: 5, pia: 5,
};

/** „9:00”, „09.00”, „9:00:00” (tak gviz oddaje komórki z godziną) → „09:00”. */
export function parseSheetTime(v: string): string | null {
  const m = /^(\d{1,2})[:.](\d{2})(?::\d{2})?$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export function parseDyzury(csv: string): { items: Dyzur[]; errors: RowError[] } {
  const items: Dyzur[] = [];
  const errors: RowError[] = [];

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    // Nazwisko może być wpisane razem z tytułem („dr Wioletta Turowska”).
    const words = (v.osoba ?? "").split(/[\s,]+/).map(key);
    const person = words.map((w) => PEOPLE[w]).find(Boolean);
    if (!person) {
      fail(`nie wiem, kim jest „${v.osoba || "(puste)"}” - wpisz „Dziekan” albo nazwisko: Turowska, Wereńska, Bobowski`);
      continue;
    }
    const weekday = DAYS[key(v.dzien ?? "")];
    if (!weekday) {
      fail(`„${v.dzien || "(puste)"}” to nie jest dzień roboczy - wpisz np. „wtorek”`);
      continue;
    }
    const from = parseSheetTime(v.od ?? "");
    const to = parseSheetTime(v.do ?? "");
    if (!from || !to) {
      fail(`zła godzina (od: ${v.od || "puste"}, do: ${v.do || "puste"}) - wpisz godziny jako 9:00 i 10:30`);
      continue;
    }
    if (to <= from) {
      fail(`dyżur kończy się (${to}) przed początkiem (${from})`);
      continue;
    }
    // Zła data odwołania nie ukrywa dyżuru - pomijamy tylko tę datę.
    const cancelled: string[] = [];
    for (const raw of (v.odwolane ?? "").split(/[,;\s]+/).filter(Boolean)) {
      const date = parseSheetDate(raw);
      if (date) cancelled.push(date);
      else fail(`zła data w „odwołane” (${raw}) - wpisz datę jako 2026-11-18 albo 18.11.2026; pozostałe dane dyżuru są na stronie`);
    }
    const building = (v.budynek ?? "").replace(/^bud(ynek)?\.?\s*/i, "").trim().toUpperCase() || undefined;
    const room = (v.sala ?? "").replace(/^(pok(oj|ój)?|sala)\.?\s*/i, "").trim() || undefined;
    items.push({
      person,
      weekday,
      from,
      to,
      ...(building ? { building } : {}),
      ...(room ? { room } : {}),
      ...(["tak", "t", "x", "1", "yes", "ok"].includes(key(v.teams ?? "")) ? { teams: true } : {}),
      ...(v.uwagi ? { note: { pl: v.uwagi, en: v.uwagien || v.uwagi } } : {}),
      ...(cancelled.length ? { cancelled } : {}),
    });
  }

  return { items, errors };
}
