/**
 * Język ruchu - JEDNO ŹRÓDŁO PRAWDY dla czasów i krzywych.
 *
 * Wcześniej każdy komponent dobierał własny czas trwania (0,45 / 0,5 / 0,6 /
 * 0,7 / 0,9 / 1,0 s) i powtarzał tę samą krzywą wpisaną z palca. Efekt: strona
 * poruszała się kilkoma różnymi „dialektami" naraz, mimo że wszędzie chodziło
 * o ten sam gest.
 *
 * Zasada z wizji („Niebieski Impuls"): jeden materiał wizualny, wiele
 * kontekstów. Tempo i krzywa są tym, co spina je w jedną przestrzeń - nie
 * kolor i nie kształt.
 */

/** Krzywa sygnaturowa: szybki start, długie wyhamowanie (ease-out-expo). */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Skala czasów. Trzy stopnie wystarczą - więcej znaczy brak decyzji. */
export const DURATION = {
  /** Reakcja na wejście elementu w kadr - ma być ledwie zauważalna. */
  reveal: 0.4,
  /** Rysowanie śladu na krótkim dystansie (podkreślenie, łącznik). */
  draw: 0.7,
  /** Rysowanie śladu przez całą sekcję (proces, oś). */
  trace: 0.9,
} as const;

/**
 * Dystans przesunięcia przy wejściu w kadr.
 *
 * Celowo mały. §9 wizji zakazuje „identycznych fade + slide na każdej sekcji";
 * skoro sekcji jest dużo, gest musi być na tyle cichy, żeby jego powtórzenie
 * nie było męczące.
 */
export const REVEAL_OFFSET = 8;

/**
 * Opóźnienie kaskady dla list. Ograniczaj indeks (np. `Math.min(i, 4)`), żeby
 * długie listy nie kończyły się kilkusekundowym czekaniem na ostatni element.
 */
export const STAGGER = 0.06;
