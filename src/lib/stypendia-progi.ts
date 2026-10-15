/**
 * Progi stypendium socjalnego + czyste funkcje miernika progu.
 *
 * Kwoty zmieniają się co rok akademicki. Aktualizacja = podmiana wartości
 * w `PROGI_SOCJALNE` (i ewentualnie `incomeYear`), bez dotykania komponentu.
 * Wszystko liczy się w przeglądarce; ten moduł nie ma żadnych efektów ubocznych.
 */

export interface ProgiSocjalne {
  /** Rok akademicki, którego dotyczą kwoty. */
  academicYear: string;
  /**
   * Rok kalendarzowy, z którego liczy się dochód. Regulamin §14 ust. 1:
   * „roku podatkowym, poprzedzającym rok akademicki”; zał. 2 ust. 10.
   */
  incomeYear: number;
  /** Akt, z którego pochodzą kwoty (nazwa dokumentu, nie tłumaczymy). */
  source: string;
  /** Maks. miesięczny dochód netto na członka rodziny (zał. 4 pkt 1). */
  threshold: number;
  /**
   * Kwota z art. 8 ust. 1 pkt 2 ustawy o pomocy społecznej (zał. 4 pkt 4).
   * Dochód, który jej NIE przekracza, wymaga zaświadczenia z OPS/CUS (§16 ust. 4).
   */
  opsAmount: number;
  /** Próg samodzielności finansowej, §15 ust. 2 pkt 5 (zał. 4 pkt 5). */
  independence: number;
}

export const PROGI_SOCJALNE: ProgiSocjalne = {
  academicYear: "2025/2026",
  incomeYear: 2024,
  source: "Zarządzenie Rektora nr 123/2025, załącznik nr 4",
  threshold: 1908.9,
  opsAmount: 823.0,
  independence: 1696.8,
};

/** Górna granica sensownego wpisu. Chroni przed literówką typu 10 zer. */
export const MAX_AMOUNT = 100_000_000;
export const MAX_PEOPLE = 30;

export type ParseError = "invalid" | "negative" | "tooLarge" | "zero";
export type ParseResult =
  | { ok: true; value: number }
  | { ok: false; error: ParseError | "empty" };

/**
 * Kwota wpisana po polsku albo po angielsku: „1 234,56”, „1234.56”,
 * „1.234,56”, „1,234.56”. Spacje (także twarde z kopiuj-wklej) to separator
 * tysięcy. Gdy występują i kropka, i przecinek, ostatni z nich jest dziesiętny.
 */
export function parseAmount(raw: string): ParseResult {
  const s = raw.replace(/[\s  ]/g, "").replace(/zł$/i, "");
  if (s === "") return { ok: false, error: "empty" };
  if (/^-/.test(s)) {
    // Sprawdzamy format reszty, żeby „-abc” nie udawało liczby ujemnej.
    return /^-[\d.,]+$/.test(s) ? { ok: false, error: "negative" } : { ok: false, error: "invalid" };
  }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return { ok: false, error: "invalid" };

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let normalized: string;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? "," : ".";
    const group = decimal === "," ? "." : ",";
    normalized = s.split(group).join("").replace(decimal, ".");
  } else if (lastComma >= 0 || lastDot >= 0) {
    const sep = lastComma >= 0 ? "," : ".";
    const parts = s.split(sep);
    // Kilka tych samych separatorów („1.234.567”) to grupowanie tysięcy.
    // Pojedynczy separator z dokładnie trzema cyframi po nim („60.000”, „1,500”)
    // też: kwoty mają najwyżej dwa miejsca po przecinku, a tak piszą tysiące.
    const looksGrouped =
      parts.length > 2 || (parts.length === 2 && /^\d{1,3}$/.test(parts[0]) && /^\d{3}$/.test(parts[1]));
    normalized = looksGrouped ? parts.join("") : parts.join(".");
  } else {
    normalized = s;
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) return { ok: false, error: "invalid" };
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { ok: false, error: "invalid" };
  if (value > MAX_AMOUNT) return { ok: false, error: "tooLarge" };
  return { ok: true, value };
}

