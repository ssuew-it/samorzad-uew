/**
 * Pozycja w roku akademickim i odliczanie dni.
 *
 * Daty sesji i przerw są w `lib/terminy.ts` (przepisane z harmonogramu
 * roku akademickiego). Tu zostaje tylko arytmetyka kalendarza.
 */

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

  return { kind: "week", value: academicWeek(now) ?? 1 };
}

/**
 * Tydzień roku akademickiego liczony od poniedziałku: tydzień 1 to ten,
 * w którym wypada 1 października. Wiersz siatki kalendarza (pn-nd) ma więc
 * zawsze jeden numer, zgodny z kartką „N. tydzień roku” i paskiem na głównej.
 * `null` w wakacje (lipiec-wrzesień), z tego samego powodu co wyżej.
 */
export function academicWeek(date: Date): number | null {
  const month = date.getMonth();
  if (month >= 6 && month <= 8) return null;
  const year = month >= 9 ? date.getFullYear() : date.getFullYear() - 1;
  const oct1 = new Date(year, 9, 1);
  const monday = new Date(year, 9, 1 - ((oct1.getDay() + 6) % 7));
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Math.round: przejście na czas zimowy skraca jedną dobę o godzinę.
  const days = Math.round((day.getTime() - monday.getTime()) / 86_400_000);
  return Math.floor(days / 7) + 1;
}
