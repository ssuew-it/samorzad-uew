/**
 * Pobiera CAŁY plan zajęć bieżącego roku akademickiego do
 * src/lib/plan-zajec/plan.json (i menu do drzewo.json):
 * - menu planu ze strony głównej (adres „/”; index.php zasłania Cloudflare),
 * - siatki wszystkich roczników: studia polskie, anglojęzyczne i Erasmus,
 * - grupy lektoratów (gałąź SJO) i zajęcia WF (SWFiS) - student dokłada je
 *   do planu swojej grupy,
 * - wszystkie pozycje planu z terminami.
 *
 * DLACZEGO LOKALNIE, A NIE NA SERWERZE
 * plan.ue.wroc.pl stoi za ochroną Cloudflare, która odrzuca zapytania z centrów
 * danych - serwery Vercela dostają odmowę niezależnie od regionu (sprawdzone
 * 4.11.2026: iad1 i fra1). Z polskiego łącza domowego strony odpowiadają
 * normalnie. Dlatego plan pobiera ten skrypt, a serwer buduje z pliku listę
 * grup i kalendarz ICS dla Google.
 *
 * KIEDY URUCHAMIAĆ
 * Na początku semestru i potem co tydzień albo po każdej ogłoszonej zmianie
 * planu: `npm run import:plan`, a potem commit i push. Subskrypcje w Kalendarzu
 * Google dociągną zmiany same (odświeżają się co kilka godzin).
 *
 * Skrypt jest grzeczny dla serwisu Uczelni: najwyżej 4 zapytania naraz.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEntry, parseGrid, parseMenuExtras, parseSjoGroups, parseTree, parseWfIds } from "../src/lib/plan-zajec/parse.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src/lib/plan-zajec/plan.json");
const BASE = "https://plan.ue.wroc.pl/";
const CONCURRENCY = 1;
/**
 * Przerwa po każdym zapytaniu. Serwis planu odpowiada 429 już po ok. 40
 * zapytaniach na minutę (12.11.2026: blokada po 37 siatkach przy 1,1 s).
 */
const PAUSE_MS = 2000;
/**
 * `--tylko-nowe`: pozycje, które są już w plan.json, bierzemy z pliku i
 * pobieramy tylko nowe (np. po dodaniu lektoratów). Szybciej, ale nie
 * zauważy zmian terminów w starych pozycjach - zwykłe odświeżenie idzie bez
 * tej opcji.
 */
const ONLY_NEW = process.argv.includes("--tylko-nowe");
/** Postęp zapisywany w trakcie: przerwany import wznawia się od miejsca przerwania. */
const PARTIAL = join(tmpdir(), "ssuew-plan-zajec.partial.json");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(path, attempt = 1) {
  const res = await fetch(BASE + path, { headers: HEADERS, signal: AbortSignal.timeout(20_000) }).catch((e) => ({ ok: false, status: e.name, headers: new Headers() }));
  await sleep(PAUSE_MS);
  if (res.status === 429 && attempt < 4) {
    // 1, 2, 4 minuty - krótsze czekanie tylko przedłużało blokadę.
    const wait = Number(res.headers.get("retry-after")) * 1000 || 60_000 * 2 ** (attempt - 1);
    console.log(`  429 - czekam ${Math.round(wait / 1000)} s`);
    await sleep(wait);
    return page(path, attempt + 1);
  }
  if (res.ok) {
    const html = await res.text();
    if (/Just a moment|Enable JavaScript and cookies/i.test(html)) throw new Error("Cloudflare zablokował zapytanie - uruchom skrypt z innego łącza");
    return html;
  }
  if (attempt < 3) {
    await new Promise((r) => setTimeout(r, 1000 * attempt));
    return page(path, attempt + 1);
  }
  if (res.status === 429 || res.status === 403) {
    // Dalsze pytanie tylko przedłuża blokadę - lepiej przerwać i wrócić później.
    throw new Error(`plan.ue.wroc.pl ogranicza zapytania (${res.status}). Postęp jest zapisany - uruchom import ponownie za kilka godzin.`);
  }
  throw new Error(`plan.ue.wroc.pl ${res.status} ${path}`);
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
        if (++done % 200 === 0) console.log(`  ${done}/${items.length}`);
      }
    }),
  );
  return out;
}

// Menu: strona główna planu. Z niej drzewo trybów i kierunków oraz linki do
// lektoratów i WF. Zapisujemy drzewo od razu - serwer czyta je z pliku.
const menu = await page("");
const tree = parseTree(menu);
if (!tree.length) throw new Error("Nie znaleziono semestrów w menu planu - zmienił się format strony?");
writeFileSync(join(root, "src/lib/plan-zajec/drzewo.json"), JSON.stringify(tree) + "\n", "utf8");
const menuExtras = parseMenuExtras(menu);

const years = tree.map((s) => s.label.split(" ")[0]).sort();
const latest = years[years.length - 1];
const semesters = tree.filter((s) => s.label.startsWith(latest));
console.log(`Rok ${latest}: ${semesters.map((s) => s.label).join(", ")}`);

