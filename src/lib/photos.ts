/**
 * Centralne źródło zdjęć z życia Samorządu (ściana hero, projekty, sekcje
 * strony głównej). Zdjęcia osób (Zarząd, RUSS, SKW) są w `people.ts`.
 *
 * Zdjęcia są w WebP i NIE są przycinane do wspólnych proporcji. Mniejsze
 * szerokości powstają przy budowaniu (scripts/build-image-variants.mjs), więc
 * plik w public/photos może mieć do ok. 2400 px - przeglądarka i tak dostanie
 * wariant dopasowany do ekranu.
 */

import { heroFrames, type HeroFrame } from "./hero-frames";

/**
 * Ściana kadrów w hero.
 *
 * Bierze manifest `heroFrames`, a nie samą listę ścieżek, bo każdy kadr ma
 * WŁASNE proporcje. Wymiary muszą dojść do przeglądarki przed plikiem,
 * inaczej ściana skacze przy każdym doładowanym zdjęciu.
 *
 * Manifest generuje `scripts/build-hero-manifest.mjs` z public/photos/sciana.
 */
export const wallFrames: HeroFrame[] = heroFrames;

/**
 * Kadr przy manifeście na stronie głównej: Działacze przy stoisku z flagą
 * Samorządu. Pionowy, bo pole obok tekstu jest wyższe niż szersze - poziome
 * zdjęcie grupowe traciło w nim ludzi z brzegów.
 */
export const manifestPhoto = "/photos/glowna/stoisko-flaga.webp";

/**
 * Sekcja „Życie studenckie" - 2 zdjęcia na całą szerokość ekranu.
 * Społeczność → parkiet Balu UEW, wsparcie → stoisko Samorządu ze strefą
 * relaksu (miejsce, gdzie dosłownie jesteśmy obok studentów).
 */
export const studentLifePhotos = {
  integracja: "/photos/zycie/integracja.webp",
  wsparcie: "/photos/zycie/wsparcie.webp",
};

export interface ProjectPhoto {
  src: string;
  width: number;
  height: number;
}

/** Detal projektu: kadr z paska pod zdjęciem głównym, z kluczem opisu alternatywnego. */
export interface ProjectDetail extends ProjectPhoto {
  /** Klucz w `naszeProjekty.details` - opis tego, co WIDAĆ na zdjęciu. */
  alt: string;
}

const photo = (src: string, width: number, height: number): ProjectPhoto => ({ src, width, height });
const detail = (key: string, file: string, width: number, height: number, alt: string): ProjectDetail => ({
  src: `/photos/projekty/${key}/${file}.webp`,
  width,
  height,
  alt,
});

/**
 * Projekty - zdjęcie główne i trzy detale z TEGO wydarzenia.
 *
 * Wymiary są potrzebne przeglądarce przed pobraniem pliku: strona projektów
 * pokazuje każdy kadr w jego własnych proporcjach, a bez nich opowieść skacze
 * przy każdym doładowanym zdjęciu. Przy podmianie pliku zaktualizuj wymiary.
 */
