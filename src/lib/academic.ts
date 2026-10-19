/**
 * Daty roku akademickiego - JEDNO ŹRÓDŁO PRAWDY dla odliczania w hero.
 *
 * DLACZEGO TO JEST PUSTE, A NIE WYPEŁNIONE „MNIEJ WIĘCEJ"
 *
 * Terminy sesji ustala uczelnia i zmieniają się co rok. Wpisanie tu daty
 * „z grubsza" dałoby licznik, który odlicza do dnia wziętego z sufitu - a
 * student zaplanuje pod niego naukę. Lepszy brak licznika niż licznik kłamiący.
 *
 * JAK URUCHOMIĆ: wpisz datę w formacie RRRR-MM-DD, np. "2027-01-25".
 * Licznik pojawi się sam. Pusty ciąg = licznika nie ma, reszta paska działa.
 *
 * Źródło: organizacja roku akademickiego UEW (zarządzenie Rektora).
 */
export const SESSION_START = "";

/** Nazwa sesji, do której liczymy - pokazywana pod licznikiem. */
export const SESSION_LABEL_KEY = "winter";

/**
 * Ile pełnych dni zostało do podanej daty. `null`, gdy daty nie ma, jest
 * niepoprawna albo już minęła - w każdym z tych przypadków licznik znika,
 * zamiast pokazywać zero lub liczbę ujemną.
 */
export function daysUntil(date: string, now: number = Date.now()): number | null {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`).getTime();
  if (Number.isNaN(target)) return null;
  const days = Math.ceil((target - now) / 86_400_000);
  return days > 0 ? days : null;
}

/**
 * Gdzie jesteśmy w roku akademickim.
 *
 * DLACZEGO TO NIE JEST ZWYKŁE „TYDZIEŃ = DNI / 7"
 *
 * Prosty wzór liczony od 1 października daje w połowie sierpnia „tydzień 46".
 * Formalnie się zgadza, tylko rok akademicki skończył się dwa miesiące
 * wcześniej - student czyta liczbę, która nic nie znaczy. Sprawdzone: w
 * sierpniu pasek pokazywał dokładnie to.
 *
 * Dlatego w wakacje (lipiec-wrzesień) zamiast martwego numeru tygodnia
 * pokazujemy odliczanie do 1 października. To jest prawdziwa data, wynika
 * z kalendarza, i akurat wtedy jest najbardziej interesująca.
 */
export type YearPosition =
  | { kind: "week"; value: number }
  | { kind: "toStart"; days: number };

export function yearPosition(now: Date): YearPosition {
  const month = now.getMonth(); // 0 = styczeń
  const inBreak = month >= 6 && month <= 8; // lipiec, sierpień, wrzesień

  if (inBreak) {
    const start = new Date(now.getFullYear(), 9, 1); // 1 października tego roku
    const days = Math.max(1, Math.ceil((start.getTime() - now.getTime()) / 86_400_000));
    return { kind: "toStart", days };
  }

  const year = month >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const start = new Date(year, 9, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return { kind: "week", value: Math.max(1, Math.floor(days / 7) + 1) };
}
