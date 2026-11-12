/**
 * Karteczki Kaizen w Strefie Działacza - wspólne dla formularza, akcji
 * i tablicy. Czyste funkcje, bez sieci.
 *
 * OBIEG (decyzja z 12.11.2026)
 * Działacz pisze karteczkę po zalogowaniu, ale do arkusza nie trafia nic, co
 * go identyfikuje - tylko data i treść. Karteczka ląduje w zakładce „Kaizen”
 * PRYWATNEGO arkusza formularzy (nie w „Treściach strony”, które czyta każdy
 * z linkiem). Zarząd omawia ją na posiedzeniu, wpisuje status i odpowiedź,
 * a „Pokaż na tablicy: TAK” wystawia ją Działaczom w Strefie.
 */

/** Obszary karteczki. Klucz idzie do arkusza; nazwy są w tłumaczeniach. */
export const OBSZARY = ["komunikacja", "organizacja", "projekty", "wdrozenie", "narzedzia", "inne"] as const;
export type Obszar = (typeof OBSZARY)[number];

/** Statusy, które Zarząd wpisuje w arkuszu. Pusty = jeszcze nieomówiona. */
export const STATUSY = ["omawiane", "wdrozone", "odrzucone"] as const;
export type Status = (typeof STATUSY)[number];

export const MIN_POLE = 5;
export const MAX_POLE = 800;

export interface Karteczka {
  obszar: Obszar;
  zauwazam: string;
  proponuje: string;
}

export function walidujKarteczke(dane: { obszar: string; zauwazam: string; proponuje: string }):
  | { ok: true; karteczka: Karteczka }
  | { ok: false } {
  const obszar = OBSZARY.find((o) => o === dane.obszar);
  const pole = (s: string) => s.trim().replace(/\s+\n/g, "\n").slice(0, MAX_POLE);
  const zauwazam = pole(dane.zauwazam ?? "");
  const proponuje = pole(dane.proponuje ?? "");
  if (!obszar || zauwazam.length < MIN_POLE || proponuje.length < MIN_POLE) return { ok: false };
  return { ok: true, karteczka: { obszar, zauwazam, proponuje } };
}

export interface KarteczkaNaTablicy extends Karteczka {
  /** RRRR-MM-DD */
  data: string;
  status: Status;
  /** Odpowiedź Zarządu - może być pusta przy „omawiane”. */
  odpowiedz: string;
}

/**
 * Status z arkusza bywa wpisany ręcznie, różnie odmieniony. Przyjmujemy
 * rozsądne warianty; czego nie poznajemy, tego nie pokazujemy - lepiej
 * pominąć karteczkę niż wystawić ją z mylącym statusem.
 */
function statusZArkusza(raw: string): Status | null {
  const s = raw.trim().toLowerCase();
  if (/^(omawia|w trakcie|do omówienia)/.test(s)) return "omawiane";
  if (/^wdro[żz]|^zrobion/.test(s)) return "wdrozone";
  if (/^(odrzuc|nie wdra)/.test(s)) return "odrzucone";
  return null;
}

/** Wiersze tablicy z odpowiedzi Apps Script (tylko „Pokaż na tablicy: TAK”). */
export function parseTablica(rows: unknown): KarteczkaNaTablicy[] {
  if (!Array.isArray(rows)) return [];
  const out: KarteczkaNaTablicy[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const text = (k: string) => String(r[k] ?? "").trim();
    const status = statusZArkusza(text("status"));
    const data = /^\d{4}-\d{2}-\d{2}/.exec(text("data"))?.[0];
    const zauwazam = text("zauwazam").slice(0, MAX_POLE);
    const proponuje = text("proponuje").slice(0, MAX_POLE);
    if (!status || !data || !zauwazam || !proponuje) continue;
    const obszar = OBSZARY.find((o) => o === text("obszar").toLowerCase()) ?? "inne";
    out.push({ data, obszar, zauwazam, proponuje, status, odpowiedz: text("odpowiedz").slice(0, MAX_POLE) });
  }
  return out.sort((a, b) => b.data.localeCompare(a.data));
}
