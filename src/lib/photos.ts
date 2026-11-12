/**
 * Centralne źródło zdjęć z życia Samorządu (ściana hero, projekty, sekcje
 * strony głównej). Zdjęcia osób (Zarząd, RUSS, SKW) są w `people.ts`.
 *
 * Zdjęcia są w WebP i NIE są przycinane do wspólnych proporcji. Mniejsze
 * szerokości powstają przy budowaniu (scripts/build-image-variants.mjs), więc
 * plik w public/photos może mieć do ok. 2400 px - przeglądarka i tak dostanie
 * wariant dopasowany do ekranu. Wymiary bierzemy z tego samego manifestu.
 */

import { heroFrames, type HeroFrame } from "./hero-frames";
import { imageSize } from "./image-manifest";

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

export interface SizedPhoto {
  src: string;
  width: number;
  height: number;
}

/** Zdjęcie galerii z kluczem opisu alternatywnego (opis tego, co WIDAĆ). */
export interface KeyedPhoto extends SizedPhoto {
  altKey: string;
}

const sized = (src: string): SizedPhoto => ({ src, ...imageSize(src) });

/**
 * Projekty - galeria każdego projektu: public/photos/projekty/<klucz>/<plik>.webp
 * plus `cover.webp` jako zdjęcie główne.
 *
 * Kolejność = kolejność w pasku pod zdjęciem głównym: pierwsze kadry widać
 * bez przewijania, więc idą najmocniejsze, a pionowe przeplatają poziome.
 * Opisy alternatywne: `naszeProjekty.gallery.<klucz>.<plik>`.
 */
const projectGallery: Record<string, string[]> = {
  adapciak: ["noc", "basen", "lina", "wianki", "piasek", "sala", "dym", "kampus", "wieczor", "stoiska", "lawki", "rozmowa", "osrodek"],
  animalia: ["ramka", "baner", "scena", "koszulka", "zolw"],
  bal: ["parkiet", "grupa-scianka", "taniec", "korony", "ogien", "sala", "selfie", "koncert", "para", "ramka", "statuetka", "wreczenie", "grupa", "logo"],
  dni: ["zachod", "radosc", "prelegent", "wolontariusze", "sala", "mikrofon", "kampus", "stoisko", "mownica", "widownia", "koszulka", "ekran"],
  graduetion: ["birety", "ekran", "przemowa", "absolwentki", "sala", "mownica", "baner"],
  juwenalia: ["scena"],
  mosty: ["kombinezony", "ramka", "dworzec", "schody", "peron", "neon", "scianka", "ramka-pusta"],
  test: ["zespol", "skok", "stanowisko", "regulamin"],
  tedx: ["selfie", "scena-ciemna", "ekran", "kwiaty", "sylwetki", "powitanie", "prelegentka", "trojka", "scena", "sciana", "kanapa", "flaga", "plakat", "sala-czerwona"],
  party: ["usmiechy", "grupa", "tlum", "koncert", "swiatla", "konsola", "parkiet", "gesty", "biel"],
};

const coverOf = (key: string) => `/photos/projekty/${key}/cover.webp`;

/** Wymiary zdjęcia głównego projektu albo `undefined`, gdy projekt nie ma zdjęć. */
export const projectCoverSize = (key: string) => (projectGallery[key] ? imageSize(coverOf(key)) : undefined);

/** Zdjęcie główne projektu (pierwszy element) - bez zdjęć pusta lista i typograficzny plakat. */
export const projectPhotos = (key: string): string[] => (projectGallery[key] ? [coverOf(key)] : []);

/** Galeria projektu do paska pod zdjęciem głównym. */
export const projectGalleryPhotos = (key: string): KeyedPhoto[] =>
  (projectGallery[key] ?? []).map((file) => ({
    ...sized(`/photos/projekty/${key}/${file}.webp`),
    altKey: `${key}.${file}`,
  }));

/**
 * Czy zdjęcia pokazują TEN projekt. Od tego zależy opis alternatywny:
 * podpisanie zastępczego kadru „Uczestnicy projektu X" byłoby nieprawdą wobec
 * osoby, która widzi wyłącznie ten opis.
 */
export const projectPhotosAreAuthentic = (key: string): boolean => Boolean(projectGallery[key]);

/**
 * Zjazd Forum Uczelni Ekonomicznych (strona FUE i PSRP).
 * Opisy alternatywne: `fuePsrp.zjazdGallery.<plik>`.
 */
export const zjazdFuePhotos: KeyedPhoto[] = ["obrady", "gala", "glos", "ksiega", "grupa", "wpisy", "kwiaty"].map((file) => ({
  ...sized(`/photos/fue/zjazd/${file}.webp`),
  altKey: file,
}));

export interface ProjectLogo {
  key: string;
  name: string;
  light: SizedPhoto;
  dark: SizedPhoto;
}

/**
 * Logotypy projektów (public/logos/projekty): `<klucz>.webp` na jasne tło
 * i `<klucz>-ciemny.webp` na ciemne. Wersje ciemne powstały z plików od
 * Samorządu przez odwrócenie czerni i bieli, kolory zostają; Juwenalia
 * Wrocławskie to logotyp 2026 ze strony juwenaliawroclawskie.pl (biały, więc
 * odwrotnie). Kolejność = kolejność projektów w roku akademickim.
 */
const LOGOS: [key: string, name: string][] = [
  ["adapciak", "Adapciak"],
  ["dni", "Dni Adaptacyjne"],
  ["party", "UE Party"],
  ["animalia", "Animalia"],
  ["bal", "Bal UEW"],
  ["juwenalia", "Juwenalia Wrocławskie"],
  ["mosty", "Mosty Ekonomiczne"],
  ["test", "Test Wiedzy Ekonomicznej"],
  ["tedx", "TEDxUEW"],
  ["graduetion", "GradUEtion"],
];

export const projectLogos: ProjectLogo[] = LOGOS.map(([key, name]) => ({
  key,
  name,
  light: sized(`/logos/projekty/${key}.webp`),
  dark: sized(`/logos/projekty/${key}-ciemny.webp`),
}));

export const projectLogo = (key: string): ProjectLogo | undefined => projectLogos.find((l) => l.key === key);
