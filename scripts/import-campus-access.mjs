/**
 * Dostępność budynków z deklaracji dostępności Uczelni
 * (https://uew.pl/deklaracja-dostepnosci/) → src/lib/campus-access.generated.json.
 *
 * Tekst zostaje słowo w słowo, tylko podzielony na sekcje (wejście, windy,
 * toalety, obsługa, udogodnienia, parking) - to oficjalny opis Uczelni i na
 * mapie podpisujemy go jako taki.
 *
 * uew.pl stoi za Cloudflare: Playwright przechodzi tylko pierwszą stronę w danej
 * przeglądarce, więc całość robimy na jednej stronie, rozwijając sekcje.
 *
 *   node scripts/import-campus-access.mjs              (pobiera z uew.pl)
 *   node scripts/import-campus-access.mjs dane.json    (z wcześniej zapisanego zrzutu)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src/lib/campus-access.generated.json");
const SOURCE = "https://uew.pl/deklaracja-dostepnosci/";

/** Nagłówek sekcji w deklaracji → kod budynku na mapie. Filie i budynki spoza kampusu pomijamy. */
const CODES = {
  "BUDYNEK A": "A",
  "BUDYNEK A1": "A1",
  "BUDYNEK B": "B",
  "BUDYNEK C": "C",
  "BUDYNEK CKU": "CKU",
  "BUDYNEK D": "D",
  "BUDYNEK E": "E",
  "BUDYNEK F": "F",
  "BUDYNEK G": "G",
  "BUDYNEK H": "H",
  "BUDYNEK J": "J",
  "BUDYNEK K": "K",
  "BUDYNEK L": "L",
  "BUDYNEK INQUBE": "INQUBE",
  "BUDYNEK P": "P",
  "BUDYNEK SJO": "SJO",
  "BUDYNEK SWFIS": "SWFIS",
  "BUDYNEK U/W": "W",
  "BUDYNEK Z": "Z",
  "BUDYNEK B/B": "BB",
  "BUDYNEK B/F": "BF",
  "DOM STUDENTA ŚLĘŻAK": "SLEZAK",
  "DOM STUDENTA PRZEGUBOWIEC": "PRZEGUBOWIEC",
};

const SECTIONS = [
  ["entrance", /^Wejście do budynku$/i],
  ["inside", /^Komunikacja pozioma i pionowa$/i],
  ["rooms", /^Pomieszczenia i oznaczenia$/i],
  ["toilets", /^Toalety$/i],
  ["stairs", /^Schody$/i],
  ["service", /^Obsługa budynku$/i],
  ["extras", /^Udogodnienia$/i],
  ["parking", /^Parking$/i],
];

async function scrape() {
  const { chromium } = await import("playwright");
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" });
  await p.goto(SOURCE, { waitUntil: "domcontentloaded", timeout: 40000 });
  await p.waitForTimeout(2500);
  const heads = await p.evaluate(() =>
    [...document.querySelectorAll("*")].filter((n) => n.childElementCount === 0 && /^(BUDYNEK|DOM STUDENTA)/.test(n.textContent.trim())).map((n) => n.textContent.trim()),
  );
  const out = {};
  for (const h of [...new Set(heads)]) {
    await p.getByText(h, { exact: true }).first().click().catch(() => {});
    await p.waitForTimeout(500);
    out[h] = await p.evaluate((h) => {
      const n = [...document.querySelectorAll("*")].find((x) => x.childElementCount === 0 && x.textContent.trim() === h);
      let box = n;
      for (let i = 0; i < 6 && box; i++) {
        box = box.parentElement;
        if (box && box.innerText.length > h.length + 80) break;
      }
      return box ? box.innerText : "";
    }, h);
  }
  await b.close();
  return out;
}

const raw = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : await scrape();
const result = {};
for (const [head, text] of Object.entries(raw)) {
  if (/FILIA/i.test(head)) continue;
  const key = Object.keys(CODES).find((k) => head.toUpperCase().replace(/\s*[–(].*$/, "").trim() === k);
  if (!key) continue;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(1);
  const entry = { address: "", summary: "", sections: {} };
  let current = null;
  for (const line of lines) {
    if (/^Adres:/i.test(line)) { entry.address = line.replace(/^Adres:\s*/i, "").replace(/\s*\/\s*Kampus UEW/i, ""); continue; }
    const sec = SECTIONS.find(([, re]) => re.test(line));
    if (sec) { current = sec[0]; entry.sections[current] = []; continue; }
    if (!current) { entry.summary = entry.summary ? `${entry.summary} ${line}` : line; continue; }
    entry.sections[current].push(line);
  }
  result[CODES[key]] = entry;
}
writeFileSync(OUT, JSON.stringify({ source: SOURCE, fetchedAt: new Date().toISOString().slice(0, 10), buildings: result }, null, 1));
console.log(`Zapisano ${OUT}: ${Object.keys(result).length} budynków (${Object.keys(result).join(", ")})`);
