/**
 * Centralne źródło składów osobowych SSUEW.
 *
 * TU podmieniasz prawdziwe nazwiska / e-maile - komponenty czytają z tego pliku,
 * więc nie trzeba ich dotykać. Role są tłumaczone w komponentach przez `roleKey`
 * (klucz i18n w namespace danej sekcji), dlatego tutaj trzymamy wyłącznie dane
 * osoby: imię i nazwisko, ewentualnie e-mail. Kolejność osób = kolejność na
 * stronie (i kolejność zdjęć w `public/photos/...`, patrz `src/lib/photos.ts`).
 *
 * UWAGA: część danych to jeszcze placeholdery - wymień je na prawdziwe.
 */

export interface Member {
  name: string;
  /** Klucz roli w namespace sekcji (i18n), np. "chair" → board.roles.chair. */
  roleKey?: string;
  email?: string;
  /** Telefon w zapisie Uczelni, np. „71 36 80 141” (tylko osoby spoza Samorządu). */
  phone?: string;
  /** Portret 4:5 z sesji Zarządu (public/photos/zarzad). Brak = inicjały. */
  photo?: string;
}

// - Zarząd - sekcja „Zarząd" na stronie głównej (Board.tsx). roleKey ∈ board.roles.*
// Zdjęcia: public/photos/zarzad/<imie-nazwisko>.webp, portret 4:5 (640×800),
// przycięte z sesji Zarządu 2026/2027. Bez pola `photo` karta pokazuje inicjały.
export const board: Member[] = [
  { name: "Martyna Porębska", roleKey: "admin", email: "martyna.porebska@samorzad.ue.wroc.pl", photo: "/photos/zarzad/martyna-porebska.webp" },
  { name: "Zuzanna Bąk", roleKey: "external", email: "zuzanna.bak@samorzad.ue.wroc.pl", photo: "/photos/zarzad/zuzanna-bak.webp" },
  { name: "Martyna Staniszewska", roleKey: "teaching", email: "martyna.staniszewska@samorzad.ue.wroc.pl", photo: "/photos/zarzad/martyna-staniszewska.webp" },
  { name: "Alicja Rózik", roleKey: "promo", email: "alicja.rozik@samorzad.ue.wroc.pl", photo: "/photos/zarzad/alicja-rozik.webp" },
  { name: "Katarzyna Krzepkowska", roleKey: "finance", email: "katarzyna.krzepkowska@samorzad.ue.wroc.pl", photo: "/photos/zarzad/katarzyna-krzepkowska.webp" },
  { name: "Lena Kwoka", roleKey: "hr", email: "lena.kwoka@samorzad.ue.wroc.pl", photo: "/photos/zarzad/lena-kwoka.webp" },
  // Adres ze strony Filii na starym serwisie (archiwum Wix, 15.10.2026).
  { name: "Szymon Woźniak", roleKey: "branch", email: "szymon.wozniak@samorzad.ue.wroc.pl", photo: "/photos/filia/szymon-wozniak.webp" },
];

// - Przewodnicząca + Wiceprzewodniczący (PrzewodniczacyContent). roleKey ∈ przewodniczacy.roles.*
export const chair: Member = {
  name: "Karol Vogel",
  email: "karol.vogel@samorzad.ue.wroc.pl", photo: "/photos/zarzad/karol-vogel.webp",
};

export const viceChairs: Member[] = [
  { name: "Mikołaj Radliński", roleKey: "strategy", email: "mikolaj.radlinski@samorzad.ue.wroc.pl", photo: "/photos/zarzad/mikolaj-radlinski.webp" },
  { name: "Julia Pytel", roleKey: "projects", email: "julia.pytel@samorzad.ue.wroc.pl", photo: "/photos/zarzad/julia-pytel.webp" },
  { name: "Alicja Góralska", roleKey: "pr", email: "alicja.goralska@samorzad.ue.wroc.pl", photo: "/photos/zarzad/alicja-goralska.webp" },
];

// - Władze Uczelni (WladzeRektorskieContent). roleKey ∈ wladze.roles.*
// Skład, adresy i telefony ze strony uew.pl/uczelnia/wladze, 3.11.2026 (kadencja 2024-2028).
// Zdjęcia: public/photos/wladze/<imie-nazwisko>.webp, portret 4:5 (640×800), z tej samej strony.
export const rector: Member = {
  name: "prof. dr hab. Czesław Zając",
  email: "rektor@ue.wroc.pl",
  phone: "71 36 80 141",
  photo: "/photos/wladze/czeslaw-zajac.webp",
};

