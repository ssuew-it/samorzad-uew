/**
 * Wsparcie psychologiczne na UEW — dwa miejsca, w których student może
 * dostać bezpłatną konsultację.
 *
 * Źródła (stan na 17 października 2026):
 * - BON: https://bon.uew.pl/wsparcie-psychologiczne/ (strona jednostki)
 * - Biuro Karier: infopack Samorządu „Pomoc psychologiczna” (2026) — strona
 *   Biura Karier jest na SharePoincie uczelni i wymaga logowania kontem UEW.
 *
 * Teksty opisów są w `messages/*.json` pod `pomoc.uew.<key>`; tutaj tylko
 * twarde dane kontaktowe, żeby łatwo je zaktualizować w jednym miejscu.
 */
export interface UewSupportPlace {
  key: "bon" | "biuroKarier";
  /** Formularz zgłoszenia (Microsoft Forms). */
  formUrl: string;
  /** Strona jednostki. */
  pageUrl: string;
  /** Czy strona wymaga logowania kontem uczelnianym. */
  pageNeedsLogin: boolean;
  email?: string;
  phone?: { label: string; tel: string };
}

export const UEW_SUPPORT: UewSupportPlace[] = [
  {
    key: "bon",
    formUrl: "https://forms.office.com/e/pgqkcdGMRk",
    pageUrl: "https://bon.uew.pl/wsparcie-psychologiczne/",
    pageNeedsLogin: false,
    email: "on@ue.wroc.pl",
    phone: { label: "71 36 80 755", tel: "+48713680755" },
  },
  {
    key: "biuroKarier",
    formUrl:
      "https://forms.office.com/pages/responsepage.aspx?id=MwzJV98HcECWcs0qjJM1q51uiBhpeztEpjSEQ77ow8JUMVQwMU40RTFGV0dUUEtPRklXUVFXNExGWC4u",
    pageUrl: "https://uewrc.sharepoint.com/sites/BiuroKarier-CWB/SitePages/Wsparcie%20psychologiczne.aspx",
    pageNeedsLogin: true,
  },
];
