/**
 * Co pokazuje lista zarządzeń w Strefie: wyszukiwarka, filtr wydającego,
 * przełącznik uchylonych i wejście z linkiem do konkretnego zarządzenia.
 * Czyste funkcje - komponent tylko trzyma stan i rysuje wynik.
 */
import type { GrupaWydajacego, PozycjaRejestru } from "./zarzadzenia-wewnetrzne";

/** Tyle najnowszych widać od razu; reszta po „Pokaż wszystkie”. */
export const NA_START = 6;

export interface FiltrRejestru {
  q: string;
  grupa: GrupaWydajacego | "wszyscy";
  uchylone: boolean;
}

/** „Obiegu Dokumentów” = „obiegu dokumentow” - bez polskich znaków i wielkości liter. */
const norm = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/gi, "l")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export function filtrujRejestr(items: PozycjaRejestru[], f: FiltrRejestru): PozycjaRejestru[] {
  const slowa = norm(f.q).split(" ").filter(Boolean);
  return items.filter((i) => {
    if (!f.uchylone && i.repealedBy.length > 0) return false;
    if (f.grupa !== "wszyscy" && i.group !== f.grupa) return false;
    if (slowa.length === 0) return true;
    const tekst = norm(`${i.number} ${i.title}`);
    return slowa.every((s) => tekst.includes(s));
  });
}

export function celZHash(hash: string, items: PozycjaRejestru[]): PozycjaRejestru | null {
  const id = hash.replace(/^#/, "");
  if (!id) return null;
  return items.find((i) => i.id === id) ?? null;
}
