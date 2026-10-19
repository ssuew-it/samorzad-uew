/**
 * Wydania serii „Debiuty Studenckie".
 *
 * Metadane redakcyjne pisane ręcznie; STRONY są osobno, w generowanym
 * `edition-pages.ts`. Rozdzielenie jest celowe - ręcznych danych nie chcemy
 * nadpisywać przy każdym przebiegu skryptu.
 */
import { editionPages, type EditionPage } from "./edition-pages";

export interface Edition {
  slug: string;
  title: string;
  subtitle?: string;
  editors: string[];
  year: number;
  isbn: string;
  doi: string;
  /** Pełny tekst w otwartym dostępie - hostowany przez nas. */
  pdf: string;
  license: string;
  licenseUrl: string;
}

/**
 * Wydawca serii.
 *
 * Adres podany przez zamawiającego. Stary `wydawnictwo.ue.wroc.pl`, który
 * nadal podają wyszukiwarki, nie ma już wpisu DNS - ten rozwiązuje się
 * poprawnie (za Cloudflare). Przycisk „Strona wydawcy" renderuje się tylko
 * wtedy, gdy `url` jest niepuste, więc kolejny tom bez adresu nie wystawi
 * odnośnika donikąd.
 *
 * `mark` to znak przekazany przez Wydawnictwo, z przezroczystym tłem.
 */
export const publisher = {
  name: "Wydawnictwo Uniwersytetu Ekonomicznego we Wrocławiu",
  shortName: "Wydawnictwo UEW",
  since: 1955,
  url: "https://wydawnictwo.uew.pl/",
  mark: "/wydawnictwo/UEW_sygnet_rgb.png",
};

/** Wyszukanie tytułu w Google Scholar - tam te teksty są indeksowane. */
export const scholarSearchUrl = (title: string): string =>
  `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;

export const editions: Edition[] = [
  {
    slug: "new-trends-2026",
    title: "New Trends in Business Management",
    subtitle: "Culture, Strategy, Engagement",
    editors: ["Joanna Radomska", "Anna Witek-Crabb"],
    year: 2026,
    isbn: "978-83-68699-35-7",
    doi: "10.15611/2026.35.7",
    pdf: "/wydawnictwo/new-trends-2026.pdf",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pl",
  },
];

export const editionBySlug = (slug: string): Edition | undefined =>
  editions.find((e) => e.slug === slug);

/** Strony wydania. Pusta tablica = wydanie bez zdigitalizowanych stron. */
export const pagesOf = (slug: string): EditionPage[] => editionPages[slug] ?? [];
