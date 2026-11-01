/**
 * Pełne nazwy kierunków dla kodów z planu zajęć UEW.
 *
 * Plan używa wyłącznie skrótów. Wpisane są tylko nazwy pewne; brakujący kod
 * pokazuje się w formularzu jako sam skrót. Dopisz nazwę, gdy ją potwierdzisz.
 * Do potwierdzenia (1.11.2026): EB, EO, IZ, RP, ZR, CO, KPG, ZIIPL.
 */
export const PROGRAM_NAMES: Record<string, { pl: string; en: string }> = {
  AG: { pl: "Analityka gospodarcza", en: "Business Analytics" },
  EK: { pl: "Ekonomia", en: "Economics" },
  FIR: { pl: "Finanse i rachunkowość", en: "Finance and Accounting" },
  IWB: { pl: "Informatyka w biznesie", en: "Business Informatics" },
  KS: { pl: "Komunikacja społeczna", en: "Social Communication" },
  LG: { pl: "Logistyka", en: "Logistics" },
  MSG: { pl: "Międzynarodowe stosunki gospodarcze", en: "International Economic Relations" },
  NG: { pl: "Nieruchomości i gospodarka przestrzenna", en: "Real Estate and Spatial Economy" },
  ZA: { pl: "Zarządzanie", en: "Management" },
  ZIIP: { pl: "Zarządzanie i inżynieria produkcji", en: "Management and Production Engineering" },
};
