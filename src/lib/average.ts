/**
 * Czysta logika kalkulatora średniej. Bez zależności, bez UI - testowalna w izolacji.
 *
 * Średnia jest WAŻONA punktami ECTS (decyzja: opcja A), liczona wyłącznie po
 * przedmiotach z wpisaną oceną liczbową. Przedmioty bez oceny (w tym „zal.")
 * mają `grade: null` - wchodzą do `totalEcts`, ale nie do średniej.
 */

/** Dopuszczalne oceny w skali UEW. */
export const GRADES = [2, 3, 3.5, 4, 4.5, 5] as const;
export type Grade = (typeof GRADES)[number];

export interface CourseInput {
  ects: number;
  /** Ocena liczbowa lub `null` (nie wpisano / „zal."). */
  grade: number | null;
}

export interface AverageSummary {
  /** Średnia ważona ECTS lub `null`, gdy brak ocenionych przedmiotów. */
  average: number | null;
  /** Suma ECTS przedmiotów z wpisaną oceną (mianownik średniej). */
  gradedEcts: number;
  /** Suma ECTS wszystkich przedmiotów na liście. */
  totalEcts: number;
}

export function computeAverage(courses: CourseInput[]): AverageSummary {
  let weightedSum = 0;
  let gradedEcts = 0;
  let totalEcts = 0;

  for (const c of courses) {
    totalEcts += c.ects;
    if (c.grade !== null) {
      weightedSum += c.grade * c.ects;
      gradedEcts += c.ects;
    }
  }

  return {
    average: gradedEcts > 0 ? weightedSum / gradedEcts : null,
    gradedEcts,
    totalEcts,
  };
}
