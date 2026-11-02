/**
 * Wyszukiwanie kierunku studiów - wspólne dla /dziekan-i-prodziekani
 * i /infopacki/sprawy-studenckie. Bez wielkości liter i polskich znaków, żeby
 * „zarzadzanie” i „Zarządzanie” znajdowały to samo.
 */
export function foldProgramme(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/gi, "l").toLocaleLowerCase("pl").trim();
}

/** Czy nazwa kierunku pasuje do zapytania (fragment, min. 2 znaki). */
export function programmeMatches(programme: string, query: string): boolean {
  const q = foldProgramme(query);
  return q.length >= 2 && foldProgramme(programme).includes(q);
}
