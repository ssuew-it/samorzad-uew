import type { Partner } from "@/components/partners/partnerEffects";

/**
 * Prawdziwi partnerzy Samorządu.
 *
 * PUSTA lista = na stronie zostaje teaser „Twoja marka / Your brand".
 * Dodaj wpis + wrzuć logo do `public/partnerzy/...` → ściana pokazuje realne
 * logotypy, a w modalu gra animacja dobrana po `category`.
 *
 * Pola:
 *  - name      - nazwa partnera (alt logo, nagłówek modala)
 *  - logo      - ścieżka do pliku, np. "/partnerzy/lot.svg" (najlepiej SVG)
 *  - href      - link do strony partnera (przycisk „Odwiedź stronę")
 *  - category  - szablon animacji w modalu; obecnie: "aviation" (samolot).
 *                Dokładamy kolejne w `CATEGORY_EFFECTS` (partnerEffects.ts).
 *  - color     - kolor marki (tinta animacji); brak → akcent UEW.
 *  - frames    - przyszłe pliki klatkowe (mają priorytet nad category).
 */
export interface PartnerEntry extends Partner {
  href?: string;
  /** Partner strategiczny - wyróżniony na ścianie i w modalu. */
  strategic?: boolean;
  /**
   * Case study przy partnerze strategicznym: 2-3 zdania, co zrobiliśmy razem,
   * i opcjonalne zdjęcie z wydarzenia (public/partnerzy/...). Bez `story`
   * sekcja pokazuje samo logo.
   */
  story?: { pl: string; en: string; photo?: string; photoAlt?: { pl: string; en: string } };
}

/*
 * Lista „Zaufali nam" ze starej strony Samorządu (podstrony „Partnerzy"
 * i „Współprace", archiwum z 15.10.2026). Kolejność od marek najbardziej
 * rozpoznawalnych do lokalnych (decyzja z 2.11.2026); BNY jako partner
 * strategiczny i tak stoi osobno. Zarząd
 * zdecydował, by pokazać wszystkich dotychczasowych partnerów - stąd
 * nagłówek w czasie przeszłym i opis, który nie twierdzi, że każda
 * współpraca trwa nadal.
 *
 * `href` tylko tam, gdzie adres jest pewny. Bez niego modal nie pokazuje
 * przycisku „Odwiedź stronę" - lepiej tak niż link w ciemno.
 */
export const partners: PartnerEntry[] = [
  {
    name: "BNY",
    logo: "/partnerzy/bny.webp",
    href: "https://www.bny.com",
    strategic: true,
    // Na podstawie zakładki „BNY Mellon” ze starej strony Samorządu (Wayback,
    // pobrane 2.11.2026). Zdjęć stamtąd nie bierzemy: to banery reklamowe BNY
    // ze starym logo, nie zdjęcia z wydarzeń Samorządu.
    story: {
      pl: "Wrocławskie biuro BNY, obecne w mieście od 2010 roku, miało na stronie Samorządu własną zakładkę dla studentów Uczelni. Przedstawiało w niej programy dla studentów: seminaria i konkurs na najlepszą pracę magisterską z Data Science & Analytics oraz Graduate Opportunities Program dla osób, które chcą zacząć karierę w finansach.",
      en: "BNY's Wrocław office, in the city since 2010, had its own section for University students on the Student Government website. It presented its student programmes there: Data Science & Analytics seminars and a best master's thesis competition, and the Graduate Opportunities Program for people who want to start a career in finance.",
    },
  },
  { name: "Starbucks Chilled Coffee", logo: "/partnerzy/starbucks-chilled-coffee.webp" },
  { name: "UPS", logo: "/partnerzy/ups.webp", href: "https://www.ups.com/pl/pl" },
  { name: "PwC", logo: "/partnerzy/pwc.webp", href: "https://www.pwc.pl" },
  { name: "Kaufland", logo: "/partnerzy/kaufland.webp", href: "https://www.kaufland.pl" },
  { name: "mBank", logo: "/partnerzy/mbank.webp", href: "https://www.mbank.pl" },
  { name: "BNP Paribas", logo: "/partnerzy/bnp-paribas.webp", href: "https://www.bnpparibas.pl" },
  { name: "Pyszne.pl", logo: "/partnerzy/pyszne.webp", href: "https://www.pyszne.pl" },
  { name: "Burn", logo: "/partnerzy/burn.webp" },
  { name: "Bielenda", logo: "/partnerzy/bielenda.webp", href: "https://bielenda.com" },
  { name: "Techland", logo: "/partnerzy/techland.webp", href: "https://techland.net" },
  { name: "Raben", logo: "/partnerzy/raben.webp", href: "https://polska.raben-group.com" },
  { name: "UPM", logo: "/partnerzy/upm.webp", href: "https://www.upm.com" },
  { name: "Pasibus", logo: "/partnerzy/pasibus.webp", href: "https://pasibus.pl" },
  { name: "iStudies", logo: "/partnerzy/istudies.webp" },
  { name: "Phinance", logo: "/partnerzy/phinance.webp" },
  { name: "Śniadaniowi", logo: "/partnerzy/sniadaniowi.webp", href: "https://porannycatering.pl" },
  { name: "Slice of Heaven", logo: "/partnerzy/slice-of-heaven.webp" },
  { name: "Drukarnia Mad Unicorns", logo: "/partnerzy/mad-unicorns.webp" },
  { name: "Fundacja Rozwoju Uniwersytetu Ekonomicznego we Wrocławiu", logo: "/partnerzy/fundacja-rozwoju-uew.webp" },
];
