/**
 * Terminy roku akademickiego - JEDNO ŹRÓDŁO dla kalendarza, odliczania na
 * głównej i widgetów terminów na podstronach.
 *
 * Każda data jest przepisana z dokumentu źródłowego, nie „mniej więcej”.
 * Student planuje pod nie naukę i wnioski, więc termin bez źródła tu nie
 * trafia. Daty są „włącznie” (tak jak w harmonogramie).
 *
 * ŹRÓDŁA
 * - harmonogram: Harmonogram roku akademickiego 2026/2027, Prorektor ds.
 *   Studenckich i Kształcenia, RS.5303.1.2026 z 07.05.2026 (BIP UEW).
 * - wfs: Regulamin Własnego Funduszu Stypendialnego, tekst jednolity
 *   z 30.06.2023, § 3 ust. 3 i § 4 ust. 6.
 *
 * NOWY ROK: dopisz terminy z nowego harmonogramu, stare mogą zostać -
 * widoki same pokazują tylko to, co trwa albo dopiero nadejdzie.
 */

export type TerminKind = "zajecia" | "sesja" | "poprawka" | "przerwa" | "wolne" | "wniosek" | "uroczystosc";

export interface Termin {
  id: string;
  kind: TerminKind;
  title: { pl: string; en: string };
  /** RRRR-MM-DD, włącznie. */
  start: string;
  /** RRRR-MM-DD, włącznie. Brak = jeden dzień. */
  end?: string;
  /** Kogo dotyczy, gdy nie wszystkich (np. jeden kierunek i rok). */
  audience?: { pl: string; en: string };
  source: keyof typeof TERMINY_SOURCES;
  /** Podstrona, na której jest więcej o tej sprawie. */
  href?: string;
}

export const TERMINY_SOURCES = {
  harmonogram: {
    label: { pl: "Harmonogram roku akademickiego 2026/2027 (BIP UEW)", en: "Academic year schedule 2026/2027 (UEW BIP)" },
    href: "https://www.bip.ue.wroc.pl/593/harmonogram-roku-akademickiego-20262027.html",
  },
  wfs: {
    label: { pl: "Regulamin Własnego Funduszu Stypendialnego (BIP UEW)", en: "Own Scholarship Fund regulations (UEW BIP)" },
    href: "https://bip.ue.wroc.pl/359/400/regulamin-przyznawania-stypendiow-z-wlasnego-funduszu-stypendialnego-uew.html",
  },
} as const;

const ZIIP4 = { pl: "IV rok ZIiP", en: "Year 4, ZIiP" };
const RIP2 = { pl: "RiP II stopnia, II rok", en: "RiP master's, year 2" };
const III_ROK = { pl: "III rok I stopnia (bez ZIiP)", en: "Year 3, bachelor's (except ZIiP)" };

