/**
 * Kadry archiwalne w ścianie hero - PLIK GENEROWANY.
 *
 * Nie edytuj ręcznie. Źródło: scripts/build-hero-manifest.mjs
 * (`node scripts/build-hero-manifest.mjs` po dorzuceniu nowych zdjęć).
 *
 * Każdy wpis ma własne proporcje, bo kadry NIE są przycinane do wspólnego
 * formatu - zdjęcia są komponowane przez fotografa i przycinanie ich pod
 * siatkę psuje kadr. Ściana dostosowuje się do zdjęć, nie odwrotnie.
 *
 * Wymiary są potrzebne przeglądarce PRZED wczytaniem pliku: bez nich ściana
 * skacze przy każdym doładowanym zdjęciu.
 */

export interface HeroFrame {
  src: string;
  width: number;
  height: number;
}

export const heroFrames: HeroFrame[] = [
  {
    "src": "/photos/hero/01.webp",
    "width": 800,
    "height": 1000
  },
  {
    "src": "/photos/hero/02.webp",
    "width": 800,
    "height": 1000
  },
  {
    "src": "/photos/hero/03.webp",
    "width": 800,
    "height": 1000
  },
  {
    "src": "/photos/hero/04.webp",
    "width": 800,
    "height": 1000
  },
  {
    "src": "/photos/hero/05.webp",
    "width": 800,
    "height": 1000
  },
  {
    "src": "/photos/hero/bal_1.webp",
    "width": 1400,
    "height": 934
  },
  {
    "src": "/photos/hero/da_1.webp",
    "width": 1400,
    "height": 933
  },
  {
    "src": "/photos/hero/grad_1.webp",
    "width": 1400,
    "height": 935
  },
  {
    "src": "/photos/hero/grad_2.webp",
    "width": 1400,
    "height": 935
  },
  {
    "src": "/photos/hero/inne_1.webp",
    "width": 1400,
    "height": 933
  },
  {
    "src": "/photos/hero/tedx_1.webp",
    "width": 1400,
    "height": 933
  },
  {
    "src": "/photos/hero/tedx_2.webp",
    "width": 1400,
    "height": 933
  }
];
