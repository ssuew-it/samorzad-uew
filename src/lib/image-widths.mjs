/**
 * Szerokości wariantów zdjęć - JEDNA lista dla trzech miejsc:
 * next.config.ts (srcset next/image), scripts/build-image-variants.mjs
 * (które pliki powstają) i src/lib/image-loader.ts (który plik podać).
 * Gdyby się rozjechały, przeglądarka prosiłaby o nieistniejące pliki.
 *
 * Plik .mjs, bo czyta go także skrypt w czystym Node przed kompilacją.
 */

/** Małe stałe kadry: portrety na wizytówkach, logotypy, miniatury. */
export const IMAGE_SIZES = [128, 256, 384];

/** Szerokości ekranów - kadry `fill` i pełnej szerokości. */
export const DEVICE_SIZES = [640, 828, 1080, 1600, 2048];

export const VARIANT_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];
