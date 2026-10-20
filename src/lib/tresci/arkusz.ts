/**
 * Odczyt zakładki z arkusza „Treści strony”.
 *
 * DLACZEGO gviz, A NIE „OPUBLIKUJ W INTERNECIE”
 * Plik opublikowany jako CSV Google trzyma w swojej pamięci kilka minut,
 * więc po edycji strona i tak czekała. Endpoint gviz czyta bieżącą wersję
 * arkusza. Wymaga tylko udostępnienia arkusza „każdy, kto ma link, może
 * wyświetlać” (dane i tak są publiczne - trafiają na stronę).
 *
 * ODŚWIEŻANIE
 * Wynik jest w pamięci strony pod tagiem `TRESCI_TAG`. Skrypt w arkuszu po
 * każdej edycji woła /api/tresci/odswiez, a ten unieważnia tag - zmiana
 * jest na stronie po kilku sekundach. Godzina to tylko zabezpieczenie na
 * wypadek, gdyby skrypt nie zadziałał.
 */
import "server-only";

export const TRESCI_TAG = "tresci";
const FALLBACK_SECONDS = 3600;

export type TabResult = { ok: true; csv: string } | { ok: false; reason: string };

export function sheetId(): string | null {
  const id = process.env.TRESCI_SHEET_ID?.trim();
  return id ? id : null;
}

export async function readTab(tab: string): Promise<TabResult> {
  const id = sheetId();
  if (!id) return { ok: false, reason: "nie ustawiono TRESCI_SHEET_ID - strona używa danych z kodu" };
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
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
