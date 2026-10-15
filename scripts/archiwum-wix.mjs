/**
 * Archiwum starej strony na Wixie (karolvogel.wixsite.com/ssuew).
 *
 * Po przenosinach domeny stara strona żyje już tylko pod adresem wixsite —
 * i zniknie, gdy wygaśnie konto. Ten skrypt zapisuje z niej to, co da się
 * przenieść na nową stronę: tekst każdej podstrony, nagłówki, linki do
 * dokumentów i zdjęcia w pełnej rozdzielczości.
 *
 * Wix składa strony JavaScriptem, więc zwykłe pobranie HTML nie wystarcza —
 * każdą stronę otwiera prawdziwa przeglądarka (Playwright), przewija do końca,
 * żeby doładować leniwe obrazki, i dopiero wtedy czyta treść.
 *
 * Wynik:
 *   archiwum-wix/tresc/<slug>.md  — treść podstrony (do pracy nad copy)
 *   archiwum-wix/tresc/index.json — zdjęcia, linki i nagłówki każdej strony
 *   archiwum-wix/zdjecia/        — zdjęcia
 *
 * Cały folder archiwum-wix/ jest poza repozytorium (.gitignore): repo jest
 * publiczne, a stara strona podawała prywatne telefony i maile członków.
 * Kopię trzymamy na Dysku Samorządu.
 *
 * Uruchomienie: node scripts/archiwum-wix.mjs
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BAZA = "https://karolvogel.wixsite.com/ssuew";
const DOKI = "archiwum-wix/tresc";
const ZDJECIA = "archiwum-wix/zdjecia";
fs.mkdirSync(DOKI, { recursive: true });
fs.mkdirSync(ZDJECIA, { recursive: true });

async function adresy() {
  const out = [];
  for (const mapa of ["pages", "event-pages", "booking-services"]) {
    const xml = await (await fetch(`${BAZA}/${mapa}-sitemap.xml`)).text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) out.push(m[1]);
  }
  return out;
}

/** Nazwa pliku z adresu: /ssuew → strona-glowna, /service-page/x → service-page--x. */
function slug(url) {
  const p = decodeURI(new URL(url).pathname).replace(/^\/ssuew\/?/, "");
  return (p || "strona-glowna").replaceAll("/", "--");
}

/** Adres oryginału zdjęcia z Wixa — bez /v1/fill/… czyli bez przycięcia i zmniejszenia. */
function oryginal(src) {
  const m = src.match(/^(https:\/\/static\.wixstatic\.com\/media\/[^/]+)/);
  return m ? m[1] : null;
}

const przegladarka = await chromium.launch();
const strona = await przegladarka.newPage({ viewport: { width: 1440, height: 1000 } });
// Wznawianie: strony już zapisane w indeksie są pomijane.
const plikIndeksu = `${DOKI}/index.json`;
const indeks = fs.existsSync(plikIndeksu) ? JSON.parse(fs.readFileSync(plikIndeksu, "utf8")) : [];
const gotowe = new Set(indeks.map((i) => i.slug));
const pobrane = new Map();

for (const url of await adresy()) {
  const s = slug(url);
  if (gotowe.has(s)) continue;
  // Nie czekamy na ciszę w sieci: Wix trzyma otwarte połączenia analityki,
  // więc „networkidle" kończyło się dopiero na limicie czasu (minuta na stronę).
  // Treść jest gotowa, gdy pojawi się kontener stron.
  let otwarta = false;
  for (let proba = 0; proba < 3 && !otwarta; proba++) {
    try {
      await strona.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      otwarta = true;
    } catch {
      console.log(`  ponawiam ${s} (${proba + 1}/3)`);
    }
  }
  if (!otwarta) continue;
  await strona.waitForSelector("#PAGES_CONTAINER, main", { timeout: 20000 }).catch(() => {});
  await strona.waitForTimeout(2500);
  // Przewijanie, żeby Wix doładował obrazki poniżej pierwszego ekranu.
  await strona.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
  });
  await strona.waitForTimeout(800);

  const dane = await strona.evaluate(() => {
    const korzen =
      document.querySelector("#PAGES_CONTAINER") || document.querySelector("main") || document.body;
    const tekst = korzen.innerText.replace(/\n{3,}/g, "\n\n").trim();
    const naglowki = [...korzen.querySelectorAll("h1,h2,h3,h4")]
      .map((h) => ({ poziom: h.tagName, tekst: h.innerText.trim() }))
      .filter((h) => h.tekst);
    const linki = [...korzen.querySelectorAll("a[href]")]
      .map((a) => ({ tekst: a.innerText.trim().slice(0, 120), href: a.href }))
      .filter((l) => !l.href.startsWith("javascript"));
    const obrazy = [...korzen.querySelectorAll("img")]
      .map((i) => ({
        src: i.currentSrc || i.src,
        alt: i.alt || "",
        szer: i.naturalWidth,
        wys: i.naturalHeight,
        naEkranie: Math.round(i.getBoundingClientRect().width),
      }))
      .filter((o) => o.src.includes("wixstatic.com/media"));
    return { tytul: document.title, tekst, naglowki, linki, obrazy };
  });

  const zdjecia = [];
  for (const o of dane.obrazy) {
    const org = oryginal(o.src);
    if (!org) continue;
    // Pomijamy drobne grafiki interfejsu (ikony, kreski) — szukamy zdjęć i plakatów.
    if (o.naEkranie && o.naEkranie < 80) continue;
    let plik = pobrane.get(org);
    if (!plik) {
      const nazwa = decodeURIComponent(org.split("/media/")[1]).replace(/[^\w.~-]/g, "_");
      plik = `${ZDJECIA}/${nazwa}`;
      if (!fs.existsSync(plik)) {
        const r = await fetch(org);
        if (r.ok) fs.writeFileSync(plik, Buffer.from(await r.arrayBuffer()));
      }
      pobrane.set(org, plik);
    }
    zdjecia.push({ plik: path.basename(plik), alt: o.alt, oryginal: org });
  }

  const md = [
    `# ${dane.tytul}`,
    "",
    `Źródło: ${decodeURI(url)} (zapis ${new Date().toISOString().slice(0, 10)})`,
    "",
    dane.tekst,
    "",
    zdjecia.length ? "## Zdjęcia na stronie\n\n" + zdjecia.map((z) => `- ${z.plik}${z.alt ? ` — „${z.alt}”` : ""}`).join("\n") : "",
  ].join("\n");
  fs.writeFileSync(`${DOKI}/${s}.md`, md);
  indeks.push({ slug: s, url: decodeURI(url), tytul: dane.tytul, naglowki: dane.naglowki, linki: dane.linki, zdjecia });
  // Zapis po każdej stronie, żeby przerwany przebieg nie gubił indeksu.
  fs.writeFileSync(`${DOKI}/index.json`, JSON.stringify(indeks, null, 1));
  console.log(`${s.padEnd(44)} ${String(dane.tekst.length).padStart(6)} zn.  ${zdjecia.length} zdj.`);
}

console.log(`\n${indeks.length} stron, ${pobrane.size} unikalnych zdjęć → ${ZDJECIA}`);
await przegladarka.close();
