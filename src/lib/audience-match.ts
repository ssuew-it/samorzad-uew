/**
 * Czy termin „dla kogo” (wolny tekst z arkusza, np. „IV rok ZIiP”,
 * „RiP II stopnia, II rok, niestacjonarne”, „III rok I stopnia (bez ZIiP)”)
 * dotyczy studenta, który wybrał swoją grupę w planie zajęć?
 *
 * Trzy odpowiedzi, bo tekst bywa niejednoznaczny:
 * - "match"   - na pewno dotyczy: termin pokazujemy od razu,
 * - "nomatch" - na pewno nie dotyczy: chowamy,
 * - "unknown" - nie umiemy rozstrzygnąć: zostaje za przełącznikiem, jak dawniej.
 * Lepiej „nie wiem” niż schowany termin sesji.
 */
export interface StudyChoice {
  /** Kod trybu z planu: S1, S2, N1, N2. */
  mode: string;
  /** Kod kierunku z planu, np. FIR, ZIIP. */
  program: string;
  /** Rok studiów, np. "1". */
  year: string;
}

export type AudienceMatch = "match" | "nomatch" | "unknown";

/**
 * Skróty kierunków z arkusza → kod w planie. Tylko pewne pary: „RiP” nie ma
 * potwierdzonego kodu (RP czeka na potwierdzenie w kierunki.ts), więc taki
 * termin daje "unknown", a nie zgadujemy.
 */
const PROGRAM_ALIASES: Record<string, string> = {
  ziip: "ZIIP",
};
const UNCONFIRMED = new Set(["rip"]);

const ROMAN: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4", v: "5" };

export function matchAudience(text: string, c: StudyChoice): AudienceMatch {
  const s = text.toLowerCase();

  // Stopień i tryb.
  const cycle = c.mode.endsWith("2") ? "2" : "1";
  const partTime = c.mode.startsWith("N");
  const deg = /\b(i{1,2})\s+stopnia/.exec(s)?.[1];
  if (deg && ROMAN[deg] !== cycle) return "nomatch";
  if (/niestacjonarn/.test(s) && !partTime) return "nomatch";
  if (/(^|[^a-z])stacjonarn/.test(s) && partTime) return "nomatch";

  // Rok: „IV rok”, „II rok”, „rok 2”.
  const yr = /\b(i{1,3}|iv|v)\s+rok\b/.exec(s)?.[1] ?? /\brok\s+(\d)\b/.exec(s)?.[1];
  if (yr && (ROMAN[yr] ?? yr) !== c.year) return "nomatch";

  // Kierunki: wymienione i wykluczone („bez ZIiP”).
  const excluded = [...s.matchAll(/bez\s+([a-z]+)/g)].map((m) => m[1]);
  if (excluded.some((e) => PROGRAM_ALIASES[e] === c.program)) return "nomatch";
  const words = s.replace(/bez\s+[a-z]+/g, " ").split(/[^a-z]+/).filter(Boolean);
  const named = words.map((w) => PROGRAM_ALIASES[w]).filter(Boolean);
  if (words.some((w) => UNCONFIRMED.has(w))) return "unknown";
  if (named.length && !named.includes(c.program)) return "nomatch";

  // Coś rozpoznaliśmy (rok, stopień albo kierunek) i nic nie wykluczyło.
  return yr || deg || named.length ? "match" : "unknown";
}
