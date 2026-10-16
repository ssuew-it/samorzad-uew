/**
 * Sytuacje studenta w Strefie studenta (/dla-studenta) i narzędzia na co dzień.
 *
 * Osobny moduł (bez "use client"), bo z listy korzysta też strona po stronie
 * serwera: lead w hero podaje liczbę sytuacji, więc liczy ją stąd, zamiast
 * mieć ją wpisaną w tekst — po dodaniu sytuacji liczba zmieni się sama.
 */

export interface SituationEntry {
  key: string;
  href: string;
}

export const situations: SituationEntry[] = [
  { key: "zapomoga", href: "/stypendia#zapomoga" },
  { key: "stypendium", href: "/stypendia" },
  { key: "srednia", href: "/stypendia#kalkulator" },
  { key: "semestr", href: "/infopacki/zaliczenie-semestru" },
  { key: "podanie", href: "/infopacki/podania" },
  { key: "usos", href: "/infopacki/usos" },
  { key: "ocena", href: "/prawa-studenta" },
  { key: "spor", href: "/rzecznik-praw-studenta" },
  { key: "psychika", href: "/pomoc-psychologiczna" },
  { key: "zajecia", href: "/mapa-kampusu" },
  { key: "biblioteka", href: "/infopacki/biblioteka" },
  { key: "dyplom", href: "/infopacki/dyplomowanie" },
  { key: "start", href: "/infopacki" },
  { key: "kontakt", href: "/infopacki/sprawy-studenckie" },
  { key: "zaangazowanie", href: "/infopacki/zycie-studenckie" },
  { key: "publikacja", href: "/wydawnictwo" },
];

export interface StudentTool {
  key: "usos" | "intranet" | "plan" | "harmonogram";
  href: string;
}

/**
 * Najczęściej klikane rzeczy na studiach — pasek zaraz pod hero.
 *
 * Harmonogram prowadzi do strony w BIP, nie do pliku PDF: plik ma w adresie
 * numer załącznika, który zmienia się przy każdej nowej wersji, a strona
 * w BIP zostaje. Do 17.10.2026 stał tu bezpośredni PDF na rok 2025/2026.
 * Przy zmianie roku podmień adres na stronę harmonogramu nowego roku.
 */
export const studentTools: StudentTool[] = [
  { key: "usos", href: "https://usosweb.ue.wroc.pl/kontroler.php?_action=news/default" },
  { key: "intranet", href: "https://uewrc.sharepoint.com/sites/IntranetUEW" },
  { key: "plan", href: "https://plan.ue.wroc.pl" },
  { key: "harmonogram", href: "https://www.bip.ue.wroc.pl/593/harmonogram-roku-akademickiego-20262027.html" },
];
