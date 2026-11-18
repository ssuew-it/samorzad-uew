/**
 * Tablica Kaizen - karteczki, które Zarząd oznaczył w arkuszu „Pokaż na
 * tablicy: TAK”, razem ze statusem i odpowiedzią.
 *
 * Arkusz formularzy jest prywatny, więc nie czytamy go przez gviz jak
 * „Treści strony”. Pytamy ten sam Apps Script, który zapisuje karteczki
 * (z sekretem), a on oddaje WYŁĄCZNIE wiersze wystawione na tablicę.
 *
 * Wynik trzymamy 10 minut: tablica nie musi być natychmiastowa, a każde
 * wejście do Strefy nie powinno budzić skryptu Google.
 */
import "server-only";
import { unstable_cache } from "next/cache";
import { parseKarteczkiZarzadu, parseTablica, skryptObslugujeOdpowiedzi, type KarteczkaNaTablicy, type KarteczkaZarzadu } from "./kaizen";

/** `odpowiedzi` - skrypt zna odpowiedzi ze Strefy (patrz skryptObslugujeOdpowiedzi). */
export type Tablica = { ok: true; karteczki: KarteczkaNaTablicy[]; odpowiedzi: boolean } | { ok: false };

const pobierz = unstable_cache(
  async (): Promise<Tablica> => {
    const url = process.env.APPS_SCRIPT_URL!;
    const secret = process.env.APPS_SCRIPT_SECRET!;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formularz: "kaizen-tablica", secret }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; karteczki?: unknown; wersja?: unknown } | null;
    // Błąd rzucamy, a nie zwracamy: unstable_cache nie zapamięta wtedy pustej
    // tablicy na 10 minut po jednej nieudanej odpowiedzi skryptu.
    if (!res.ok || data?.ok !== true) throw new Error(`Apps Script ${res.status}`);
    return { ok: true, karteczki: parseTablica(data.karteczki), odpowiedzi: skryptObslugujeOdpowiedzi(data) };
  },
  ["kaizen-tablica"],
  { revalidate: 600, tags: ["kaizen"] },
);

export async function getTablicaKaizen(): Promise<Tablica> {
  // Brak konfiguracji sprawdzamy poza cache - inaczej wynik „brak” zostałby
  // zapamiętany na 10 minut także po ustawieniu zmiennych.
  if (!process.env.APPS_SCRIPT_URL || !process.env.APPS_SCRIPT_SECRET) return { ok: false };
  try {
    return await pobierz();
  } catch (err) {
    console.error("[kaizen] Nie udało się pobrać tablicy", { error: err instanceof Error ? err.message : String(err) });
    return { ok: false };
  }
}

/** `stary-skrypt` - w arkuszu działa Code.gs sprzed odpowiedzi ze Strefy. */
export type KarteczkiZarzadu = { ok: true; karteczki: KarteczkaZarzadu[] } | { ok: false; powod?: "stary-skrypt" };

const pobierzWszystkie = unstable_cache(
  async (): Promise<KarteczkaZarzadu[]> => {
    const url = process.env.APPS_SCRIPT_URL!;
    const secret = process.env.APPS_SCRIPT_SECRET!;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formularz: "kaizen-wszystkie", secret }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; karteczki?: unknown } | null;
    if (!res.ok || data?.ok !== true) throw new Error(`Apps Script ${res.status}`);
    return parseKarteczkiZarzadu(data.karteczki);
  },
  ["kaizen-wszystkie"],
  { revalidate: 60, tags: ["kaizen"] },
);

/**
 * Wszystkie karteczki dla Zarządu (także nieomówione). Cache tylko 60 s
 * z tagiem „kaizen”: zapis odpowiedzi na stronie czyści go od razu
 * (updateTag), a zmiany wpisane ręcznie w arkuszu widać najpóźniej po
 * minucie. Bez cache każde wejście czekało kilka sekund na skrypt Google.
 * Wołać WYŁĄCZNIE po sprawdzeniu roli (strona Kaizen robi to przez canSee).
 */
export async function getKarteczkiZarzadu(): Promise<KarteczkiZarzadu> {
  if (!process.env.APPS_SCRIPT_URL || !process.env.APPS_SCRIPT_SECRET) return { ok: false };
  try {
    return { ok: true, karteczki: await pobierzWszystkie() };
  } catch (err) {
    console.error("[kaizen] Nie udało się pobrać karteczek dla Zarządu", { error: err instanceof Error ? err.message : String(err) });
    return { ok: false };
  }
}
