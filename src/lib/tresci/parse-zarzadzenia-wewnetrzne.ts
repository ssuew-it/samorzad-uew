/**
 * Zakładka „Zarządzenia wewnętrzne” z arkusza „Treści strony” → rejestr
 * zarządzeń w Strefie Działacza (tylko dla zalogowanych).
 *
 * Kolumny: Wydający, Numer, Data, Tytuł, Link (opcjonalnie), Uchyla i Zmienia
 * (opcjonalnie, pełne numery po przecinku). Błędny wiersz jest pomijany albo
 * pokazany bez tego, co w nim złe - i opisany po ludzku w podglądzie „Treści
 * strony” (instrukcja: docs/JAK-EDYTOWAC.md).
 */
import { csvRecords } from "../csv";
import { grupaWydajacego, type ZarzadzenieWewn } from "../zarzadzenia-wewnetrzne";
import { parseSheetDate, type RowError } from "./parse-terminy";

const numery = (komorka = ""): string[] =>
  komorka
    .split(/[,;\n]/)
    .map((n) => n.trim())
    .filter(Boolean);

export function parseZarzadzeniaWewnetrzne(csv: string): { items: ZarzadzenieWewn[]; errors: RowError[] } {
  const items: ZarzadzenieWewn[] = [];
  const errors: RowError[] = [];

  for (const { line, values: v } of csvRecords(csv)) {
    const fail = (message: string) => errors.push({ line, message });
    const issuer = (v.wydajacy ?? "").trim();
    if (!issuer) {
      fail("brak wydającego (np. „Zarząd” albo „Wiceprzewodniczący ds. Public Relations”)");
      continue;
    }
    const number = (v.numer ?? "").trim();
    if (!number) {
      fail("brak numeru zarządzenia (np. 01/ZRZ-SIDO/2026-2027)");
      continue;
    }
    const title = (v.tytul ?? "").trim();
    if (!title) {
      fail("brak tytułu");
      continue;
    }
    const date = parseSheetDate(v.data ?? "");
    if (!date) {
      fail(`zła data (${v.data || "puste"}) - wpisz datę jako 2026-10-01 albo 01.10.2026`);
      continue;
    }
    const group = grupaWydajacego(issuer);
    if (!group) {
      fail(`„${issuer}” nie pasuje do żadnej grupy (Przewodniczący, Wiceprzewodniczący…, Członek Zarządu…, Zarząd) - zarządzenie widać tylko przy filtrze „Wszyscy”`);
    }
    let href = (v.link ?? "").trim() || undefined;
    if (href && (!/^https?:\/\//.test(href) || href.includes("…"))) {
      fail(`„link” musi być pełnym adresem (https://…), a jest „${href}” - zarządzenie pokazujemy bez pliku`);
      href = undefined;
    }
    items.push({ line, number, date, title, issuer, group, ...(href ? { href } : {}), repeals: numery(v.uchyla), amends: numery(v.zmienia) });
  }

  return { items, errors };
}