/** `dutyKey` łączy osobę z zakładką „Dyżury” w arkuszu (src/lib/dyzury.ts). */
export const viceRectors: (Member & { dutyKey?: "okruszek" })[] = [
  { name: "dr hab. inż. Andrzej Okruszek, prof. UEW", roleKey: "student", email: "prorektor.studenci@ue.wroc.pl", phone: "71 36 80 173", photo: "/photos/wladze/andrzej-okruszek.webp", dutyKey: "okruszek" },
  { name: "dr hab. Piotr Bednarek, prof. UEW", roleKey: "finance", email: "prorektor.finanse@ue.wroc.pl", phone: "71 36 80 160", photo: "/photos/wladze/piotr-bednarek.webp" },
  { name: "prof. dr hab. Bogusława Drelich-Skulska", roleKey: "intl", email: "prorektor.zagranica@ue.wroc.pl", phone: "71 36 80 132", photo: "/photos/wladze/boguslawa-drelich-skulska.webp" },
  { name: "prof. dr hab. Marek Kośny", roleKey: "science", email: "prorektor.nauka@ue.wroc.pl", phone: "71 36 80 141", photo: "/photos/wladze/marek-kosny.webp" },
];

/**
 * Pozostałe Władze Uczelni, w grupach. `group` → wladze.groups.*, `roleKey` → wladze.roles.*.
 * Dziekan ds. Studenckich i Prodziekani mają własną podstronę - tu tylko odsyłacz.
 */
export const universityOfficers: { group: "admin" | "faculties" | "units"; unitKey?: string; people: Member[] }[] = [
  {
    group: "admin",
    people: [
      { name: "dr Agnieszka Strońska-Rembisz", roleKey: "chancellor", email: "kanclerz@ue.wroc.pl", phone: "71 36 80 144" },
      { name: "dr Wojciech Krzeszowski", roleKey: "bursar", email: "kwestor@ue.wroc.pl", phone: "71 36 80 114" },
    ],
  },
  {
    group: "faculties",
    unitKey: "wip",
    people: [
      { name: "prof. dr hab. inż. Wojciech Golimowski", roleKey: "facultyDean" },
      { name: "dr hab. inż. Mirosława Teleszko, prof. UEW", roleKey: "facultyViceDean" },
    ],
  },
  {
    group: "faculties",
    unitKey: "weif",
    people: [
      { name: "prof. dr hab. Andrzej Graczyk", roleKey: "facultyDean" },
      { name: "dr hab. Katarzyna Kuziak, prof. UEW", roleKey: "facultyViceDean" },
    ],
  },
  {
    group: "faculties",
    unitKey: "wz",
    people: [
      { name: "dr hab. Estera Piwoni-Krzeszowska, prof. UEW", roleKey: "facultyDean" },
      { name: "dr hab. Natalia Szozda, prof. UEW", roleKey: "facultyViceDean" },
    ],
  },
  {
    group: "units",
    unitKey: "filia",
    people: [
      { name: "dr hab. Urszula Markowska-Przybyła, prof. UEW", roleKey: "branchDean" },
      { name: "dr hab. Małgorzata Solarz, prof. UEW", roleKey: "branchViceDean" },
    ],
  },
  {
    group: "units",
    unitKey: "doktorska",
    people: [{ name: "dr hab. Dominika Bąk-Grabowska, prof. UEW", roleKey: "doctoralDean" }],
  },
  {
    group: "units",
    unitKey: "ksztalcenie",
    people: [
      { name: "dr hab. Agnieszka Sokołowska-Durkalec, prof. UEW", roleKey: "educationDean" },
      { name: "dr hab. Bogusław Półtorak, prof. UEW", roleKey: "educationViceDean" },
    ],
  },
];

/** Skład Rady Uczelni w BIP; Przewodniczący Samorządu jest w niej z mocy ustawy (art. 19 ust. 1 pkt 2). */
export const UNIVERSITY_COUNCIL_URL = "https://bip.ue.wroc.pl/518/563/rada-uczelni-kadencja-2025-2028.html";
export const UNIVERSITY_AUTHORITIES_URL = "https://uew.pl/uczelnia/wladze/";