export const terminy: Termin[] = [
  { id: "inauguracja-2026", kind: "uroczystosc", title: { pl: "Inauguracja roku akademickiego", en: "Academic year inauguration" }, start: "2026-10-06", source: "harmonogram" },
  { id: "semestr-zimowy-2026", kind: "zajecia", title: { pl: "Semestr zimowy", en: "Winter semester" }, start: "2026-10-01", end: "2027-02-08", source: "harmonogram" },
  { id: "wolne-2026-11-02", kind: "wolne", title: { pl: "Dzień rektorski", en: "Rector's day off" }, start: "2026-11-02", source: "harmonogram" },
  { id: "wfs-wnioski-2026", kind: "wniosek", title: { pl: "Wnioski o stypendium z Własnego Funduszu Stypendialnego", en: "Own Scholarship Fund applications" }, start: "2026-11-30", source: "wfs", href: "/stypendia#fundusz" },
  { id: "ziip-koniec-2026", kind: "zajecia", title: { pl: "Koniec semestru zimowego", en: "Winter semester ends" }, start: "2026-12-06", audience: ZIIP4, source: "harmonogram" },
  { id: "ziip-poprawka-2026", kind: "poprawka", title: { pl: "Zimowa sesja zaliczeniowa poprawkowa", en: "Winter resit period" }, start: "2026-12-07", end: "2026-12-13", audience: ZIIP4, source: "harmonogram" },
  { id: "przerwa-swieta-2026", kind: "przerwa", title: { pl: "Przerwa świąteczna", en: "Christmas break" }, start: "2026-12-23", end: "2027-01-06", source: "harmonogram" },
  { id: "rip-sesja-zimowa-2027", kind: "sesja", title: { pl: "Zimowa sesja egzaminacyjna", en: "Winter exam session" }, start: "2027-02-06", end: "2027-02-21", audience: { pl: "RiP II stopnia, II rok, niestacjonarne", en: "RiP master's, year 2, part-time" }, source: "harmonogram" },
  { id: "sesja-zimowa-2027", kind: "sesja", title: { pl: "Zimowa sesja egzaminacyjna", en: "Winter exam session" }, start: "2027-02-09", end: "2027-02-22", source: "harmonogram", href: "/infopacki/zaliczenie-semestru" },
  { id: "poprawka-zimowa-2027", kind: "poprawka", title: { pl: "Zimowa sesja poprawkowa", en: "Winter resit session" }, start: "2027-02-23", end: "2027-02-28", source: "harmonogram", href: "/infopacki/zaliczenie-semestru" },
  { id: "semestr-letni-2027", kind: "zajecia", title: { pl: "Semestr letni", en: "Summer semester" }, start: "2027-03-03", end: "2027-07-01", source: "harmonogram" },
  { id: "przerwa-wielkanoc-2027", kind: "przerwa", title: { pl: "Przerwa świąteczna", en: "Easter break" }, start: "2027-03-26", end: "2027-03-30", source: "harmonogram" },
  { id: "wolne-juwenalia-2027", kind: "wolne", title: { pl: "Dzień rektorski (Juwenalia)", en: "Rector's day off (Juwenalia)" }, start: "2027-05-07", source: "harmonogram" },
  { id: "iii-sesja-2027", kind: "sesja", title: { pl: "Letnia sesja egzaminacyjna", en: "Summer exam session" }, start: "2027-05-17", end: "2027-05-23", audience: III_ROK, source: "harmonogram" },
  { id: "iii-poprawka-2027", kind: "poprawka", title: { pl: "Letnia sesja poprawkowa", en: "Summer resit session" }, start: "2027-05-24", end: "2027-05-30", audience: III_ROK, source: "harmonogram" },
  { id: "wolne-2027-05-28", kind: "wolne", title: { pl: "Dzień rektorski", en: "Rector's day off" }, start: "2027-05-28", source: "harmonogram" },
  { id: "rip-sesja-letnia-2027", kind: "sesja", title: { pl: "Letnia sesja egzaminacyjna", en: "Summer exam session" }, start: "2027-06-12", end: "2027-07-15", audience: RIP2, source: "harmonogram" },
  { id: "sesja-letnia-2027", kind: "sesja", title: { pl: "Letnia sesja egzaminacyjna", en: "Summer exam session" }, start: "2027-07-02", end: "2027-07-15", source: "harmonogram", href: "/infopacki/zaliczenie-semestru" },
  { id: "poprawka-letnia-2027", kind: "poprawka", title: { pl: "Letnia sesja poprawkowa", en: "Summer resit session" }, start: "2027-07-16", end: "2027-07-21", source: "harmonogram", href: "/infopacki/zaliczenie-semestru" },
];

/**
 * Dni, w które zajęcia idą według planu z innego dnia tygodnia. Student,
 * który patrzy tylko na swój plan, przychodzi wtedy na złe zajęcia.
 * T1/T2 = tydzień pierwszy/drugi planu.
 */
export interface ZamianaDnia {
  date: string;
  /** Według planu z dnia… */
  weekday: "mon" | "tue" | "wed" | "fri";
  week: "T1" | "T2";
}

