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
}

// - Zarząd - sekcja „Zarząd" na stronie głównej (Board.tsx). roleKey ∈ board.roles.*
// Zdjęcia: public/photos/zarzad/01.jpg … (kolejność jak niżej).
export const board: Member[] = [
  { name: "Martyna Porębska", roleKey: "admin", email: "martyna.porebska@samorzad.ue.wroc.pl" },
  { name: "Zuzanna Bąk", roleKey: "external", email: "zuzanna.bak@samorzad.ue.wroc.pl" },
  { name: "Martyna Staniszewska", roleKey: "teaching", email: "martyna.staniszewska@samorzad.ue.wroc.pl" },
  { name: "Alicja Rózik", roleKey: "promo", email: "alicja.rozik@samorzad.ue.wroc.pl" },
  { name: "Katarzyna Krzepkowska", roleKey: "finance", email: "katarzyna.krzepkowska@samorzad.ue.wroc.pl" },
  { name: "Lena Kwoka", roleKey: "hr", email: "lena.kwoka@samorzad.ue.wroc.pl" },
  // Adres ze strony Filii na starym serwisie (archiwum Wix, 15.10.2026).
  { name: "Szymon Woźniak", roleKey: "branch", email: "szymon.wozniak@samorzad.ue.wroc.pl" },
];

// - Przewodnicząca + Wiceprzewodniczący (PrzewodniczacyContent). roleKey ∈ przewodniczacy.roles.*
export const chair: Member = {
  name: "Karol Vogel",
  email: "karol.vogel@samorzad.ue.wroc.pl",
};

export const viceChairs: Member[] = [
  { name: "Mikołaj Radliński", roleKey: "strategy", email: "mikolaj.radlinski@samorzad.ue.wroc.pl" },
  { name: "Julia Pytel", roleKey: "projects", email: "julia.pytel@samorzad.ue.wroc.pl" },
  { name: "Alicja Góralska", roleKey: "pr", email: "alicja.goralska@samorzad.ue.wroc.pl" },
];

// - Władze rektorskie (WladzeRektorskieContent). roleKey ∈ wladze.roles.*
export const rector: Member = { name: "prof. dr hab. Czesław Zając" };

export const viceRectors: Member[] = [
  { name: "dr hab. inż. Andrzej Okruszek, prof. UEW", roleKey: "student" },
  { name: "dr hab. Piotr Bednarek, prof. UEW", roleKey: "finance" },
  { name: "prof. dr hab. Bogusława Drelich-Skulska", roleKey: "intl" },
  { name: "prof. dr hab. Marek Kośny", roleKey: "science" },
];

// - Dziekani i prodziekani (DziekaniContent). `key` → kierunki: dziekani.kierunki.*
export const dean: Member = {
  name: "dr Wioletta Turowska, prof. UEW",
  email: "wioletta.turowska@ue.wroc.pl",
};

export const viceDeans: { name: string; key: string; email?: string }[] = [
  { name: "dr inż. Monika Wereńska", key: "werenska", email: "monika.werenska@ue.wroc.pl" },
  { name: "dr hab. Sebastian Bobowski, prof. UEW", key: "bobowski", email: "sebastian.bobowski@ue.wroc.pl" },
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

// - RUSS: terminy posiedzeń (RUSSContent). PUSTA lista = „Wkrótce".
// Format: { date: "2026-03-15", note?: "godz. 18:00, sala 101 bud. Z" }
export const russMeetings: { date: string; note?: string }[] = [];

// - Studencka Komisja Wyborcza (KomisjaWyborczaContent). roleKey ∈ skw.roles.*
// PUSTA lista = sekcja „Skład" pokazuje stan „Wkrótce" (skład jeszcze nieogłoszony).
// Gdy będzie skład: { name: "Imię Nazwisko", roleKey: "chair" | "memberF" | "memberM" }
export const electionCommittee: Member[] = [];
