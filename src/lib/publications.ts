/**
 * Rozdziały serii „Debiuty Studenckie".
 *
 * Do 2026-08-31 były tu TRZY PLACEHOLDERY z wymyślonymi nazwiskami („Kowalski,
 * J.", „Nowak, A.") i fikcyjnymi numerami ISBN. Na oficjalnym serwisie uczelni
 * był to zmyślony dorobek - dane poniżej pochodzą z prawdziwego tomu
 * dostarczonego przez Wydawnictwo UEW.
 *
 * Metadane samego wydania (redaktorki, ISBN tomu, licencja) są w `editions.ts`.
 */
export interface Publication {
  title: string;
  authors: string[];
  year: number;
  /** Koło naukowe, w którym powstał tekst (jeśli dotyczy). */
  circle?: string;
  isbn?: string;
  url?: string;
  abstract?: string;
  /** DOI rozdziału - każdy rozdział tomu ma własny. */
  doi?: string;
  /** Zakres stron w tomie. */
  pages?: { from: number; to: number };
  /** Slug wydania z `editions.ts`. */
  edition?: string;
}

const E = "new-trends-2026";

export const publications: Publication[] = [
  {
    title: "The Role of Branding in the Success of Startups - Case of Airbnb",
    authors: ["Dorosh, D."],
    year: 2026,
    doi: "10.15611/2026.35.7.01",
    pages: { from: 5, to: 16 },
    edition: E,
  },
  {
    title: "Strategy Implementation Challenges: The Strategy-as-Practice Perspective",
    authors: ["Kulig, K."],
    year: 2026,
    doi: "10.15611/2026.35.7.02",
    pages: { from: 17, to: 28 },
    edition: E,
  },
  {
    title: "Gamification as an Element of Building Employee Engagement in the Onboarding Process",
    authors: ["Lasota, W."],
    year: 2026,
    doi: "10.15611/2026.35.7.03",
    pages: { from: 29, to: 40 },
    edition: E,
  },
  {
    title: "The Impact of Organisational Culture on Job Satisfaction",
    authors: ["Narajewska, M."],
    year: 2026,
    doi: "10.15611/2026.35.7.04",
    pages: { from: 41, to: 51 },
    edition: E,
  },
  {
    title: "Intergenerational Drivers of Consumption Behaviour: A Socio-Economic Analysis in Emerging Markets",
    authors: ["Nyatanga, L. T."],
    year: 2026,
    doi: "10.15611/2026.35.7.05",
    pages: { from: 52, to: 64 },
    edition: E,
  },
  {
    title:
      "Motivation and Engagement in a Student Non-Profit Organisation Based on Independent Students' Association (Niezależne Zrzeszenie Studentów)",
    authors: ["Sikora, K."],
    year: 2026,
    doi: "10.15611/2026.35.7.06",
    pages: { from: 65, to: 74 },
    edition: E,
  },
  {
    title: "Crafting a Successful Marketing Strategy in the Video Game Industry",
    authors: ["Sioła, W."],
    year: 2026,
    doi: "10.15611/2026.35.7.07",
    pages: { from: 75, to: 86 },
    edition: E,
  },
  {
    title: "Managing Cultural Differences in International Organisations",
    authors: ["Skalska, W."],
    year: 2026,
    doi: "10.15611/2026.35.7.08",
    pages: { from: 87, to: 102 },
    edition: E,
  },
  {
    title: "The Role of Agile Project Management in a Pandemic Business Environment",
    authors: ["Wilk, W."],
    year: 2026,
    doi: "10.15611/2026.35.7.09",
    pages: { from: 103, to: 115 },
    edition: E,
  },
  {
    title: "Modern ISO Audit in a Medium-Sized Automotive Enterprise",
    authors: ["Zapotoczny, M."],
    year: 2026,
    doi: "10.15611/2026.35.7.10",
    pages: { from: 116, to: 128 },
    edition: E,
  },
];

/**
 * Cytowanie w stylu zbliżonym do APA (wersja polska), zgodne z konwencją
 * serii: Autorzy (rok). Tytuł. Debiuty Studenckie. Wydawnictwo Uniwersytetu
 * Ekonomicznego we Wrocławiu. [ISBN …]
 */
export function formatCitation(p: Publication): string {
  const authors = p.authors.join(", ");
  const base = `${authors} (${p.year}). ${p.title}. Debiuty Studenckie. Wydawnictwo Uniwersytetu Ekonomicznego we Wrocławiu.`;
  return p.isbn ? `${base} ISBN ${p.isbn}.` : base;
}

/**
 * Cytowanie ROZDZIAŁU w tomie zbiorowym - inna forma niż cytowanie całości,
 * bo trzeba podać redaktorki i zakres stron. Tak cytuje się te teksty
 * w bibliografii i tego oczekują sami autorzy.
 */
export function formatChapterCitation(p: Publication): string {
  const authors = p.authors.join(", ");
  const pages = p.pages ? ` (s. ${p.pages.from}-${p.pages.to})` : "";
  const doi = p.doi ? ` DOI: ${p.doi}` : "";
  return (
    `${authors} (${p.year}). ${p.title}. ` +
    `W: J. Radomska, A. Witek-Crabb (red.), New Trends in Business Management. ` +
    `Culture, Strategy, Engagement${pages}. ` +
    `Wydawnictwo Uniwersytetu Ekonomicznego we Wrocławiu.${doi}`
  );
}
