import { HomeExperience } from "@/components/home/HomeExperience";
import { NextEvent } from "@/components/NextEvent";
import { StudentLife } from "@/components/StudentLife";
import { TrustStrip } from "@/components/home/TrustStrip";

/**
 * Strona główna — skład po uporządkowaniu.
 *
 * Wcześniej stała tu notka „nie usuwać sekcji bez zgody zamawiającego". Zgoda
 * padła: Samorząd polecił usunąć talię projektów, żywe archiwum i sekcję
 * domykającą, bo strona urosła z kilku równoległych koncepcji naraz i sekcje
 * zaczęły mówić to samo dwa razy.
 *
 * Co zostało i po co — każda pozycja odpowiada na INNE pytanie:
 *
 * - `HomeExperience` — kim jesteśmy (ściana kadrów) i od czego zacząć
 *                      (sytuacje studenta, manifest).
 * - `NextEvent`      — pytanie o CZAS: co dzieje się najbliżej. Renderuje się
 *                      dopiero po ustawieniu EVENTS_SHEET_CSV_URL; bez niego
 *                      świadomie nie pokazuje nic, zamiast zmyślać wydarzenie.
 * - `StudentLife`    — jedyne miejsce, gdzie zdjęcie dostaje pełny ekran.
 * - `TrustStrip`     — pytanie o ZAUFANIE: kto z nami współpracował.
 *
 * Pasek kursów walut NBP (`EconTicker`) wyleciał 19.10.2026: nie odpowiadał na
 * żadne pytanie studenta, a przegląd strony wskazał go jako ozdobę bez funkcji.
 *
 * Zanim dołożysz kolejną sekcję: sprawdź, czy nie odpowiada na pytanie, na
 * które któraś już odpowiada. Tak powstał bałagan, który tu sprzątaliśmy.
 */
export default function Home() {
  // Bez własnego <main>: landmark z `id="main-content"` (cel odnośnika
  // „przejdź do treści") tworzy `[locale]/template.tsx` dla każdej trasy.
  // Powielenie go tutaj dawało <main> w <main> i dwa elementy z tym samym `id`.
  return (
    <>
      <HomeExperience />
      <NextEvent />
      <StudentLife />
      <TrustStrip />
    </>
  );
}
