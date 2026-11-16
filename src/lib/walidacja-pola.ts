/**
 * Reguła walidacji pola formularza jako DANE, nie funkcja: strony z
 * formularzem renderują się na serwerze, a funkcji nie da się przekazać
 * z serwera do komponentu klienckiego (ContactForm).
 */
export interface RegulaPola {
  /** Minimalna liczba znaków (bez spacji na początku i końcu). */
  minLength?: number;
  /** Pole musi wyglądać jak adres e-mail. */
  email?: boolean;
  /** Komunikat pokazywany, gdy reguła nie jest spełniona. */
  message: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sprawdzPole(regula: RegulaPola, wartosc: string): string | undefined {
  if (regula.minLength !== undefined && wartosc.trim().length < regula.minLength) return regula.message;
  if (regula.email && !EMAIL.test(wartosc)) return regula.message;
  return undefined;
}