const projectGallery: Record<string, { cover: ProjectPhoto; details: ProjectDetail[] }> = {
  adapciak: {
    cover: photo("/photos/projekty/adapciak/cover.webp", 2400, 1600),
    details: [
      detail("adapciak", "basen", 1600, 1067, "adapciakBasen"),
      detail("adapciak", "piasek", 1600, 1067, "adapciakPiasek"),
      detail("adapciak", "dym", 1067, 1600, "adapciakDym"),
    ],
  },
  animalia: {
    cover: photo("/photos/projekty/animalia/cover.webp", 2400, 1800),
    details: [
      detail("animalia", "scena", 1200, 1600, "animaliaScena"),
      detail("animalia", "baner", 1600, 900, "animaliaBaner"),
      detail("animalia", "grupa", 1600, 1200, "animaliaGrupa"),
    ],
  },
  bal: {
    cover: photo("/photos/projekty/bal/cover.webp", 2400, 1600),
    details: [
      detail("bal", "parkiet", 1600, 1201, "balParkiet"),
      detail("bal", "ogien", 1600, 1067, "balOgien"),
      detail("bal", "koncert", 1600, 1067, "balKoncert"),
    ],
  },
  dni: {
    cover: photo("/photos/projekty/dni/cover.webp", 2400, 1600),
    details: [
      detail("dni", "radosc", 1600, 1067, "dniRadosc"),
      detail("dni", "prelegent", 1067, 1600, "dniPrelegent"),
      detail("dni", "mikrofon", 1600, 1068, "dniMikrofon"),
    ],
  },
  graduetion: {
    cover: photo("/photos/projekty/graduetion/cover.webp", 2400, 1602),
    details: [
      detail("graduetion", "ekran", 1200, 1600, "graduetionEkran"),
      detail("graduetion", "przemowa", 1600, 1068, "graduetionPrzemowa"),
      detail("graduetion", "sala", 1600, 1068, "graduetionSala"),
    ],
  },
  // Z Juwenaliów są na razie dwa zdjęcia - drugie (pionowe) samo w pasku
  // wyglądałoby na przypadek, więc projekt ma tylko zdjęcie główne.
  juwenalia: {
    cover: photo("/photos/projekty/juwenalia/cover.webp", 2400, 1600),
    details: [],
  },
  mosty: {
    cover: photo("/photos/projekty/mosty/cover.webp", 2400, 1602),
    details: [
      detail("mosty", "kombinezony", 1600, 1200, "mostyKombinezony"),
      detail("mosty", "schody", 1200, 1600, "mostySchody"),
      detail("mosty", "scianka", 1600, 1068, "mostyScianka"),
    ],
  },
  test: {
    cover: photo("/photos/projekty/test/cover.webp", 2400, 1600),
    details: [
      detail("test", "zespol", 1600, 1200, "testZespol"),
      detail("test", "stanowisko", 1600, 1067, "testStanowisko"),
      detail("test", "regulamin", 1600, 1067, "testRegulamin"),
    ],
  },
  tedx: {
    cover: photo("/photos/projekty/tedx/cover.webp", 2400, 1600),
    details: [
      detail("tedx", "selfie", 1600, 1202, "tedxSelfie"),
      detail("tedx", "scena", 1069, 1600, "tedxScena"),
      detail("tedx", "kwiaty", 1600, 1067, "tedxKwiaty"),
    ],
  },
  party: {
    cover: photo("/photos/projekty/party/cover.webp", 2400, 1600),
    details: [
      detail("party", "grupa", 1600, 1067, "partyGrupa"),
      detail("party", "koncert", 1600, 1067, "partyKoncert"),
      detail("party", "konsola", 1600, 1067, "partyKonsola"),
    ],
  },
};

/** Wymiary zdjęcia głównego projektu albo `undefined`, gdy projekt nie ma zdjęć. */
export const projectCoverSize = (key: string) => {
  const cover = projectGallery[key]?.cover;
  return cover ? { width: cover.width, height: cover.height } : undefined;
};

/** Zdjęcie główne projektu (pierwszy element) - bez zdjęć pusta lista i typograficzny plakat. */
export const projectPhotos = (key: string): string[] => {
  const cover = projectGallery[key]?.cover;
  return cover ? [cover.src] : [];
};

/** Detale projektu do paska pod zdjęciem głównym. */
export const projectDetails = (key: string): ProjectDetail[] => projectGallery[key]?.details ?? [];

/**
 * Czy zdjęcia pokazują TEN projekt. Od tego zależy opis alternatywny:
 * podpisanie zastępczego kadru „Uczestnicy projektu X" byłoby nieprawdą wobec
 * osoby, która widzi wyłącznie ten opis.
 */
export const projectPhotosAreAuthentic = (key: string): boolean => Boolean(projectGallery[key]);
