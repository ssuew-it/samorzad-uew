/**
 * Siedem praw z kodeksu na stronie Praw studenta, w kolejności paragrafów.
 *
 * Wspólne dla Praw studenta (selektor sytuacji) i Rzecznika (temat formularza
 * przekazany w `?sprawa=`). Rzecznik przyjmuje z adresu wyłącznie klucz z tej
 * listy i sam składa z niego temat - nigdy dowolny tekst z URL.
 */
export const RIGHT_KEYS = ["repeat", "ios", "absence", "change", "ects", "commission", "mode"] as const;

export type RightKey = (typeof RIGHT_KEYS)[number];

export const isRightKey = (value: unknown): value is RightKey =>
  typeof value === "string" && (RIGHT_KEYS as readonly string[]).includes(value);

/** Numer paragrafu, np. „§1”. */
export const rightRef = (key: RightKey) => `§${RIGHT_KEYS.indexOf(key) + 1}`;

/** Link do formularza Rzecznika z tematem tej sprawy. */
export const rzecznikHref = (key: RightKey) => `/rzecznik-praw-studenta?sprawa=${key}#napisz`;
