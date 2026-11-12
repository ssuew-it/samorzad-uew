/**
 * Plan zajęć UEW (plan.ue.wroc.pl) → dane do subskrypcji kalendarza.
 *
 * Serwis planu nie ma eksportu do kalendarza, ale ma trzy rodzaje stron, które
 * razem dają wszystko:
 * - index.php: drzewo menu (semestry → tryb → kierunek → rok → grupa),
 *   zapisane w JavaScripcie jako wywołania appendChild(...);
 * - l_pozycjaplanu1.php?se=…&gr=…: tygodniowa siatka rocznika, gdzie każdy
 *   wiersz to podgrupa („01 FiR”), a komórki linkują do pozycji planu;
 * - p_pozycja.php?id=…: jedna pozycja z pełną listą terminów (data, godziny,
 *   sala, prowadzący) - z niej powstają wydarzenia w kalendarzu.
 *
 * Czyste funkcje bez sieci, żeby dało się je testować na zapisanym HTML.
 */

export interface PlanSemester {
  se: number;
  /** np. „2026/27 zimowy” */
  label: string;
  modes: PlanMode[];
}

export interface PlanMode {
  /** S1, S2, N1, N2, BachelorFT… */
  code: string;
  label: string;
  programs: PlanProgram[];
}

export interface PlanProgram {
  /** Skrót kierunku z planu, np. „FIR”. */
  code: string;
  years: { year: string; gr: string }[];
}

