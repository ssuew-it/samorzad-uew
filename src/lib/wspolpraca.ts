/**
 * Strona Współpraca (/partnerzy) - układ z rozpiski z 21.11.2026: atuty na
 * kole, projekty z formami zaangażowania, dopasowanie „Potrzebuję:”, marki
 * i kontakt. Tu tylko klucze i zdjęcia; teksty są w messages (`partnerzy.*`).
 *
 * Zdjęcia biorę z galerii projektów (public/photos/projekty) - każde ma już
 * opis alternatywny w `naszeProjekty.gallery.<projekt>.<plik>`, a rozpiska
 * wymaga prawdziwych zdjęć z wydarzeń, nie ilustracji.
 */

/** Zdjęcie z galerii projektu: `[projekt, plik]`. */
export type ZdjecieProjektu = readonly [projekt: string, plik: string];

/** Atuty na kole, w kolejności od lewej góry zgodnie z ruchem wskazówek zegara. */
export const ATUTY = [
  { key: "talenty", zdjecie: ["dni", "prelegent"] },
  { key: "pr", zdjecie: ["animalia", "baner"] },
  { key: "widocznosc", zdjecie: ["dni", "stoisko"] },
  { key: "zasieg", zdjecie: ["party", "tlum"] },
  { key: "wydarzenia", zdjecie: ["adapciak", "stoiska"] },
] as const satisfies readonly { key: string; zdjecie: ZdjecieProjektu }[];

/** Projekty pokazywane partnerom - od najbardziej przyciągających. */
export const PROJEKTY_PARTNERSKIE = [
  { key: "juwenalia", zdjecie: ["juwenalia", "scena"] },
  { key: "adapciak", zdjecie: ["adapciak", "wieczor"] },
  { key: "dni", zdjecie: ["dni", "sala"] },
  { key: "tedx", zdjecie: ["tedx", "ekran"] },
  { key: "bal", zdjecie: ["bal", "parkiet"] },
  { key: "mosty", zdjecie: ["mosty", "scianka"] },
  { key: "party", zdjecie: ["party", "swiatla"] },
  { key: "animalia", zdjecie: ["animalia", "scena"] },
  { key: "test", zdjecie: ["test", "zespol"] },
  { key: "graduetion", zdjecie: ["graduetion", "birety"] },
] as const satisfies readonly { key: string; zdjecie: ZdjecieProjektu }[];

/**
 * „Potrzebuję:” - każda potrzeba ma dwie propozycje; `projekt` (klucz
 * logotypu) albo `null`, gdy propozycja nie jest związana z jednym projektem.
 * Treść propozycji: `partnerzy.dopasowanie.needs.<key>.offers[i]`.
 */
export const POTRZEBY = [
  { key: "kadry", projekty: ["dni", "tedx"] },
  { key: "spoleczne", projekty: ["animalia", null] },
  { key: "pr", projekty: ["bal", "tedx"] },
  { key: "odbiorcy", projekty: ["mosty", "party"] },
  { key: "rozpoznawalnosc", projekty: ["adapciak", "juwenalia"] },
] as const satisfies readonly { key: string; projekty: readonly (string | null)[] }[];

/**
 * Zdarzenie w przeglądarce: sekcja (projekt, propozycja) prosi formularz
 * o wpisanie tematu. Sekcje i formularz to osobne wyspy, rozdzielone
 * treścią z serwera, więc nie dzielą stanu Reacta.
 */
export const TEMAT_EVENT = "partnerzy:temat";
export interface TematDetail {
  message: string;
  topic: string;
}

export function wybierzTemat(detail: TematDetail) {
  window.dispatchEvent(new CustomEvent<TematDetail>(TEMAT_EVENT, { detail }));
}
