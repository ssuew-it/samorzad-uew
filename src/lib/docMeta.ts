/**
 * Formatowanie metryczki dokumentu (rozmiar, data uchwały) w rejestrach aktów.
 *
 * Rozmiar liczymy w potęgach 1024, tak jak pokazuje go przeglądarka na pasku
 * pobierania - student widzi tam tę samą liczbę, co na stronie.
 */

const KB = 1024;
const MB = KB * 1024;

export function formatBytes(bytes: number, locale: string): string {
  const lang = locale === "en" ? "en-GB" : "pl-PL";
  if (bytes >= MB) {
    const value = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(bytes / MB);
    return `${value} MB`;
  }
  const value = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(
    Math.max(1, Math.round(bytes / KB)),
  );
  return `${value} KB`;
}

/** Data w zapisie rejestrowym: 27.04.2025 (pl) / 27 Apr 2025 (en). */
export function formatActDate(iso: string, locale: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