export interface PlanEntry {
  id: number;
  subject: string;
  /** Wykład, Ćwiczenia, Lektorat… */
  kind: string;
  /** „A”, „B” albo pusty, gdy zajęcia są dla całej podgrupy. */
  half: string;
  dates: { date: string; from: string; to: string; room: string; lecturer: string }[];
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const clean = (s: string) => decode(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

/**
 * Tryby, które pokazujemy studentom: polskie studia, potem anglojęzyczne
 * i Erasmus. SJO (lektoraty) i SWFiS (WF) to nie tryby studiów - czyta je
 * osobno `parseMenuExtras`, a student dokłada je do planu swojej grupy.
 */
export const MODE_ORDER = ["S1", "S2", "N1", "N2", "BachelorFT", "BachelorPT", "MasterFT", "MasterPT", "Erasmus"];

export function parseTree(source: string): PlanSemester[] {
  const semesters: PlanSemester[] = [];
  let academicYear = "";
  let semester: PlanSemester | null = null;
  let mode: PlanMode | null = null;
  let program: PlanProgram | null = null;

  const call = /(aux\w+)\s*=\s*appendChild\s*\(\s*(\w+)\s*,\s*(['"])([^'"]*)\3\s*,\s*(-?\d+)\s*,\s*(['"])([^'"]*)\6\s*,\s*(['"])([^'"]*)\8\s*\)|appendChild\s*\(\s*(\w+)\s*,\s*(['"])([^'"]*)\11\s*,\s*-1\s*,\s*(['"])([^'"]*)\13/g;
  for (const m of source.matchAll(call)) {
    if (m[1]) {
      const [, target, , , name, , , , , label] = m;
      if (target === "auxA") {
        academicYear = name;
      } else if (target === "aux0") {
        semester = { se: 0, label: `${academicYear} ${name}`.trim(), modes: [] };
        semesters.push(semester);
      } else if (target === "aux1" && semester) {
        mode = { code: name, label, programs: [] };
        semester.modes.push(mode);
      } else if (target === "aux2" && mode) {
        program = { code: name, years: [] };
        mode.programs.push(program);
      }
    } else if (program && semester) {
      const year = m[12];
      const href = m[14];
      const se = Number(/se=(\d+)/.exec(href)?.[1] ?? 0);
      const gr = /gr=([^&]+)/.exec(href)?.[1];
      if (!gr) continue;
      if (!semester.se) semester.se = se;
      program.years.push({ year, gr: decodeURIComponent(gr) });
    }
  }
  return semesters
    .filter((s) => s.se > 0)
    .map((s) => ({
      ...s,
      modes: s.modes
        .filter((md) => MODE_ORDER.includes(md.code) && md.programs.some((p) => p.years.length))
        .sort((a, b) => MODE_ORDER.indexOf(a.code) - MODE_ORDER.indexOf(b.code)),
    }));
}

/**
 * Siatka rocznika → identyfikatory pozycji dla każdej podgrupy.
 * Wiersz zaczyna się komórką z nazwą podgrupy (class=h2), a do następnego
 * wiersza należą wszystkie linki p_pozycja.php?id=…
 */
export function parseGrid(source: string): Map<string, number[]> {
  const out = new Map<string, number[]>();
  for (const row of source.split(/<tr\b/i)) {
    const name = /<td class=h2[^>]*>([^<]+)<\/td>/i.exec(row)?.[1];
    if (!name) continue;
    const label = clean(name);
    const ids = [...row.matchAll(/p_pozycja\.php\?id=(\d+)/g)].map((x) => Number(x[1]));
    const list = out.get(label) ?? [];
    for (const id of ids) if (!list.includes(id)) list.push(id);
    out.set(label, list);
  }
  return out;
}

export function parseEntry(id: number, source: string): PlanEntry | null {
  const field = (name: string) => {
    const re = new RegExp(`<b>${name}</b></td><td[^>]*>([\\s\\S]*?)</t[dr]>`, "i");
    return clean(re.exec(source)?.[1] ?? "");
  };
  const subjectRaw = field("Przedmiot");
  if (!subjectRaw) return null;
  // „Statystyka ST (STAT), Ćwiczenia” → przedmiot i forma zajęć.
  const comma = subjectRaw.lastIndexOf(",");
  const subjectPart = comma > 0 ? subjectRaw.slice(0, comma) : subjectRaw;
  const kind = comma > 0 ? subjectRaw.slice(comma + 1).trim() : "";
  const subject = subjectPart.replace(/\s+[A-ZĄĆĘŁŃÓŚŹŻ0-9 ]{1,12}\s*\([^)]*\)\s*$/u, "").trim() || subjectPart;
  const half = /-połowa\s+([AB])/i.exec(source)?.[1]?.toUpperCase() ?? "";

  const dates: PlanEntry["dates"] = [];
  const rowRe = /<td class=h2 align=center><a[^>]*><b>\d+\.<\/b><\/a><\/td>((?:<td[^>]*>[\s\S]*?<\/td>){6})/g;
  for (const r of source.matchAll(rowRe)) {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => clean(c[1]));
    const [date, from, , to, room, lecturer] = cells;
    const d = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(date ?? "");
    if (!d || !/^\d{1,2}:\d{2}$/.test(from ?? "") || !/^\d{1,2}:\d{2}$/.test(to ?? "")) continue;
    dates.push({ date: `${d[1]}-${d[2]}-${d[3]}`, from, to, room: room ?? "", lecturer: lecturer ?? "" });
  }
  return { id, subject, kind, half, dates };
}

export interface MenuExtras {
  se: number;
  /** Siatki lektoratów: tryb studiów (S1…N2) i rok, którego dotyczą. */
  sjo: { mode: string; year: string; gr: string }[];
  /** Strona z harmonogramem WF (SWFiS) albo pusty napis, gdy jej nie ma. */
  wf: string;
}

/**
 * Z menu planu: siatki lektoratów (gałąź „SJO”) i strona WF („SWFiS”) dla
 * każdego semestru. Gałąź SJO ma budowę jak kierunek („kierunkiem” jest tryb
 * studiów: S1, N1…), a SWFiS to jeden link do osobnego formatu strony.
 */
export function parseMenuExtras(source: string): MenuExtras[] {
  const out = new Map<number, MenuExtras>();
  const get = (se: number) => out.get(se) ?? out.set(se, { se, sjo: [], wf: "" }).get(se)!;
  for (const m of source.matchAll(/l_pozycjaplanu_ogl_3\.php\?se=(\d+)&wy=(\d+)/g)) {
    get(Number(m[1])).wf = m[0];
  }
  let inSjo = false;
  let sjoMode = "";
  for (const line of source.split(/;\s*/)) {
    const branch = /aux1\s*=\s*appendChild\s*\(\s*aux0\s*,\s*["']([^"']+)["']/.exec(line);
    if (branch) {
      inSjo = branch[1] === "SJO";
      continue;
    }
    if (/auxO1\s*=|auxE\s*=|auxA\s*=/.test(line)) inSjo = false;
    if (!inSjo) continue;
    const prog = /aux2\s*=\s*appendChild\s*\(\s*aux1\s*,\s*["']([^"']+)["']/.exec(line);
    if (prog) {
      sjoMode = prog[1];
      continue;
    }
    const leaf = /appendChild\s*\(\s*aux2\s*,\s*'([^']*)'\s*,\s*-1\s*,\s*'[^']*se=(\d+)&gr=([^']+)'/.exec(line);
    if (leaf && sjoMode) get(Number(leaf[2])).sjo.push({ mode: sjoMode, year: leaf[1], gr: decodeURIComponent(leaf[3]) });
  }
  return [...out.values()].sort((a, b) => a.se - b.se);
}

export interface SjoSection {
  /** Kody kierunków z nagłówka sekcji, np. ["ZIIP", "NG", "IZ"]. */
  programs: string[];
  groups: { id: number; label: string }[];
}

/**
 * Grupy lektoratów z legendy siatki SJO. Legenda dzieli grupy na sekcje
 * według kierunków („JO ZIIP, NG, IZ”), a każda grupa to link z językiem,
 * prowadzącym i numerem („Język angielski (mgr Jan Kowalski) 3S”). Pozycja
 * bez prowadzącego jest zbiorcza dla sekcji - nie jest grupą do wyboru.
 */
export function parseSjoGroups(source: string): SjoSection[] {
  const sections: SjoSection[] = [];
  let current: SjoSection | null = null;
  const token = /<td class=h3 colspan=2><b>([^<]+)<\/b>|<a href='\.\/p_pozycja\.php\?id=(\d+)'>([^<]*)<\/a>/g;
  for (const m of source.matchAll(token)) {
    if (m[1]) {
      const head = clean(m[1]).replace(/^JO\d*\s+/, "");
      if (!head || head === "LEGENDA") continue;
      current = { programs: head.split(/\s*,\s*/).filter(Boolean), groups: [] };
      sections.push(current);
    } else if (current) {
      const label = clean(m[3]);
      if (!/\(.+\)/.test(label)) continue;
      const id = Number(m[2]);
      if (!current.groups.some((g) => g.id === id)) current.groups.push({ id, label });
    }
  }
  return sections.filter((s) => s.groups.length);
}

/** Pozycje planu ze strony WF (SWFiS) - każda to jedna grupa zajęć jednej dyscypliny. */
export function parseWfIds(source: string): number[] {
  return [...new Set([...source.matchAll(/p_pozycja\.php\?id=(\d+)/g)].map((m) => Number(m[1])))].filter((id) => id > 0);
}
