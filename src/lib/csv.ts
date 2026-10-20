/**
 * Parser CSV (RFC 4180) dla arkuszy Google.
 *
 * Arkusz eksportuje pola w cudzysłowach, a w tytułach i opisach bywają
 * przecinki, cudzysłowy („” zapisywane jako "") i nowe linie. Dzielenie po
 * przecinku i końcu linii psuło takie wiersze, więc tu jest pełny automat.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** Nagłówek bez wielkości liter, ogonków i spacji: „Tytuł EN” → „tytulen”. */
export function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/gi, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Wiersze jako obiekty z kluczami z nagłówka. `line` to numer wiersza
 * w arkuszu (nagłówek = 1), żeby błąd mówił, gdzie szukać.
 */
export function csvRecords(text: string): { line: number; values: Record<string, string> }[] {
  const [header, ...rest] = parseCsv(text);
  if (!header) return [];
  const keys = header.map(normalizeHeader);
  return rest
    .map((cols, i) => ({
      line: i + 2,
      values: Object.fromEntries(keys.map((k, j) => [k, (cols[j] ?? "").trim()])),
    }))
    // Puste wiersze (same przecinki) to zwykle niewypełniony koniec arkusza.
    // Odrzucamy je po nadaniu numerów, żeby numer zgadzał się z arkuszem.
    .filter((r) => Object.values(r.values).some((v) => v !== ""));
}
