/**
 * Dane kierunków generowane z e-sylabusa UEW (NIE edytować ręcznie - odśwież
 * skryptem `npm run import:sylabus`, który nadpisuje `public/data/programs.json`).
 *
 * Plik danych jest duży (~1.3 MB), więc NIE bundlujemy go - `loadPrograms()`
 * pobiera go fetch-em (statyczny asset z `public/`, kompresowany po sieci,
 * cache w przeglądarce). Ten moduł wystawia typy, czyste selektory (sterujące
 * kaskadą wyboru) oraz memoizowany loader.
 */

export type DegreeLevel = "I" | "II" | "jednolite";
export type StudyMode = "stacjonarne" | "niestacjonarne";

export interface Course {
  name: string;
  nameEn?: string;
  ects: number;
  semester: number;
  code?: string;
  /** "zal" = bez oceny (liczy się do ECTS, nie do średniej). Domyślnie oceniany. */
  pass?: "ocena" | "zal";
}
export interface Term { semester: number; courses: Course[]; }
export interface Year { year: number; terms: Term[]; }
export interface Track { mode: StudyMode; years: Year[]; }
export interface Cohort { rocznik: string; tracks: Track[]; }
export interface Degree { level: DegreeLevel; cohorts: Cohort[]; }
export interface Program { id: string; name: string; degrees: Degree[]; }

let cache: Promise<Program[]> | null = null;
/** Pobiera (raz) wygenerowany zbiór kierunków z public/. */
export function loadPrograms(): Promise<Program[]> {
  if (!cache) {
    cache = fetch("/data/programs.json").then((r) => {
      if (!r.ok) throw new Error(`programs.json ${r.status}`);
      return r.json() as Promise<Program[]>;
    });
  }
  return cache;
}

export function listPrograms(data: Program[]): { id: string; name: string }[] {
  return data.map((p) => ({ id: p.id, name: p.name }));
}
export function listLevels(data: Program[], programId: string): DegreeLevel[] {
  return data.find((p) => p.id === programId)?.degrees.map((d) => d.level) ?? [];
}
export function listModes(data: Program[], programId: string, level: DegreeLevel): StudyMode[] {
  const degree = data.find((p) => p.id === programId)?.degrees.find((d) => d.level === level);
  const set = new Set<StudyMode>();
  for (const c of degree?.cohorts ?? []) for (const t of c.tracks) set.add(t.mode);
  return [...set];
}
export function listCohorts(data: Program[], programId: string, level: DegreeLevel, mode: StudyMode): string[] {
  const degree = data.find((p) => p.id === programId)?.degrees.find((d) => d.level === level);
  return (degree?.cohorts ?? []).filter((c) => c.tracks.some((t) => t.mode === mode)).map((c) => c.rocznik);
}
export function listYears(data: Program[], programId: string, level: DegreeLevel, mode: StudyMode, rocznik: string): number[] {
  return (findTrack(data, programId, level, mode, rocznik)?.years ?? []).map((y) => y.year);
}
export function getCoursesFor(data: Program[], programId: string, level: DegreeLevel, mode: StudyMode, rocznik: string, year: number): Course[] {
  const yearEntry = findTrack(data, programId, level, mode, rocznik)?.years.find((y) => y.year === year);
  return yearEntry ? yearEntry.terms.flatMap((t) => t.courses) : [];
}

function findTrack(data: Program[], programId: string, level: DegreeLevel, mode: StudyMode, rocznik: string): Track | undefined {
  return data
    .find((p) => p.id === programId)
    ?.degrees.find((d) => d.level === level)
    ?.cohorts.find((c) => c.rocznik === rocznik)
    ?.tracks.find((t) => t.mode === mode);
}
