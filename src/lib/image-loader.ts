"use client";

import type { ImageLoaderProps } from "next/image";
import { pickImage } from "./image-manifest";

/**
 * Loader next/image bez przeliczania na serwerze.
 *
 * Zamiast pytać Vercela o zmniejszenie zdjęcia (czas procesora i limit
 * przekształceń na planie Hobby), wskazuje plik przygotowany przy budowaniu
 * przez scripts/build-image-variants.mjs. Wszystko, czego nie ma w manifeście
 * (SVG, adresy zewnętrzne, świeżo dodane zdjęcie przed przebudową), idzie
 * jako oryginał - wolniej, ale nigdy nie jako brakujący plik.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  return pickImage(src, width);
}
