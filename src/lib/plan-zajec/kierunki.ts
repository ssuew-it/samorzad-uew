/**
 * Pełne nazwy kierunków i trybów dla kodów z planu zajęć UEW.
 *
 * Plan używa wyłącznie skrótów. Nazwy kierunków pochodzą z oficjalnej listy
 * kierunków Uczelni w e-sylabusie (ue.e-sylabus.pl, 12.11.2026); skrót
 * przypisaliśmy do nazwy po przedmiotach w planie danego kierunku, np. EO ma
 * „Ekomarketing” i „Ekonomię środowiska” → Ekobiznes, ZR ma „Planowanie
 * projektów” → Zarządzanie projektami. Kod, którego tu nie ma, formularz
 * pokazuje jako sam skrót - dopisz nazwę, gdy ją potwierdzisz.
 *
 * Do potwierdzenia: ZIIPL (II stopień, wariant Zarządzania i inżynierii
 * produkcji - na liście kierunków nie ma osobnej nazwy).
 */
export const PROGRAM_NAMES: Record<string, { pl: string; en: string }> = {
  AG: { pl: "Analityka gospodarcza", en: "Business Analytics" },
  CO: { pl: "Controlling", en: "Controlling" },
  EB: { pl: "e-Biznes", en: "e-Business" },
  EK: { pl: "Ekonomia", en: "Economics" },
  EO: { pl: "Ekobiznes", en: "Eco-business" },
  FIR: { pl: "Finanse i rachunkowość", en: "Finance and Accounting" },
  IWB: { pl: "Informatyka w biznesie", en: "Business Informatics" },
  IZ: { pl: "Informatyka w zarządzaniu produkcją", en: "IT in Production Management" },
  KPG: { pl: "Konsulting prawny i gospodarczy", en: "Legal and Business Consulting" },
  KS: { pl: "Komunikacja społeczna", en: "Social Communication" },
  LG: { pl: "Logistyka", en: "Logistics" },
  MSG: { pl: "Międzynarodowe stosunki gospodarcze", en: "International Economic Relations" },
  NG: { pl: "Nieruchomości i gospodarka przestrzenna", en: "Real Estate and Spatial Economy" },
  RP: { pl: "Rachunkowość i podatki", en: "Accounting and Taxation" },
  ZA: { pl: "Zarządzanie", en: "Management" },
  ZIIP: { pl: "Zarządzanie i inżynieria produkcji", en: "Management and Production Engineering" },
  ZR: { pl: "Zarządzanie projektami", en: "Project Management" },
  // Studia anglojęzyczne - nazwy oficjalne, po angielsku w obu wersjach strony.
  BI: { pl: "Business Informatics", en: "Business Informatics" },
  BM: { pl: "Business Management", en: "Business Management" },
  F: { pl: "Finance", en: "Finance" },
  IN: { pl: "International Business", en: "International Business" },
  MC: { pl: "Management Accounting", en: "Management Accounting" },
  ERA: { pl: "Erasmus+ (studenci z wymiany)", en: "Erasmus+ (exchange students)" },
};

/** Tryby studiów: plan podaje polskie opisy tylko dla studiów polskich. */
export const MODE_NAMES: Record<string, { pl: string; en: string }> = {
  S1: { pl: "Stacjonarne I stopnia", en: "Full-time, first-cycle (Polish)" },
  S2: { pl: "Stacjonarne II stopnia", en: "Full-time, second-cycle (Polish)" },
  N1: { pl: "Niestacjonarne I stopnia", en: "Part-time, first-cycle (Polish)" },
  N2: { pl: "Niestacjonarne II stopnia", en: "Part-time, second-cycle (Polish)" },
  BachelorFT: { pl: "Anglojęzyczne I stopnia, stacjonarne", en: "Bachelor, full-time" },
  BachelorPT: { pl: "Anglojęzyczne I stopnia, niestacjonarne", en: "Bachelor, part-time" },
  MasterFT: { pl: "Anglojęzyczne II stopnia, stacjonarne", en: "Master, full-time" },
  MasterPT: { pl: "Anglojęzyczne II stopnia, niestacjonarne", en: "Master, part-time" },
  Erasmus: { pl: "Erasmus+", en: "Erasmus+" },
};
