export interface LivingDocumentSource {
  title: string;
  publisher: string;
  effectiveFor: string;
  landingPage: string;
  pdf: string;
  checkedAt: string;
}

export const studyRegulationSource: LivingDocumentSource = {
  title: "Uczelniany Regulamin Studiów Uniwersytetu Ekonomicznego we Wrocławiu",
  publisher: "Biuletyn Informacji Publicznej UEW",
  effectiveFor: "rok akademicki 2025/2026",
  landingPage:
    "https://bip.ue.wroc.pl/233/268/uczelniany-regulamin-studiow-uniwersytetu-ekonomicznego-we-wroclawiu.html",
  pdf: "https://bip.ue.wroc.pl/download/attachment/3457/uczelniany-regulaminu-studiow-od-roku-akademickiego-2025_2026.pdf",
  checkedAt: "2026-08-13",
};

export const studyRegulationInfopack =
  "https://drive.google.com/file/d/1QcyoxoV15SJGrvKKONtn0JGFutQ5gRZ1/view?usp=sharing";

export const applicationsInfopack =
  "https://drive.google.com/file/d/1X5muhuWdgbxlOK1cgLz4fczzaKJwSFAC/view?usp=sharing";

export const usosInfopack =
  "https://drive.google.com/file/d/1EmTBHP5GzLrHBA782SBg82rnelb4PD7i/view?usp=sharing";

export const semesterInfopack =
  "https://drive.google.com/file/d/1R1mXDt8745vC98J_FBJ5UoKjwMbw4NYA/view?usp=sharing";

export const semesterSources = {
  fees: "https://bip.ue.wroc.pl/568/610/2026.html",
  usos: "https://usosweb.ue.wroc.pl/kontroler.php?_action=news/default",
} as const;

export const deanInfopack =
  "https://drive.google.com/file/d/1NLQRVebkTqXDCxcsmY7tSwc7JHApDyw9/view?usp=sharing";

export const deanOfficeSources = {
  current:
    "https://uew.pl/studenci/dziekanat/",
  staff:
    "https://uew.pl/studenci/dziekanat/pracownicy-dziekanatu/",
} as const;

export const libraryInfopack =
  "https://drive.google.com/file/d/1R_yZHW5UIIzWerNAlpYp5FOw8p6DHC9N/view?usp=sharing";

export const librarySources = {
  home: "https://bg.uew.pl/",
  catalogue: "https://katalog.ue.wroc.pl/catalog",
  registration: "https://katalog.ue.wroc.pl/registration",
  enrollment: "https://bg.uew.pl/uslugi/zapisy-do-biblioteki/",
  proxy: "https://bg.uew.pl/zbiory/zasoby/zdalny-dostep-proxy/",
  eResources: "https://bg.uew.pl/e-zasoby/",
  cabins: "https://bg.uew.pl/uslugi/rezerwacja-kabin/",
  bibliography: "https://bg.uew.pl/uslugi/zapytaj-o-zestawienie-bibliograficzne/",
  faq: "https://bg.uew.pl/zbiory/faq/",
} as const;

export const studentLifeInfopack =
  "https://drive.google.com/file/d/1GoMBj_CEFF6ri83ZbED4OocGOKzv8Uot/view?usp=sharing";

export const studentLifeSources = {
  organisations: "https://uew.pl/studenci/organizacje-studenckie-i-kola-naukowe/",
  sport: "https://sport.uew.pl/sekcje-sportowe/",
  choir: "https://www.arscantandi.wroclaw.pl/",
  mobility: "https://international.uew.pl/pl/",
  usosExchange: "https://usosweb.ue.wroc.pl/kontroler.php?_action=news/default",
  dtHub: "https://dthub.uew.pl/",
  kafe: "https://dthub.uew.pl/rekrutacja-do-programu-kafe/",
  career: "https://cwb.uew.pl/strona-glowna/oferta-dla-studentow-uew/",
  jobTeaser: "https://uewroc.jobteaser.com/",
} as const;

export const diplomaInfopack =
  "https://drive.google.com/file/d/1QPCho3YZIPYvn3Nv9rmZBKd0GkC5Byhs/view?usp=sharing";

export const diplomaSources = {
  studyRegulations:
    "https://bip.ue.wroc.pl/233/268/uczelniany-regulamin-studiow-uniwersytetu-ekonomicznego-we-wroclawiu.html",
  qualitySystem:
    "https://uew.pl/wp-content/uploads/2026/02/Zalacznik-do-ZR-4-2026-WSZJK-UEW.pdf",
  process:
    "https://uew.pl/wp-content/uploads/2025/01/Zalacznik-nr-7_Organizacja-procesu-dyplomowania-2024.pdf",
  jsa:
    "https://bip.ue.wroc.pl/download/attachment/3487/zalacznik-nr-1-do-zr-146-2025_regulamin-weryfikacji.pdf",
  // Instrukcja APD została przeniesiona z apd.ue.wroc.pl/static/… (dziś 404)
  // do katalogu plików USOS. Nowe adresy wzięte z samej strony APD, 14.10.2026.
  apdGuide: "https://usosweb.ue.wroc.pl/pliki_pdf/instrukcje_apd/apd_instrukcja_dla_studenta_v2.pdf",
  apdGuideEn: "https://usosweb.ue.wroc.pl/pliki_pdf/instrukcje_apd/apd_instrukcja_dla_studenta_en.pdf",
  deanOffice: "https://uew.pl/studenci/dziekanat/",
} as const;

export const usosSources = {
  system: "https://usosweb.ue.wroc.pl/kontroler.php?_action=news/default",
  officialGuide:
    "https://international.uew.pl/wp-content/uploads/sites/62/2025/09/UEW-Welcome-guide-for-international-students-2025.pdf",
  exchangeGuide:
    "https://international.uew.pl/wp-content/uploads/sites/62/2023/11/instrukcja_dla_studentow_modulu_wymiany_studenckiej_w_usosweb.pdf",
} as const;

/**
 * The Infopack also cites a Prorector's circular dated 3 June 2025 on
 * individual student matters. No matching public BIP URL was found during the
 * 13 August 2026 verification, so the site names it without inventing a link.
 */
export const applicationsCircularReference = {
  title: "Pismo okólne nr 6/2025 w sprawie indywidualnych spraw studenckich",
  date: "2025-06-03",
  publicUrl: null,
} as const;

export function studyRegulationPage(page: number) {
  return `${studyRegulationSource.pdf}#page=${page}`;
}
