/**
 * Czy ten użytkownik już odpowiedział na „Jak oceniasz nową stronę?”.
 *
 * Wpis powstaje dopiero po ruchu użytkownika (ocena albo „zamknij”) - to
 * zapamiętanie jego wyboru, nie śledzenie, więc nie wymaga zgody na cookies.
 * Gdy przeglądarka nie pozwala czytać pamięci, traktujemy to jak „już
 * odpowiedziano”: lepiej nie zapytać wcale niż pytać przy każdej wizycie.
 */
export const FEEDBACK_KEY = "ssuew-opinia";

export function feedbackDone(): boolean {
  try {
    return localStorage.getItem(FEEDBACK_KEY) !== null;
  } catch {
    return true;
  }
}

export function markFeedbackDone(): void {
  try {
    localStorage.setItem(FEEDBACK_KEY, new Date().toISOString().slice(0, 10));
  } catch {
    // Brak pamięci przeglądarki - okienko i tak się nie pokaże (feedbackDone).
  }
}

/** Adres z ?opinia=teraz pokazuje okienko od razu - do sprawdzania i testów. */
export function feedbackForcedByUrl(search: string): boolean {
  return new URLSearchParams(search).get("opinia") === "teraz";
}
