/**
 * Dodatki do planu grupy: lektoraty (SJO) i zajęcia WF (SWFiS).
 *
 * Plan Uczelni nie przypisuje ich do grup kierunków - student sam wybiera
 * grupę językową i termin WF. Tu są czyste funkcje na danych z pliku planu
 * (scripts/import-plan-zajec.mjs), żeby dało się je testować bez sieci.
 */
import type { PlanEntry, SjoSection } from "./parse";

export interface ExtrasSnapshot {
  semesters: number[];
  /** Klucz: `${se}|${tryb SJO}|${rok}`. */
  sjo?: Record<string, SjoSection[]>;
  /** Klucz: numer semestru. */
  wf?: Record<string, number[]>;
  entries: Record<string, Omit<PlanEntry, "id">>;
}

/**
 * Lektoraty są podzielone na tryby polskich studiów (S1, S2, N1, N2).
 * Kierunki anglojęzyczne mają swoje sekcje w tych samych siatkach, więc
 * mapujemy je na tryb tego samego stopnia; Erasmus nie ma lektoratów SJO.
 */
const SJO_MODE: Record<string, string> = {
  S1: "S1",
  S2: "S2",
  N1: "N1",
  N2: "N2",
  BachelorFT: "S1",
  BachelorPT: "N1",
  MasterFT: "S2",
  MasterPT: "N2",
};

export const sjoModeFor = (mode: string): string | null => SJO_MODE[mode] ?? null;

const ALL = "WSZYSTKIE KIERUNKI";

/**
 * Sekcje lektoratów dla rocznika: te z kodem kierunku studenta i wspólne dla
 * wszystkich kierunków. Gdy kierunek nie pasuje do żadnej sekcji (np. nowy
 * kod), pokazujemy wszystkie - lepiej dłuższa lista niż pusta.
 */
export function lectoratesFor(snap: ExtrasSnapshot, mode: string, program: string, year: string): SjoSection[] {
  const sjoMode = sjoModeFor(mode);
  if (!sjoMode) return [];
  const sections = snap.semesters.flatMap((se) => snap.sjo?.[`${se}|${sjoMode}|${year}`] ?? []);
  const own = sections.filter((s) => s.programs.includes(program));
  if (!own.length) return sections;
  return [...own, ...sections.filter((s) => s.programs.includes(ALL))];
}

const WEEKDAYS = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

export interface WfOption {
  id: number;
  discipline: string;
  /** „wtorek 9:45-11:15, Jan Nowak” */
  label: string;
}

/** Zajęcia WF posortowane według dyscypliny, z dniem tygodnia i prowadzącym. */
export function wfOptions(snap: ExtrasSnapshot): WfOption[] {
  const out: WfOption[] = [];
  for (const se of snap.semesters)
    for (const id of snap.wf?.[String(se)] ?? []) {
      const e = snap.entries[String(id)];
      const first = e?.dates[0];
      if (!e || !first) continue;
      const discipline = /\(([^)]+)\)/.exec(e.subject)?.[1]?.trim() ?? e.subject;
      const day = WEEKDAYS[new Date(`${first.date}T12:00:00`).getDay()];
      const who = first.lecturer ? `, ${first.lecturer}` : "";
      out.push({ id, discipline, label: `${day} ${first.from}-${first.to}${who}` });
    }
  return out.sort((a, b) => a.discipline.localeCompare(b.discipline, "pl") || a.label.localeCompare(b.label, "pl"));
}

/**
 * Pozycje, które wolno dołożyć do kalendarza: tylko lektoraty i WF z pliku.
 * Adres kalendarza jest publiczny - bez tej listy dało się nim pobierać
 * dowolne pozycje planu.
 */
export function allowedExtraIds(snap: ExtrasSnapshot): Set<number> {
  const ids = new Set<number>();
  for (const sections of Object.values(snap.sjo ?? {})) for (const s of sections) for (const g of s.groups) ids.add(g.id);
  for (const list of Object.values(snap.wf ?? {})) for (const id of list) ids.add(id);
  return ids;
}
