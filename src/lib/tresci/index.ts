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
import { ZARZADZENIA_Z_KODU, type Zarzadzenie } from "../zarzadzenia";
import { POSIEDZENIA_Z_KODU, UCHWALY_Z_KODU, type RussMeeting, type RussResolution } from "../russ";
import { UCHWALY_SKW_Z_KODU, type SkwResolution } from "../skw";
import { readTab, sheetId } from "./arkusz";
import { parseTerminy, parseZamiany, type RowError } from "./parse-terminy";
import { parseZarzadzenia } from "./parse-zarzadzenia";
import { parsePosiedzenia, parseUchwaly } from "./parse-russ";

export interface TabStatus {
  tab: string;
  source: "arkusz" | "kod";
  /** Dlaczego wzięliśmy dane z kodu. */
  reason?: string;
  rows: number;
  errors: RowError[];
}

export const TABS = { terminy: "Terminy", zamiany: "Zamiany dni", zarzadzenia: "Zarządzenia",
  posiedzenia: "Posiedzenia RUSS",
  uchwaly: "Uchwały RUSS",
  skwUchwaly: "Uchwały SKW",
} as const;

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

export async function getZarzadzeniaData(): Promise<{ items: Zarzadzenie[]; status: TabStatus }> {
  return fromSheet(TABS.zarzadzenia, parseZarzadzenia, ZARZADZENIA_Z_KODU);
}

export async function getRussData(): Promise<{ meetings: RussMeeting[]; resolutions: RussResolution[]; status: TabStatus[] }> {
  const [meetings, resolutions] = await Promise.all([
    fromSheet(TABS.posiedzenia, parsePosiedzenia, POSIEDZENIA_Z_KODU),
    fromSheet(TABS.uchwaly, parseUchwaly, UCHWALY_Z_KODU),
  ]);
  return { meetings: meetings.items, resolutions: resolutions.items, status: [meetings.status, resolutions.status] };
}

/** Ta sama budowa co uchwały Rady, więc ten sam parser. */
export async function getSkwData(): Promise<{ resolutions: SkwResolution[]; status: TabStatus }> {
  const res = await fromSheet(TABS.skwUchwaly, parseUchwaly, UCHWALY_SKW_Z_KODU);
  return { resolutions: res.items, status: res.status };
}

export function isSheetConfigured(): boolean {
  return sheetId() !== null;
}
