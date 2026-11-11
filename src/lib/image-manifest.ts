import { VARIANT_WIDTHS } from "./image-widths.mjs";
import variants from "./image-variants.json";

/**
 * Manifest zdjęć z public/ - [szerokość, wysokość] każdego pliku.
 * Generuje go scripts/build-image-variants.mjs (wraz z wariantami szerokości).
 */
export type ImageManifest = Readonly<Record<string, readonly [number, number]>>;

export const imageManifest = variants as unknown as ImageManifest;

/**
 * Wymiary zdjęcia z manifestu. Galerie podają je przeglądarce przed pobraniem
 * pliku (bez skakania układu), a nie trzeba ich przepisywać ręcznie.
 * Brak pliku w manifeście to literówka w ścieżce albo nieprzebudowany manifest -
 * błąd wychodzi przy budowaniu, a nie jako pusty kafel na stronie.
 */
export function imageSize(src: string, manifest: ImageManifest = imageManifest) {
  const entry = manifest[src];
  if (!entry) throw new Error(`Brak zdjęcia w manifeście: ${src} (node scripts/build-image-variants.mjs)`);
  return { width: entry[0], height: entry[1] };
}

/**
 * Najmniejszy gotowy wariant nie węższy od żądanej szerokości, a powyżej -
 * oryginał. Pliki spoza manifestu (SVG, adresy zewnętrzne) bez zmian.
 */
export function pickImage(src: string, width: number, manifest: ImageManifest = imageManifest): string {
  const original = manifest[src]?.[0];
  if (!original) return src;
  const variant = VARIANT_WIDTHS.find((w) => w >= width && w < original);
  if (!variant) return src;
  return `/_img${src.replace(/\.[^./]+$/, "")}.${variant}.webp`;
}