// - Dziekani i prodziekani (DziekaniContent). `key` → kierunki: dziekani.kierunki.*
// Dziekan ds. Studenckich nie ma przypisanych kierunków - rozstrzyga sprawy
// z zamkniętej listy (dziekani.dean.scope). Kierunki i adresy zgodne ze stroną
// Dziekanatu Uczelni (uew.pl/studenci/dziekanat), 2.11.2026. Dyżury są
// w arkuszu „Treści strony” (src/lib/dyzury.ts).
// Zdjęcia: public/photos/dziekani/<imie-nazwisko>.webp, portret 4:5 (640×800),
// z wizytówek pracowników na uew.pl.
export const dean: Member = {
  name: "dr hab. Wawrzyniec Michalczyk, prof. UEW",
  email: "wawrzyniec.michalczyk@ue.wroc.pl",
  photo: "/photos/dziekani/wawrzyniec-michalczyk.webp",
};

/** Oficjalna strona jednostki - źródło zakresu spraw i dyżurów. */
export const DEAN_UNIT_URL = "https://uew.pl/jednostki/uniwersytet-ekonomiczny/dziekan-ds-studenckich/";

export const viceDeans: { name: string; key: "turowska" | "werenska" | "bobowski"; email?: string; photo?: string }[] = [
  { name: "dr Wioletta Turowska, prof. UEW", key: "turowska", email: "wioletta.turowska@ue.wroc.pl", photo: "/photos/dziekani/wioletta-turowska.webp" },
  { name: "dr inż. Monika Wereńska", key: "werenska", email: "monika.werenska@ue.wroc.pl", photo: "/photos/dziekani/monika-werenska.webp" },
  { name: "dr hab. Sebastian Bobowski, prof. UEW", key: "bobowski", email: "sebastian.bobowski@ue.wroc.pl", photo: "/photos/dziekani/sebastian-bobowski.webp" },
];

// - RUSS, skład Rady (RUSSContent). Kolejność = zdjęcia public/photos/russ/01.jpg …
export const russMembers: string[] = [
  "Aleksandra Sobańtka",
  "Bartosz Buczkowski",
  "Bartosz Bakalarz",
  "Bartosz Giełzak",
  "Ewa Sosińska",
  "Ewelina Kaźmierczak",
  "Jakub Buchta",
  "Karina Służyńska",
  "Karolina Bąk",
  "Kornelia Wojtasik",
  "Maja Łońska",
  "Marta Lisowska",
  "Mateusz Szczepański",
  "Wiktoria Stokłosa",
  "Zofia Palus",
];

// Portrety radnych: kwadratowe kadry wyśrodkowane na twarzy (*-twarz.webp, 160×160)
// pod okrągłe miniatury; pełne zdjęcia 640×800 obok w public/photos/russ. Kto nie ma zdjęcia, dostaje
// na liście składu inicjały. Klucz = nazwisko dokładnie jak w russMembers.
export const russPhotos: Record<string, string> = {
  "Aleksandra Sobańtka": "/photos/russ/aleksandra-sobantka-twarz.webp",
  "Ewa Sosińska": "/photos/russ/ewa-sosinska-twarz.webp",
  "Ewelina Kaźmierczak": "/photos/russ/ewelina-kazmierczak-twarz.webp",
  "Kornelia Wojtasik": "/photos/russ/kornelia-wojtasik-twarz.webp",
  "Maja Łońska": "/photos/russ/maja-lonska-twarz.webp",
  "Marta Lisowska": "/photos/russ/marta-lisowska-twarz.webp",
  "Wiktoria Stokłosa": "/photos/russ/wiktoria-stoklosa-twarz.webp",
  "Zofia Palus": "/photos/russ/zofia-palus-twarz.webp",
};

// - RUSS: terminy posiedzeń i uchwały są w arkuszu „Treści strony” (src/lib/russ.ts).

// - Studencka Komisja Wyborcza (KomisjaWyborczaContent). roleKey ∈ skw.roles.*
// PUSTA lista = sekcja „Skład" pokazuje stan „Wkrótce" (skład jeszcze nieogłoszony).
// Gdy będzie skład: { name: "Imię Nazwisko", roleKey: "chair" | "memberF" | "memberM" }
// - Komisja Rewizyjna (KomisjaRewizyjnaContent). roleKey ∈ kr.roles.*
// Pusta lista = sekcja składu pokazuje „wkrótce”.
export const auditCommittee: Member[] = [
  { name: "Magdalena Skoczylas", roleKey: "chair" },
  { name: "Dawid Rutkowski", roleKey: "memberM" },
  { name: "Karol Szewczuk", roleKey: "memberM" },
];

export const electionCommittee: Member[] = [
  { name: "Hubert Gościmski", roleKey: "chairM", photo: "/photos/skw/hubert-goscimski.webp" },
  { name: "Aleksandra Kotwica", roleKey: "memberF" },
  { name: "Emilia Kleta", roleKey: "memberF" },
];
