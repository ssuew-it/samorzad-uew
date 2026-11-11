"use client";

import type { ImageLoaderProps } from "next/image";
import { VARIANT_WIDTHS } from "./image-widths.mjs";
import variants from "./image-variants.json";

/**
 * Loader next/image bez przeliczania na serwerze.
 *
 * Zamiast pytać Vercela o zmniejszenie zdjęcia (czas procesora i limit
 * przekształceń na planie Hobby), wskazuje plik przygotowany przy budowaniu
 * przez scripts/build-image-variants.mjs. Wszystko, czego nie ma w manifeście
 * (SVG, adresy zewnętrzne, świeżo dodane zdjęcie przed przebudową), idzie
 * jako oryginał - wolniej, ale nigdy nie jako brakujący plik.
 */
export function pickImage(src: string, width: number, manifest: Record<string, number>): string {
  const original = manifest[src];
  if (!original) return src;
  const variant = VARIANT_WIDTHS.find((w) => w >= width && w < original);
  if (!variant) return src;
  return `/_img${src.replace(/\.[^./]+$/, "")}.${variant}.webp`;
}

export default function imageLoader({ src, width }: ImageLoaderProps): string {
  return pickImage(src, width, variants as Record<string, number>);
}
