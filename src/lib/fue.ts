/**
 * Forum Uczelni Ekonomicznych - skład i osoby, dla strony /fue-i-psrp.
 *
 * Logotypy i budynki miast: public/logos/fue/ (z księgi identyfikacji FUE,
 * przekazane przez Samorząd 1.11.2026).
 * Bez logo kafelek pokazuje pełną nazwę uczelni, więc strona nigdy nie ma
 * pustego miejsca ani obrazka 404. Najlepiej SVG albo PNG z przezroczystym tłem.
 */
export interface FueMember {
  key: string;
  /** Pełna nazwa uczelni, po polsku i angielsku. */
  name: { pl: string; en: string };
  city: { pl: string; en: string };
  /** Logo samorządu tej uczelni - BIAŁE, bo kafelki stoją na granatowym tle. */
  logo?: string;
  /** Budynek miasta w kolorze z pięciokąta FUE (księga identyfikacji FUE). */
  building?: string;
  /** Nasz Samorząd - kafelek dostaje wyróżnienie. */
  ours?: boolean;
}

export const fueMembers: FueMember[] = [
  {
    key: "sgh",
    logo: "/logos/fue/ss-sgh.webp",
    building: "/logos/fue/bud-warszawa.webp",
    name: { pl: "Szkoła Główna Handlowa", en: "SGH Warsaw School of Economics" },
    city: { pl: "Warszawa", en: "Warsaw" },
  },
  {
    key: "uek",
    logo: "/logos/fue/ps-uek.webp",
    building: "/logos/fue/bud-krakow.webp",
    name: { pl: "Uniwersytet Ekonomiczny w Krakowie", en: "Krakow University of Economics" },
    city: { pl: "Kraków", en: "Kraków" },
  },
  {
    key: "ue-katowice",
    logo: "/logos/fue/ps-uekat.webp",
    building: "/logos/fue/bud-katowice.webp",
    name: { pl: "Uniwersytet Ekonomiczny w Katowicach", en: "University of Economics in Katowice" },
    city: { pl: "Katowice", en: "Katowice" },
  },
  {
    key: "uep",
    logo: "/logos/fue/ps-uep.webp",
    building: "/logos/fue/bud-poznan.webp",
    name: { pl: "Uniwersytet Ekonomiczny w Poznaniu", en: "Poznań University of Economics and Business" },
    city: { pl: "Poznań", en: "Poznań" },
  },
  {
    key: "uew",
    logo: "/logo-light.svg",
    building: "/logos/fue/bud-wroclaw.webp",
    name: { pl: "Uniwersytet Ekonomiczny we Wrocławiu", en: "Wroclaw University of Economics and Business" },
    city: { pl: "Wrocław", en: "Wrocław" },
    ours: true,
  },
];

/** Przewodniczący Forum w kadencji 2026/2027 - z naszego Samorządu. */
export const fueChair: { name: string; photo?: string } = {
  name: "Dawid Rutkowski",
};

/** Logotypy organizacji; puste = karta pokazuje ikonę. */
export const orgLogos: { fue?: string; psrp?: string } = {
  // Wersje 3D z Higgsfielda (1.11.2026), przezroczyste tło; płaskie zostają w folderze.
  fue: "/logos/fue/fue-3d.webp",
  psrp: "/logos/fue/psrp-3d.webp",
};