const jobs = [];
for (const sem of semesters)
  for (const m of sem.modes)
    for (const p of m.programs)
      for (const y of p.years) jobs.push({ se: sem.se, mode: m.code, program: p.code, year: y.year, gr: y.gr });

console.log(`Siatki grup: ${jobs.length}`);
const gridPath = (se, gr) => `l_pozycjaplanu1.php?se=${se}&gr=${encodeURIComponent(gr).replace(/%2F/g, "/")}`;
// Wznowienie: postęp z ostatnich 12 godzin.
const partial = existsSync(PARTIAL) && Date.now() - statSync(PARTIAL).mtimeMs < 12 * 3600_000 ? JSON.parse(readFileSync(PARTIAL, "utf8")) : {};
const saveProgress = () => writeFileSync(PARTIAL, JSON.stringify({ grids, entries, sjo, wf }));
const grids = partial.grids ?? {};
const entries = partial.entries ?? {};
if (ONLY_NEW && existsSync(OUT)) {
  const previous = JSON.parse(readFileSync(OUT, "utf8")).entries ?? {};
  for (const [id, e] of Object.entries(previous)) if (!(id in entries)) entries[id] = e;
  console.log(`--tylko-nowe: ${Object.keys(previous).length} pozycji z poprzedniego pliku`);
}
const sjo = partial.sjo ?? {};
const wf = partial.wf ?? {};
if (Object.keys(grids).length) console.log(`Wznawiam: ${Object.keys(grids).length} siatek, ${Object.keys(entries).length} pozycji z poprzedniego uruchomienia`);
await mapLimit(jobs.filter((j) => !grids[`${j.se}|${j.mode}|${j.program}|${j.year}`]), CONCURRENCY, async (j) => {
  const grid = parseGrid(await page(gridPath(j.se, j.gr)));
  grids[`${j.se}|${j.mode}|${j.program}|${j.year}`] = Object.fromEntries(grid);
  saveProgress();
});

// Lektoraty: siatka SJO dla trybu i roku (S1 rok 2…) - grupy z legendy.
for (const sem of semesters) {
  const extra = menuExtras.find((e) => e.se === sem.se);
  if (!extra) continue;
  for (const j of extra.sjo) {
    const key = `${sem.se}|${j.mode}|${j.year}`;
    if (sjo[key]) continue;
    sjo[key] = parseSjoGroups(await page(gridPath(sem.se, j.gr)));
    saveProgress();
  }
  if (extra.wf && !wf[sem.se]) {
    wf[sem.se] = parseWfIds(await page(extra.wf));
    saveProgress();
  }
}
console.log(`Lektoraty: ${Object.values(sjo).flat().reduce((n, s) => n + s.groups.length, 0)} grup, WF: ${Object.values(wf).flat().length} zajęć`);

const ids = [
  ...new Set([
    ...Object.values(grids).flatMap((g) => Object.values(g).flat()),
    ...Object.values(sjo).flatMap((sections) => sections.flatMap((s) => s.groups.map((g) => g.id))),
    ...Object.values(wf).flat(),
  ]),
];
console.log(`Pozycje planu: ${ids.length}`);
let sinceSave = 0;
const failed = [];
await mapLimit(ids.filter((id) => !(id in entries)), CONCURRENCY, async (id) => {
  let html;
  try {
    html = await page(`p_pozycja.php?id=${id}`);
  } catch (err) {
    // Blokada serwisu: przerywamy (postęp zapisany). Pojedynczy błąd sieci: pomijamy
    // pozycję - kolejne uruchomienie dociągnie ją, bo nie trafia do `entries`.
    if (/ogranicza zapytania|Cloudflare/.test(err.message)) { saveProgress(); throw err; }
    failed.push(id);
    return;
  }
  const e = parseEntry(id, html);
  // null = pozycja bez terminów; zapisujemy, żeby wznowienie jej nie pobierało.
  entries[id] = e && e.dates.length ? { subject: e.subject, kind: e.kind, half: e.half, dates: e.dates } : null;
  if (++sinceSave >= 50) { sinceSave = 0; saveProgress(); }
});
saveProgress();
if (failed.length) console.log(`Nie pobrano ${failed.length} pozycji (błąd sieci) - uruchom import ponownie, żeby je dociągnąć.`);
// Bez pustych pozycji i bez takich, których nie ma już w żadnej siatce
// (z `--tylko-nowe` w pliku zostawałyby usunięte z planu zajęcia).
const current = new Set(ids.map(String));
for (const id of Object.keys(entries)) if (entries[id] === null || !current.has(id)) delete entries[id];

const out = { generatedAt: new Date().toISOString(), year: latest, semesters: semesters.map((s) => s.se), grids, sjo, wf, entries };
writeFileSync(OUT, JSON.stringify(out));
const kb = Math.round(Buffer.byteLength(JSON.stringify(out)) / 1024);
console.log(`Zapisano ${OUT}: ${Object.keys(grids).length} siatek, ${Object.keys(entries).length} pozycji, ${kb} KB`);
