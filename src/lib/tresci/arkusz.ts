/**
 * Odczyt zakładki z arkusza „Treści strony”.
 *
 * DLACZEGO gviz, A NIE „OPUBLIKUJ W INTERNECIE”
 * Plik opublikowany jako CSV Google trzyma w swojej pamięci kilka minut,
 * więc po edycji strona i tak czekała. Endpoint gviz czyta bieżącą wersję
 * arkusza. Wymaga tylko udostępnienia arkusza „każdy, kto ma link, może
 * wyświetlać”. Prawie wszystko i tak trafia na stronę publicznie; wyjątek to
 * zakładka „Zarządzenia wewnętrzne” - strona pokazuje ją tylko w Strefie
 * Działacza, ale KAŻDY, kto ma link do arkusza (edytujący, podgląd „Treści
 * strony”), może ją przeczytać: numery, tytuły i adresy PDF. Treść zarządzeń
 * chroni dopiero udostępnianie PDF-ów na Dysku wyłącznie domenie
 * samorzad.ue.wroc.pl (docs/JAK-EDYTOWAC.md).
 *
 * ODŚWIEŻANIE
 * Wynik jest w pamięci strony pod tagiem `TRESCI_TAG`. Skrypt w arkuszu po
 * każdej edycji woła /api/tresci/odswiez, a ten unieważnia tag - zmiana
 * jest na stronie po kilku sekundach. 6 godzin to tylko zabezpieczenie na
 * wypadek, gdyby skrypt nie zadziałał (do 11.2026 była godzina - każde
 * przeliczenie strony to CPU i zapis ISR, a edycje i tak przychodzą webhookiem).
 */
import "server-only";

export const TRESCI_TAG = "tresci";
const FALLBACK_SECONDS = 21600;

export type TabResult = { ok: true; csv: string } | { ok: false; reason: string };

/**
 * ID arkusza z TRESCI_SHEET_ID. Przyjmujemy też cały link do arkusza
 * („…/spreadsheets/d/<ID>/edit…”) - łatwo go wkleić zamiast samego ID,
 * a wtedy gviz odpowiadał 404 i strona po cichu brała dane z kodu.
 */
export function sheetId(): string | null {
  const raw = process.env.TRESCI_SHEET_ID?.trim().replace(/^["']|["']$/g, "");
  if (!raw) return null;
  const fromUrl = /\/spreadsheets\/d\/([A-Za-z0-9_-]+)/.exec(raw);
  return fromUrl ? fromUrl[1] : raw;
}

export async function readTab(tab: string): Promise<TabResult> {
  const id = sheetId();
  if (!id) return { ok: false, reason: "nie ustawiono TRESCI_SHEET_ID - strona używa danych z kodu" };
  // headers=1: dokładnie jeden wiersz nagłówka. Bez tego gviz zgaduje i przy
  // krótkich zakładkach (np. 2-3 posiedzenia) potrafi skleić pierwsze wiersze
  // danych z nagłówkiem - wtedy kolumna „data” znika i zakładka wygląda na pustą.
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  try {
    const res = await fetch(url, { next: { tags: [TRESCI_TAG], revalidate: FALLBACK_SECONDS } });
    if (res.status === 400 || res.status === 404) {
      return { ok: false, reason: `nie ma arkusza o tym ID albo zakładki „${tab}” - sprawdź TRESCI_SHEET_ID w Vercelu i nazwę zakładki (wielkość liter ma znaczenie)` };
    }
    if (!res.ok) return { ok: false, reason: `arkusz odpowiedział błędem ${res.status}` };
    const csv = await res.text();
    // Arkusz bez udostępnienia przez link zwraca stronę logowania Google.
    if (/^\s*<(!doctype|html)/i.test(csv)) {
      return { ok: false, reason: "arkusz nie jest udostępniony „każdy, kto ma link, może wyświetlać”" };
    }
    return { ok: true, csv };
  } catch {
    return { ok: false, reason: "nie udało się połączyć z arkuszem" };
  }
}
