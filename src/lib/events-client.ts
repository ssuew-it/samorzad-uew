/**
 * Wydarzenia z /api/events - jedno zapytanie na wejście na stronę, wspólne dla
 * wszystkich komponentów (pasek w hero, „Najbliżej w kalendarzu”, Kalendarz).
 * Wcześniej każdy pytał osobno i strona główna pobierała to samo trzy razy.
 *
 * Nieudana odpowiedź nie zostaje w pamięci - kolejne wywołanie spróbuje znowu.
 */
let pending: Promise<unknown> | null = null;

export function fetchEvents<T>(): Promise<T> {
  pending ??= fetch("/api/events")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("events"))))
    .catch((err) => {
      pending = null;
      throw err;
    });
  return pending as Promise<T>;
}
