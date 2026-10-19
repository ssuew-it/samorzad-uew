/**
 * Rekrutacje do Samorządu.
 *
 * PUSTA lista `recruitments` = strona /rekrutacja pokazuje stan „brak otwartej
 * rekrutacji" + ogólny kontakt. Dodaj wpis, by pokazać otwarty nabór z linkiem
 * do formularza. `recruitmentDrive` (opcjonalnie) = wspólny folder z materiałami.
 */
export interface Recruitment {
  /** Nazwa naboru, np. „Komisja ds. Kultury" - treść (PL). */
  title: string;
  desc?: string;
  /** Termin zgłoszeń, RRRR-MM-DD (opcjonalnie). */
  deadline?: string;
  /** Link do formularza zgłoszeniowego. */
  formUrl: string;
}

export const recruitments: Recruitment[] = [];

// Wspólny folder Drive z materiałami rekrutacyjnymi (opcjonalnie).
export const recruitmentDrive = "";

// Ogólny formularz „zostaw zgłoszenie", gdy brak otwartych naborów (opcjonalnie).
export const recruitmentGeneralForm = "";
