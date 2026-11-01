/**
 * Uchwały Studenckiej Komisji Wyborczej (kalendarze wyborcze, wyniki,
 * komunikaty) - wersja awaryjna z kodu.
 *
 * Właściwe źródło to zakładka „Uchwały SKW” w arkuszu „Treści strony”, z tymi
 * samymi kolumnami co „Uchwały RUSS” (numer, data, tytuł, tytuł EN, link).
 */
import type { RussResolution } from "./russ";

export type SkwResolution = RussResolution;

export const UCHWALY_SKW_Z_KODU: SkwResolution[] = [];
