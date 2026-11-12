/**
 * Pobieranie planu zajęć z plan.ue.wroc.pl z pamięcią podręczną Next.js.
 *
 * Plan zmienia się rzadko, a jeden kalendarz to kilkadziesiąt stron pozycji,
 * więc każda strona jest trzymana 6 godzin. Dzięki temu subskrypcje Google
 * (odpytujące co kilka godzin) nie obciążają serwisu Uczelni.
 *
 * Menu planu (index.php) stoi za ochroną Cloudflare, więc serwer go nie
 * pobierze. Trzymamy je w drzewo.json i odświeżamy przy nowym semestrze
 * skryptem scripts/import-plan-drzewo.mjs. Siatki grup i pozycje planu
 * pobieramy na żywo - te strony ochrona przepuszcza.
 */
import "server-only";
import { parseEntry, parseGrid, type PlanEntry, type PlanSemester, type SjoSection } from "./parse";
import { allowedExtraIds, lectoratesFor, wfOptions, type WfOption } from "./extras";
import drzewo from "./drzewo.json";
import snapshot from "./plan.json";

const BASE = "https://plan.ue.wroc.pl/";
const TTL = 6 * 60 * 60;
const CONCURRENCY = 6;

async function page(path: string): Promise<string> {
  const res = await fetch(BASE + path, {
    headers: {
      // Nagłówki przeglądarki: bez nich ochrona serwisu planu odrzuca zapytanie.
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
    },
    next: { revalidate: TTL, tags: ["plan-zajec"] },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`plan.ue.wroc.pl ${res.status} ${path}`);
  const html = await res.text();
  // Strona ochrony Cloudflare zamiast planu - traktujemy jak błąd, nie jak pusty plan.
  if (/Just a moment|Enable JavaScript and cookies/i.test(html)) throw new Error("plan.ue.wroc.pl: ochrona antybotowa");
  return html;
}

export async function getTree(): Promise<PlanSemester[]> {
  return drzewo as PlanSemester[];
}

/** Semestry najnowszego roku akademickiego w menu planu (np. „2026/27 zimowy”). */
export function currentSemesters(tree: PlanSemester[]): PlanSemester[] {
  const years = tree.map((s) => s.label.split(" ")[0]).sort();
  const latest = years[years.length - 1];
  return tree.filter((s) => s.label.startsWith(latest));
}

const gridPath = (se: number, gr: string) => `l_pozycjaplanu1.php?se=${se}&gr=${encodeURIComponent(gr).replace(/%2F/g, "/")}`;

export async function getSubgroups(se: number, gr: string): Promise<string[]> {
  return [...parseGrid(await page(gridPath(se, gr))).keys()];
}

/**
 * Plan pobrany skryptem scripts/import-plan-zajec.mjs. Z serwerów Vercela
 * plan.ue.wroc.pl jest niedostępny (Cloudflare odrzuca centra danych), więc to
 * jest główne źródło; pobieranie na żywo zostaje jako zapas, np. lokalnie
 * albo dla semestru, którego w pliku jeszcze nie ma.
 */
type Snapshot = {
  generatedAt: string;
  year: string;
  semesters: number[];
  grids: Record<string, Record<string, number[]>>;
  /** Lektoraty: `${se}|${tryb SJO}|${rok}` → sekcje z grupami (od importu 12.11.2026). */
  sjo?: Record<string, SjoSection[]>;
  /** Zajęcia WF w semestrze. */
  wf?: Record<string, number[]>;
  entries: Record<string, Omit<PlanEntry, "id">>;
};
const SNAP = snapshot as unknown as Snapshot;
const snapKey = (se: number, mode: string, program: string, year: string) => `${se}|${mode}|${program}|${year}`;

/** Data pobrania planu do pliku - pokazujemy ją przy planie zajęć. */
export function planSnapshotDate(): string | null {
  return SNAP.generatedAt || null;
}

/** Podgrupy rocznika w bieżącym roku: z pliku, a gdy go brak - na żywo. */
export async function getSubgroupsFor(mode: string, program: string, year: string): Promise<string[]> {
  const groups = new Set<string>();
  for (const sem of currentSemesters(await getTree())) {
    const grid = SNAP.grids[snapKey(sem.se, mode, program, year)];
    if (grid) {
      Object.keys(grid).forEach((g) => groups.add(g));
      continue;
    }
    const gr = sem.modes.find((m) => m.code === mode)?.programs.find((p) => p.code === program)?.years.find((y) => y.year === year)?.gr;
    if (gr) for (const g of await getSubgroups(sem.se, gr)) groups.add(g);
  }
  return [...groups];
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

export interface FeedQuery {
  mode: string;
  program: string;
  year: string;
  subgroup: string;
  /** „A”, „B” albo pusty - cała podgrupa. */
  half: string;
  /** Wybrane lektoraty i zajęcia WF (pozycje planu). */
  extras?: number[];
}

/** Lektoraty i WF do wyboru dla rocznika - tylko z pliku planu. */
export function getExtrasFor(mode: string, program: string, year: string): { lectorates: SjoSection[]; wf: WfOption[] } {
  return { lectorates: lectoratesFor(SNAP, mode, program, year), wf: wfOptions(SNAP) };
}

/**
 * Wszystkie zajęcia podgrupy w bieżącym roku akademickim. Szuka rocznika
 * w każdym semestrze tego roku, więc gdy w menu pojawi się semestr letni,
 * subskrypcja sama go dociągnie.
 */
export async function getFeedEntries(q: FeedQuery): Promise<PlanEntry[]> {
  const tree = await getTree();
  const ids = new Set<number>();
  for (const sem of currentSemesters(tree)) {
    const snapGrid = SNAP.grids[snapKey(sem.se, q.mode, q.program, q.year)];
    if (snapGrid) {
      for (const id of snapGrid[q.subgroup] ?? []) ids.add(id);
      continue;
    }
    const program = sem.modes.find((m) => m.code === q.mode)?.programs.find((p) => p.code === q.program);
    const gr = program?.years.find((y) => y.year === q.year)?.gr;
    if (!gr) continue;
    const grid = parseGrid(await page(gridPath(sem.se, gr)));
    for (const id of grid.get(q.subgroup) ?? []) ids.add(id);
  }
  const entries = await mapLimit([...ids], CONCURRENCY, async (id) => {
    const saved = SNAP.entries[id];
    return saved ? { id, ...saved } : parseEntry(id, await page(`p_pozycja.php?id=${id}`));
  });
  // Lektorat i WF: tylko pozycje z pliku planu, z listy dozwolonych.
  const allowed = allowedExtraIds(SNAP);
  const extras = (q.extras ?? [])
    .filter((id) => allowed.has(id) && SNAP.entries[id])
    .map((id) => ({ id, ...SNAP.entries[id] }));
  return [
    ...entries.filter((e): e is PlanEntry => Boolean(e && e.dates.length)).filter((e) => !q.half || !e.half || e.half === q.half),
    ...extras,
  ];
}
