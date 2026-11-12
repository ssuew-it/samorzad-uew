/**
 * Warianty szerokości zdjęć z public/ (bez podpisów e-mail) - liczone RAZ, przy budowaniu.
 *
 * DLACZEGO NIE OPTYMALIZACJA next/image NA VERCELU
 *
 * Domyślny loader next/image zmniejsza zdjęcie przy pierwszym żądaniu każdej
 * kombinacji plik × szerokość × jakość. Na planie Hobby to limit przekształceń
 * i czas procesora funkcji, a ściana hero sama ma kilkanaście kadrów w kilku
 * szerokościach. Tu robimy tę pracę przy budowaniu: gotowe pliki leżą w
 * public/_img i CDN podaje je jak każdy plik statyczny, bez funkcji.
 *
 * CO POWSTAJE
 *
 * - public/_img/<ścieżka bez rozszerzenia>.<skrót>.<szerokość>.webp - tylko szerokości
 *   MNIEJSZE od oryginału (powiększanie nic nie daje, a waży),
 * - src/lib/image-variants.json - [szerokość, wysokość, skrót] oryginału każdego
 *   zdjęcia. Loader (src/lib/image-loader.ts) wybiera po szerokości najmniejszy
 *   wariant nie węższy od żądanego, a powyżej - oryginał; galerie biorą stąd
 *   wymiary (src/lib/image-manifest.ts), więc nie wpisuje się ich ręcznie.
 *
 * Warianty są w .gitignore i powstają przed `next build` i `next dev`
 * (prebuild/predev). Gotowe warianty biorą się z pamięci podręcznej (niżej),
 * więc ponowne uruchomienie trwa kilka sekund. Manifest jest w repozytorium, bo czyta go
 * TypeScript i testy, zanim cokolwiek się zbuduje.
 *
 * Uruchomienie ręczne: node scripts/build-image-variants.mjs
 */
import sharp from "sharp";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { VARIANT_WIDTHS } from "../src/lib/image-widths.mjs";

const ROOT = "public";
/** Podpisy e-mail (sig) czyta poczta, nie strona - pełne pliki, bez wariantów. */
const SKIP = new Set(["_img", "sig"]);
const OUT = "public/_img";
/**
 * Pamięć podręczna wariantów według SKRÓTU ZAWARTOŚCI, nie daty pliku: na
 * Vercelu każde pobranie repozytorium daje plikom nową datę. Katalog
 * .next/cache Vercel przenosi między wdrożeniami, więc przelicza się tylko
 * nowe albo zmienione zdjęcia.
 */
const CACHE = ".next/cache/image-variants";
const MANIFEST = "src/lib/image-variants.json";
const RASTER = /\.(webp|jpe?g|png)$/i;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((e) => !(e.isDirectory() && SKIP.has(e.name)))
      .map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return files.flat();
}

const exists = async (file) => Boolean(await stat(file).catch(() => null));

const files = (await walk(ROOT)).filter((f) => RASTER.test(f)).sort();
const manifest = {};
let written = 0;

/** Jedno zdjęcie: wymiar do manifestu + brakujące warianty w pamięci podręcznej. */
async function processFile(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const data = await readFile(file);
  const { width, height } = await sharp(data).metadata();
  if (!width || !height) return;
  const hash = createHash("sha1").update(data).digest("hex").slice(0, 16);
  // 8 znaków skrótu w nazwie wariantu: nowa zawartość = nowy adres.
  manifest[`/${rel}`] = [width, height, hash.slice(0, 8)];

  const base = rel.replace(RASTER, "");
  for (const w of VARIANT_WIDTHS.filter((w) => w < width)) {
    const cached = path.join(CACHE, `${hash}.${w}.webp`);
    if (!(await exists(cached))) {
      // Małe kadry to głównie twarze na wizytówkach - przy niższej jakości
      // rozmywały się wyraźnie, a różnica w wadze jest tu znikoma.
      await sharp(data).resize({ width: w }).webp({ quality: w <= 384 ? 88 : 78 }).toFile(cached);
      written += 1;
    }
    const to = path.join(OUT, `${base}.${hash.slice(0, 8)}.${w}.webp`);
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(cached, to);
  }
}

await mkdir(CACHE, { recursive: true });
await rm(OUT, { recursive: true, force: true });
// Kilka plików naraz - sharp liczy w osobnych wątkach, a pojedyncza kolejka
// zostawiała większość rdzeni bezczynną.
const queue = [...files];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let file = queue.shift(); file; file = queue.shift()) await processFile(file);
  }),
);

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
// Jeden wpis w wierszu - czytelny diff, gdy dojdzie albo zmieni się zdjęcie.
const body = JSON.stringify(sorted).replace(/\],"/g, '],\n"') + "\n";
await writeFile(MANIFEST, body);
console.log(`warianty zdjęć: ${files.length} plików, ${written} przeliczonych, reszta z pamięci podręcznej`);
