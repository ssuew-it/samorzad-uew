/**
 * Manifest ściany kadrów hero: public/photos/sciana/*.webp z ICH WŁASNYMI wymiarami.
 *
 * DLACZEGO PEŁNY KADR, A NIE PRZYCIĘTY DO 4:5
 *
 * Pierwsza wersja przycinała każde zdjęcie do pionu 4:5, żeby kafle w ścianie
 * były równe. To był błąd: zdjęcia są dostarczane skomponowane i przycinanie
 * ich pod siatkę psuje kadr - z grupowego zdjęcia zostawał wycinek. Kafle w
 * ścianie NIE muszą być równe. Zachowujemy cały kadr i jego proporcje, a układ
 * dostosowuje się do zdjęć, nie odwrotnie.
 *
 * DLACZEGO MANIFEST Z WYMIARAMI
 *
 * Skoro proporcje są różne, przeglądarka musi znać je PRZED wczytaniem pliku -
 * inaczej ściana skacze przy każdym doładowanym zdjęciu (CLS).
 *
 * Pliki mają być gotowym WebP (dłuższa krawędź ok. 1600 px). Kolejność nazw
 * (01-…, 02-…) to kolejność w ścianie: kadry idą do trzech kolumn na zmianę.
 * Mniejsze szerokości robi scripts/build-image-variants.mjs.
 *
 * Uruchomienie: node scripts/build-hero-manifest.mjs
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = "public/photos/sciana";
const OUT = "src/lib/hero-frames.ts";

const frames = [];
for (const file of (await readdir(DIR)).filter((f) => f.endsWith(".webp")).sort()) {
  const { width, height } = await sharp(path.join(DIR, file)).metadata();
  frames.push({ src: `/photos/sciana/${file}`, width, height });
}

const body = `/**
 * Kadry w ścianie hero - PLIK GENEROWANY.
 *
 * Nie edytuj ręcznie. Źródło: scripts/build-hero-manifest.mjs
 * (\`node scripts/build-hero-manifest.mjs\` po dorzuceniu zdjęć do public/photos/sciana).
 *
 * Każdy wpis ma własne proporcje, bo kadry NIE są przycinane do wspólnego
 * formatu - zdjęcia są komponowane przez fotografa i przycinanie ich pod
 * siatkę psuje kadr. Ściana dostosowuje się do zdjęć, nie odwrotnie.
 */

export interface HeroFrame {
  src: string;
  width: number;
  height: number;
}

export const heroFrames: HeroFrame[] = ${JSON.stringify(frames, null, 2)};
`;

await writeFile(OUT, body);
console.log(`${OUT} - ${frames.length} kadrów`);
