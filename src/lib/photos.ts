/**
 * Centralne źródło zdjęć całej strony.
 *
 * JAK PODMIENIĆ NA PRAWDZIWE ZDJĘCIA (per sekcja — można włączać niezależnie):
 * 1. Wrzuć pliki do `public/photos/<sekcja>/...` (nazwy w `public/photos/README.md`).
 * 2. W obiekcie `USE_LOCAL` niżej ustaw daną sekcję na `true`.
 * Hero, „Życie studenckie", Zarząd i RUSS mają osobne przełączniki, więc nie
 * trzeba czekać z jedną sekcją na komplet pozostałych.
 *
 * Kadry hero są w WebP i NIE są przycinane do wspólnych proporcji — konwersję
 * i manifest wymiarów robi `scripts/build-hero-manifest.mjs`.
 */

import { heroFrames, type HeroFrame } from "./hero-frames";

export const USE_LOCAL = {
  hero: true, // public/photos/hero/01.webp … (HERO_COUNT)
  zycie: false, // public/photos/zycie/integracja.jpg, wsparcie.jpg
  zarzad: false, // public/photos/zarzad/01.jpg …
  russ: false, // public/photos/russ/01.jpg …
  projekty: true, // public/photos/projekty/<klucz>/cover.webp (patrz projectGallery)
};

// Liczba numerowanych kadrów 0N.webp (używanych poza ścianą: manifest, projekty).
const HERO_COUNT = 5;

const pic = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const localList = (folder: string, count: number, ext = "jpg") =>
  Array.from({ length: count }, (_, i) => `/photos/${folder}/${String(i + 1).padStart(2, "0")}.${ext}`);

/** Numerowane kadry pionowe używane poza ścianą. public/photos/hero/01.webp … */
export const heroPhotos: string[] = USE_LOCAL.hero
  ? localList("hero", HERO_COUNT, "webp")
  : ["a", "b", "c", "d", "e", "f", "g", "h"].map((s) => pic(`ssuew-${s}`, 500, 640));

/**
 * Ściana kadrów w hero.
 *
 * Bierze manifest `heroFrames`, a nie samą listę ścieżek, bo każdy kadr ma
 * WŁASNE proporcje — zdjęcia nie są przycinane do wspólnego formatu. Wymiary
 * muszą dojść do przeglądarki przed plikiem, inaczej ściana skacze przy
 * każdym doładowanym zdjęciu.
 *
 * Manifest generuje `scripts/build-hero-manifest.mjs`.
 */
export const wallFrames: HeroFrame[] = heroFrames;

/**
 * Sekcja „Życie studenckie" — 2 zdjęcia poziome (kadr 3:2).
 *
 * Dopóki nie ma dedykowanych szerokich kadrów, bierzemy POZIOME zdjęcia
 * projektów (1800 px). Wcześniej stały tu pionowe kadry ze ściany hero,
 * a sekcja jest pełnoekranowa i szeroka — przycięte i powiększone wychodziły
 * rozmyte (przy „Wsparciu” zostawały same plamy kamizelek).
 * Dobór po znaczeniu: społeczność → Bal UEW, wsparcie → stoisko Samorządu
 * ze strefą relaksu (miejsce, gdzie dosłownie jesteśmy obok studentów).
 */
export const studentLifePhotos = USE_LOCAL.zycie
  ? {
      integracja: "/photos/zycie/integracja.jpg",
      wsparcie: "/photos/zycie/wsparcie.jpg",
    }
  : {
      integracja: "/photos/projekty/bal/cover.webp",
      // Stoisko Samorządu ze strefą relaksu — dosłownie „jesteśmy obok”.
      // Wcześniej stało tu zdjęcie zespołu Dni Adaptacyjnych, które jest już
      // w ścianie kadrów hero i otwiera „O nas”; trzeci raz to było za dużo.
      wsparcie: "/photos/hero/inne_1.webp",
    };

/**
 * Zarząd — zdjęcia (kadr 4:5). public/photos/zarzad/01.jpg …
 *
 * Dopóki nie ma prawdziwych zdjęć, lista jest PUSTA — `PersonCard` pokazuje
 * wtedy inicjały (`InitialsAvatar`). Świadomie NIE podstawiamy tu zdjęć
 * stockowych: przy prawdziwych nazwiskach członków Zarządu twarze obcych osób
 * wyglądają na nieukończone i wprowadzają w błąd.
 */