export const zamianyDni: ZamianaDnia[] = [
  { date: "2026-11-06", weekday: "mon", week: "T1" },
  { date: "2026-11-12", weekday: "wed", week: "T1" },
  { date: "2026-12-21", weekday: "wed", week: "T2" },
  { date: "2027-03-25", weekday: "mon", week: "T1" },
  { date: "2027-03-31", weekday: "tue", week: "T1" },
  { date: "2027-06-08", weekday: "fri", week: "T2" },
  { date: "2027-06-16", weekday: "fri", week: "T2" },
];

const DAY = 86_400_000;

function at(date: string): number {
  return new Date(`${date}T00:00:00`).getTime();
}

export type TerminState =
  | { kind: "now"; daysLeft: number }
  | { kind: "soon"; daysTo: number };

/**
 * Stan terminu względem dnia `today` (północ). `null` = już minął.
 * „daysLeft” liczy dni do końca włącznie z dzisiejszym.
 */
export function terminState(t: Termin, today: number): TerminState | null {
  const start = at(t.start);
  const end = at(t.end ?? t.start);
  if (today > end) return null;
  if (today >= start) return { kind: "now", daysLeft: Math.round((end - today) / DAY) + 1 };
  return { kind: "soon", daysTo: Math.round((start - today) / DAY) };
}

/** Nadchodzące i trwające terminy, od najbliższego. */
export function upcomingTerminy(today: number, opts: { includeAudience?: boolean; limit?: number } = {}) {
  const { includeAudience = true, limit } = opts;
  const list = terminy
    .filter((t) => includeAudience || !t.audience)
    .map((t) => ({ termin: t, state: terminState(t, today) }))
    .filter((x): x is { termin: Termin; state: TerminState } => x.state !== null)
    .sort((a, b) => at(a.termin.start) - at(b.termin.start));
  return limit ? list.slice(0, limit) : list;
}

export function terminById(id: string): Termin | undefined {
  return terminy.find((t) => t.id === id);
}

/** Dzisiejsza północ czasu lokalnego. */
export function todayMidnight(now: Date = new Date()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/* ── Eksport do kalendarza (.ics, RFC 5545) ───────────────────────────── */

function icsDate(date: string, plusDays = 0): string {
  const d = new Date(at(date) + plusDays * DAY);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Plik .ics z wydarzeniami całodniowymi. DTEND jest wyłączny, stąd +1 dzień. */
export function toIcs(list: Termin[], locale: "pl" | "en"): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = list.map((t) => {
    const title = t.audience ? `${t.title[locale]} (${t.audience[locale]})` : t.title[locale];
    return [
      "BEGIN:VEVENT",
      `UID:${t.id}@samorzad.ue.wroc.pl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(t.start)}`,
      `DTEND;VALUE=DATE:${icsDate(t.end ?? t.start, 1)}`,
      `SUMMARY:${icsText(title)}`,
      `DESCRIPTION:${icsText(TERMINY_SOURCES[t.source].label[locale])}`,
      `URL:${TERMINY_SOURCES[t.source].href}`,
      "END:VEVENT",
    ].join("\r\n");
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Samorzad Studentow UEW//Terminy//PL", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
}

/**
 * Najbliższa sesja egzaminacyjna dla wszystkich (bez terminów jednego
 * rocznika) - do odliczania na głównej. `null` w trakcie sesji i po ostatniej
 * wpisanej: licznik wtedy znika, zamiast pokazywać zero.
 */
export function nextSession(today: number): { days: number; season: "winter" | "summer" } | null {
  const next = terminy
    .filter((t) => t.kind === "sesja" && !t.audience && at(t.start) > today)
    .sort((a, b) => at(a.start) - at(b.start))[0];
  if (!next) return null;
  const month = new Date(at(next.start)).getMonth();
  return { days: Math.round((at(next.start) - today) / DAY), season: month <= 3 ? "winter" : "summer" };
}
