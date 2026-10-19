/**
 * Opis pogody z kodu WMO.
 *
 * Open-Meteo zwraca `weather_code` w standardzie WMO 4677 - liczbę, nie tekst.
 * Zamiana na klucz tłumaczenia jest czystą funkcją, więc siedzi tutaj, a nie
 * w komponencie: da się ją przetestować bez przeglądarki i bez sieci.
 *
 * Grupujemy kody do kilku pojęć, które komukolwiek się przydają. Rozróżnianie
 * „lekkiej" i „umiarkowanej" mżawki w pasku na stronie głównej nie zmienia
 * niczyjej decyzji, a mnoży tłumaczenia.
 */
export type WeatherKind =
  | "clear"
  | "cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm"
  | "unknown";

export function weatherKind(code: number): WeatherKind {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "cloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "storm";
  return "unknown";
}

/**
 * Temperatura do wyświetlenia.
 *
 * Zaokrąglenie do pełnych stopni jest celowe: pasek pokazuje, czy wziąć
 * kurtkę, a nie prowadzi pomiaru. `Math.round` zamiast obcięcia, żeby -0.4
 * nie pokazało się jako „-0".
 */
export function formatTemp(celsius: number): string {
  const rounded = Math.round(celsius);
  // `Object.is` odróżnia -0 od 0; bez tego „-0 °C" trafia na stronę.
  return `${Object.is(rounded, -0) ? 0 : rounded}°C`;
}
