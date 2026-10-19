/**
 * Arytmetyka rozkładówek książki.
 *
 * Model: arkusz ma dwie strony - przód (recto, parzysty indeks od zera:
 * 0, 2, 4…) i tył (verso). Stan książki opisuje JEDNA liczba `o` - ile arkuszy
 * leży już po lewej stronie.
 *
 * Indeksy stron są liczone OD ZERA, bo tak indeksuje się tablicę manifestu.
 * Strona 0 to okładka: przy zamkniętej książce (`o = 0`) leży sama po prawej,
 * bo po lewej nie ma jeszcze niczego.
 *
 * Moduł jest czysty - bez Reacta i bez `three` - żeby dało się go przetestować
 * bez uruchamiania przeglądarki. To tutaj kryją się wszystkie błędy o jeden.
 */

/** Strony widoczne w spoczynku. `null` = po tej stronie nie ma kartki. */
export interface Spread {
  verso: number | null;
  recto: number | null;
}

/** Strony potrzebne do narysowania obrotu jednego arkusza. */
export interface Frames {
  /** Statyczna strona po lewej, odsłonięta przez obrót. */
  staticVerso: number | null;
  /** Statyczna strona po prawej, odsłaniana przez obrót. */
  staticRecto: number | null;
  /** Przód obracanej kartki (widoczny na starcie). */
  leafFront: number;
  /** Tył obracanej kartki (widoczny po wylądowaniu). */
  leafBack: number;
}

/** Ile arkuszy ma tom o podanej liczbie stron. Ostatni bywa niepełny. */
export function sheetCount(pageCount: number): number {
  return Math.ceil(pageCount / 2);
}

const clamp = (page: number, pageCount: number): number | null =>
  page >= 0 && page < pageCount ? page : null;

/** Rozkładówka spoczynkowa przy `o` arkuszach po lewej. */
export function spreadAt(o: number, pageCount: number): Spread {
  return {
    verso: clamp(2 * o - 1, pageCount),
    recto: clamp(2 * o, pageCount),
  };
}

/**
 * Kadr obrotu arkusza `base`.
 *
 * Kartka w ruchu zakrywa kolejno obie strony, które sąsiadują z nią w spoczynku,
 * więc pod spodem muszą leżeć te, które obrót ODSŁANIA: `2·base−1` po lewej i
 * `2·base+2` po prawej. Bez tego kartka odsłoniłaby pustkę.
 */
export function framesFor(base: number, pageCount: number): Frames {
  return {
    staticVerso: clamp(2 * base - 1, pageCount),
    staticRecto: clamp(2 * base + 2, pageCount),
    leafFront: 2 * base,
    leafBack: 2 * base + 1,
  };
}