export const boardPhotos: string[] = USE_LOCAL.zarzad ? localList("zarzad", 7) : [];

/** RUSS — zdjęcia (kadr 4:5). public/photos/russ/01.jpg … Bez zdjęć → inicjały (jak wyżej). */
export const russPhotos: string[] = USE_LOCAL.russ ? localList("russ", 15) : [];

const projectFallbacks: Record<string, string[]> = {
  adapciak: ["/photos/hero/05.webp"],
  bal: ["/photos/hero/02.webp"],
  dni: ["/photos/hero/01.webp", "/photos/hero/03.webp"],
  party: ["/photos/hero/04.webp"],
};

/**
 * Projekty — fotograficzny rozdział, nie miniatura karty.
 *
 * Każdy projekt ma zdjęcie główne (cover) i opcjonalnie detal, wyświetlany
 * jako mniejszy kadr na zakładkę. Lista jest jawna, a nie składana ze wzorca
 * ścieżki, bo przy brakującym detalu wzorzec dawałby obrazek 404.
 *
 * Zdjęcia główne pochodzą ze starej strony Samorządu (podstrona „Nasze
 * projekty", odzyskana 15.10.2026 skryptem scripts/archiwum-wix.mjs) — każde
 * przedstawia TEN projekt, więc opisy mogą go nazywać. Dokładając detal,
 * dopisz drugi element tablicy: public/photos/projekty/<klucz>/detail-01.webp
 */
const projectGallery: Record<string, string[]> = {
  adapciak: ["/photos/projekty/adapciak/cover.webp"],
  animalia: ["/photos/projekty/animalia/cover.webp"],
  bal: ["/photos/projekty/bal/cover.webp"],
  dni: ["/photos/projekty/dni/cover.webp"],
  graduetion: ["/photos/projekty/graduetion/cover.webp"],
  mosty: ["/photos/projekty/mosty/cover.webp"],
  test: ["/photos/projekty/test/cover.webp"],
  tedx: ["/photos/projekty/tedx/cover.webp"],
  // Na starej stronie był tylko mały kadr (1167 px) — do podmiany na większy.
  party: ["/photos/projekty/party/cover.webp"],
};

/**
 * Wymiary zdjęć głównych (px). Strona projektów pokazuje każdy kadr w jego
 * własnych proporcjach, a przeglądarka musi je znać przed pobraniem pliku,
 * inaczej opowieść skacze przy każdym doładowanym zdjęciu. Przy podmianie
 * pliku zaktualizuj wymiary.
 */
const projectCoverSizes: Record<string, { width: number; height: number }> = {
  adapciak: { width: 1800, height: 958 },
  animalia: { width: 1800, height: 1012 },
  bal: { width: 1800, height: 1200 },
  dni: { width: 1800, height: 1200 },
  graduetion: { width: 1800, height: 1202 },
  mosty: { width: 1800, height: 1350 },
  test: { width: 1800, height: 1350 },
  tedx: { width: 1800, height: 1200 },
  party: { width: 1167, height: 768 },
};

/** Wymiary zdjęcia głównego projektu albo `undefined` dla zastępnika z hero. */
export const projectCoverSize = (key: string) =>
  USE_LOCAL.projekty && projectGallery[key] ? projectCoverSizes[key] : undefined;

/**
 * Bez własnego zdjęcia projekt dostaje prawdziwy kadr Samorządu z hero albo
 * typograficzny plakat — nigdy stockową fotografię udającą wydarzenie.
 */
export const projectPhotos = (key: string): string[] =>
  USE_LOCAL.projekty ? (projectGallery[key] ?? projectFallbacks[key] ?? []) : (projectFallbacks[key] ?? []);

/**
 * Czy zdjęcia pokazują TEN projekt, czy są tylko zastępnikiem z archiwum hero.
 *
 * Rozróżnienie jest potrzebne, bo od niego zależy opis alternatywny. Kadr z
 * hero jest prawdziwym zdjęciem Samorządu, ale nie przedstawia uczestników
 * konkretnego wydarzenia — podpisanie go „Uczestnicy projektu Adapciak" byłoby
 * nieprawdą wobec osoby, która widzi wyłącznie ten opis.
 */
export const projectPhotosAreAuthentic = (key: string): boolean =>
  USE_LOCAL.projekty && Boolean(projectGallery[key]);

/** Wsteczna kompatybilność dla miejsc, które potrzebują tylko coveru. */
export const projectPhoto = (key: string): string | undefined => projectPhotos(key)[0];
