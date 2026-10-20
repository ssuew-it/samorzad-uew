/**
 * Treści strony z arkusza Google, z wersją awaryjną z kodu.
 *
 * Każda funkcja zwraca dane, które strona może pokazać OD RAZU, plus status
 * dla Strefy działacza: skąd dane przyszły i które wiersze odrzucono. Strona
 * nigdy nie jest pusta - gdy arkusz nie działa albo nie ma w nim ani jednego
 * poprawnego wiersza, używamy kopii z kodu.
 */
import "server-only";
import { TERMINY_Z_KODU, ZAMIANY_Z_KODU, type TerminyData } from "../terminy";
import { readTab, sheetId } from "./arkusz";
import { parseTerminy, parseZamiany, type RowError } from "./parse-terminy";

export interface TabStatus {
  tab: string;
  source: "arkusz" | "kod";
  /** Dlaczego wzięliśmy dane z kodu. */
  reason?: string;
  rows: number;
  errors: RowError[];
}

export const TABS = { terminy: "Terminy", zamiany: "Zamiany dni" } as const;

async function fromSheet<T>(
  tab: string,
  parse: (csv: string) => { items: T[]; errors: RowError[] },
  fallback: T[],
): Promise<{ items: T[]; status: TabStatus }> {
  const res = await readTab(tab);
  if (!res.ok) return { items: fallback, status: { tab, source: "kod", reason: res.reason, rows: fallback.length, errors: [] } };
  const { items, errors } = parse(res.csv);
  if (items.length === 0) {
    return {
      items: fallback,
      status: { tab, source: "kod", reason: "w zakładce nie ma ani jednego poprawnego wiersza", rows: fallback.length, errors },
    };
  }
  return { items, status: { tab, source: "arkusz", rows: items.length, errors } };
}

export async function getTerminyData(): Promise<{ data: TerminyData; status: TabStatus[] }> {
  const [terminy, zamiany] = await Promise.all([
    fromSheet(TABS.terminy, parseTerminy, TERMINY_Z_KODU),
    fromSheet(TABS.zamiany, parseZamiany, ZAMIANY_Z_KODU),
  ]);
  return { data: { terminy: terminy.items, zamiany: zamiany.items }, status: [terminy.status, zamiany.status] };
}

export function isSheetConfigured(): boolean {
  return sheetId() !== null;
}
