import { getKarteczkiZarzadu, getTablicaKaizen } from "@/lib/kaizen-tablica";
import { Tablica } from "./Kaizen";
import { KaizenZarzad } from "./KaizenZarzad";

/**
 * Tablica i (dla Zarządu) lista do odpowiedzi - obie czekają na Apps Script,
 * więc strona renderuje je w <Suspense>: formularz karteczki widać od razu.
 *
 * O listę Zarządu pytamy dopiero, gdy wdrożony skrypt ją zna (stary zapisałby
 * zapytanie jak formularz kontaktowy - pusty wiersz i mail).
 */
export async function KaizenTablice({ odpowiada }: { odpowiada: boolean }) {
  const tablica = await getTablicaKaizen();
  const zarzad = !odpowiada
    ? null
    : !tablica.ok
      ? ({ ok: false } as const)
      : !tablica.odpowiedzi
        ? ({ ok: false, powod: "stary-skrypt" } as const)
        : await getKarteczkiZarzadu();
  return (
    <>
      <Tablica tablica={tablica} />
      {zarzad && <KaizenZarzad zarzad={zarzad} />}
    </>
  );
}