/** Liczba osób w rodzinie: liczba całkowita od 1 (student liczy siebie). */
export function parsePeople(raw: string): ParseResult {
  const s = raw.replace(/[\s  ]/g, "");
  if (s === "") return { ok: false, error: "empty" };
  if (/^-\d+$/.test(s)) return { ok: false, error: "negative" };
  if (!/^\d+$/.test(s)) return { ok: false, error: "invalid" };
  const value = Number(s);
  if (value === 0) return { ok: false, error: "zero" };
  if (value > MAX_PEOPLE) return { ok: false, error: "tooLarge" };
  return { ok: true, value };
}

export type IncomePeriod = "year" | "month";

/** Zaokrąglenie do grosza; liczymy w groszach, żeby uniknąć błędów float. */
export function roundGrosze(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Roczny dochód rodziny → średnio miesięcznie (zał. 2 ust. 10: suma z roku, regulamin liczy miesięcznie). */
export function yearlyToMonthly(yearly: number): number {
  return yearly / 12;
}

/**
 * Miesięczny dochód netto na osobę, zaokrąglony do grosza.
 * Zwraca null, gdy liczba osób nie ma sensu (0, ujemna, ułamek, NaN).
 */
export function monthlyPerPerson(income: number, people: number, period: IncomePeriod): number | null {
  if (!Number.isFinite(income) || income < 0) return null;
  if (!Number.isInteger(people) || people < 1) return null;
  const monthly = period === "year" ? yearlyToMonthly(income) : income;
  return roundGrosze(monthly / people);
}

export type Classification = "belowOps" | "withinThreshold" | "aboveThreshold";

export interface Assessment {
  perPerson: number;
  status: Classification;
  /** Zawsze >= 0: ile brakuje do progu albo o ile go przekroczono. */
  distance: number;
}

/**
 * Obie granice są włącznie, bo regulamin mówi „nie przekracza”:
 * §13 ust. 1 (próg 1 908,90 zł) i §16 ust. 4 (kwota 823,00 zł).
 */
export function classify(perPerson: number, progi: ProgiSocjalne = PROGI_SOCJALNE): Assessment {
  const pp = Math.round(perPerson * 100);
  const limit = Math.round(progi.threshold * 100);
  const ops = Math.round(progi.opsAmount * 100);
  const status: Classification = pp > limit ? "aboveThreshold" : pp <= ops ? "belowOps" : "withinThreshold";
  return { perPerson: pp / 100, status, distance: Math.abs(limit - pp) / 100 };
}

/**
 * Koniec skali miernika: półtora progu, zaokrąglone w górę do pełnej setki.
 * Daje miejsce na przekroczenie i trzyma próg mniej więcej w 2/3 długości.
 */
export function meterMax(progi: ProgiSocjalne = PROGI_SOCJALNE): number {
  return Math.ceil((progi.threshold * 1.5) / 100) * 100;
}

/** Pozycja na skali 0..1, przycięta do zakresu. */
export function meterFraction(value: number, max: number): number {
  if (!Number.isFinite(value) || max <= 0) return 0;
  return Math.min(Math.max(value / max, 0), 1);
}

/**
 * Kwota w PLN. `useGrouping: "always"` daje „1 908,90 zł” jak w regulaminie
 * (domyślnie pl-PL nie grupuje liczb czterocyfrowych). Starsze przeglądarki
 * potraktują to jak `true` i pokażą „1908,90 zł”, co też jest poprawne.
 */
export function formatPln(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : locale, {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  }).format(value);
}

/** Liczba do pola edycji (bez waluty), np. przy przełączeniu rok ↔ miesiąc. */
export function formatAmountInput(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(roundGrosze(value));
}
