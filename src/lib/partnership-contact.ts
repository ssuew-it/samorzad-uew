/** Contact for all partnership enquiries, confirmed by the site owner. */
export const partnershipContact = {
  name: "Zuzanna Bąk",
  email: "zuzanna.bak@samorzad.ue.wroc.pl",
  /** Klucz funkcji w `board.roles` (Członkini Zarządu ds. Kontaktów Zewnętrznych). */
  roleKey: "external",
  /** Portret 4:5, ten sam co na stronie Zarządu. */
  photo: "/photos/zarzad/zuzanna-bak.webp" as string | null,
} as const;

/**
 * Oferta współpracy w PDF (scripts/build-oferta.mjs). UKRYTA od 2.11.2026 -
 * Samorząd chce ją jeszcze dopracować. Pliki leżą w docs/oferta (poza
 * public/, więc nikt ich nie pobierze ze strony). Publikacja: przenieś oba
 * PDF-y do public/dokumenty, wpisz rozmiary niżej i ustaw `published: true`.
 */
export const partnershipOffer = {
  published: false,
  pl: { href: "/dokumenty/oferta-wspolpracy-ssuew-pl.pdf", bytes: 3142079 },
  en: { href: "/dokumenty/oferta-wspolpracy-ssuew-en.pdf", bytes: 3050662 },
} as const;
