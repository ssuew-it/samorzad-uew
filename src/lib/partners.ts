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
}

/*
 * Lista „Zaufali nam" ze starej strony Samorządu (podstrony „Partnerzy"
 * i „Współprace", archiwum z 15.10.2026), w tej samej kolejności. Zarząd
 * zdecydował, by pokazać wszystkich dotychczasowych partnerów - stąd
 * nagłówek w czasie przeszłym i opis, który nie twierdzi, że każda
 * współpraca trwa nadal.
 *
 * `href` tylko tam, gdzie adres jest pewny. Bez niego modal nie pokazuje
 * przycisku „Odwiedź stronę" - lepiej tak niż link w ciemno.
 */
export const partners: PartnerEntry[] = [
  { name: "BNY", logo: "/partnerzy/bny.webp", href: "https://www.bny.com", strategic: true },
  { name: "Kaufland", logo: "/partnerzy/kaufland.webp", href: "https://www.kaufland.pl" },
  { name: "PwC", logo: "/partnerzy/pwc.webp", href: "https://www.pwc.pl" },
  { name: "Pasibus", logo: "/partnerzy/pasibus.webp", href: "https://pasibus.pl" },
  { name: "iStudies", logo: "/partnerzy/istudies.webp" },
  { name: "Fundacja Rozwoju Uniwersytetu Ekonomicznego we Wrocławiu", logo: "/partnerzy/fundacja-rozwoju-uew.webp" },
  { name: "Phinance", logo: "/partnerzy/phinance.webp" },
  { name: "Raben", logo: "/partnerzy/raben.webp", href: "https://polska.raben-group.com" },
  { name: "Techland", logo: "/partnerzy/techland.webp", href: "https://techland.net" },
  { name: "Pyszne.pl", logo: "/partnerzy/pyszne.webp", href: "https://www.pyszne.pl" },
  { name: "UPS", logo: "/partnerzy/ups.webp", href: "https://www.ups.com/pl/pl" },
  { name: "Śniadaniowi", logo: "/partnerzy/sniadaniowi.webp", href: "https://porannycatering.pl" },
  { name: "Bielenda", logo: "/partnerzy/bielenda.webp", href: "https://bielenda.com" },
  { name: "Drukarnia Mad Unicorns", logo: "/partnerzy/mad-unicorns.webp" },
  { name: "Slice of Heaven", logo: "/partnerzy/slice-of-heaven.webp" },
  { name: "Burn", logo: "/partnerzy/burn.webp" },
  { name: "UPM", logo: "/partnerzy/upm.webp", href: "https://www.upm.com" },
  { name: "Starbucks Chilled Coffee", logo: "/partnerzy/starbucks-chilled-coffee.webp" },
  { name: "mBank", logo: "/partnerzy/mbank.webp", href: "https://www.mbank.pl" },
  { name: "BNP Paribas", logo: "/partnerzy/bnp-paribas.webp", href: "https://www.bnpparibas.pl" },
];
