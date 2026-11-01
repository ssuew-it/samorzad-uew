/**
 * Czysta logika kalkulatora średniej do stypendium Rektora. Bez UI - testowalna w izolacji.
 *
 * Regulamin świadczeń dla studentów UEW, § 21 ust. 4: „Średnia ocen to średnia
 * ARYTMETYCZNA ze wszystkich ocen, z wyłączeniem proseminarium, seminarium
 * dyplomowego, wychowania fizycznego, praktyk, seminarium dyplomowego/pracowni
 * dyplomowej, egzaminu dyplomowego i pracy dyplomowej, uzyskanych w ostatnich
 * dwóch semestrach”. Wcześniej kalkulator ważył oceny punktami ECTS - to było
 * niezgodne z regulaminem (poprawione 1.11.2026).
 *
 * Przedmioty bez oceny (w tym „zal.”) mają `grade: null` - nie wchodzą do średniej.
 */

/** Dopuszczalne oceny w skali UEW. */
export const GRADES = [2, 3, 3.5, 4, 4.5, 5] as const;
export type Grade = (typeof GRADES)[number];

/** Średnia, od której wyniki w nauce są „wyróżniające” (§ 19 ust. 2). */
export const REKTOR_MIN_AVERAGE = 4;

/** Przedmioty, których ocen § 21 ust. 4 nie wlicza do średniej. */
const EXCLUDED = /seminari|wychowanie fizyczne|praktyk|egzamin dyplomow|prac[aey] dyplomow|pracownia dyplomow/i;

export function isExcludedFromAverage(courseName: string): boolean {
  return EXCLUDED.test(courseName);
}

export interface CourseInput {
  /** Ocena liczbowa lub `null` (nie wpisano / „zal.” / przedmiot wyłączony). */
  grade: number | null;
}

export interface AverageSummary {
  /** Średnia arytmetyczna lub `null`, gdy nie ma żadnej oceny. */
  average: number | null;
  /** Liczba przedmiotów z wpisaną oceną. */
  graded: number;
  /** Liczba przedmiotów, które mogą mieć ocenę. */
  total: number;
}

export function computeAverage(courses: CourseInput[]): AverageSummary {
  let sum = 0;
  let graded = 0;
  for (const c of courses) {
    if (c.grade !== null) {
      sum += c.grade;
      graded += 1;
    }
  }
  return { average: graded > 0 ? sum / graded : null, graded, total: courses.length };
}
