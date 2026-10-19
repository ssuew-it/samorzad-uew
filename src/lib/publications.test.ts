import { describe, expect, it } from "vitest";
import { formatChapterCitation, formatCitation, publications, type Publication } from "./publications";

describe("formatCitation", () => {
  it("formats a single-author publication without ISBN", () => {
    const p: Publication = {
      title: "Tytuł artykułu",
      authors: ["Kowalski, J."],
      year: 2024,
    };
    expect(formatCitation(p)).toBe(
      "Kowalski, J. (2024). Tytuł artykułu. Debiuty Studenckie. Wydawnictwo Uniwersytetu Ekonomicznego we Wrocławiu.",
    );
  });

  it("formats a multi-author publication without ISBN", () => {
    const p: Publication = {
      title: "Tytuł artykułu",
      authors: ["Kowalski, J.", "Nowak, A."],
      year: 2024,
    };
    expect(formatCitation(p)).toBe(
      "Kowalski, J., Nowak, A. (2024). Tytuł artykułu. Debiuty Studenckie. Wydawnictwo Uniwersytetu Ekonomicznego we Wrocławiu.",
    );
  });

  it("appends ISBN when present", () => {
    const p: Publication = {
      title: "Tytuł artykułu",
      authors: ["Kowalski, J."],
      year: 2024,
      isbn: "978-83-1234-567-8",
    };
    expect(formatCitation(p)).toBe(
      "Kowalski, J. (2024). Tytuł artykułu. Debiuty Studenckie. Wydawnictwo Uniwersytetu Ekonomicznego we Wrocławiu. ISBN 978-83-1234-567-8.",
    );
  });

  it("formats a three-author publication with ISBN", () => {
    const p: Publication = {
      title: "Inny tytuł",
      authors: ["Zielińska, M.", "Dąbrowski, P.", "Lewandowski, T."],
      year: 2023,
      isbn: "978-83-0000-000-0",
    };
    expect(formatCitation(p)).toBe(
      "Zielińska, M., Dąbrowski, P., Lewandowski, T. (2023). Inny tytuł. Debiuty Studenckie. Wydawnictwo Uniwersytetu Ekonomicznego we Wrocławiu. ISBN 978-83-0000-000-0.",
    );
  });
});

describe("formatChapterCitation", () => {
  it("cytuje rozdział w tomie zbiorowym z zakresem stron", () => {
    const p: Publication = {
      title: "The Role of Branding in the Success of Startups - Case of Airbnb",
      authors: ["Dorosh, D."],
      year: 2026,
      pages: { from: 5, to: 16 },
      doi: "10.15611/2026.35.7.01",
      edition: "new-trends-2026",
    };
    expect(formatChapterCitation(p)).toBe(
      "Dorosh, D. (2026). The Role of Branding in the Success of Startups - Case of Airbnb. " +
        "W: J. Radomska, A. Witek-Crabb (red.), New Trends in Business Management. " +
        "Culture, Strategy, Engagement (s. 5-16). Wydawnictwo Uniwersytetu Ekonomicznego " +
        "we Wrocławiu. DOI: 10.15611/2026.35.7.01",
    );
  });
});

describe("dane publikacji", () => {
  it("nie zawiera placeholderów", () => {
    const joined = JSON.stringify(publications);
    expect(joined).not.toContain("XXXX");
    expect(joined).not.toContain("PLACEHOLDER");
  });

  it("każdy rozdział ma autorów, rok i zakres stron", () => {
    expect(publications.length).toBeGreaterThan(0);
    for (const p of publications) {
      expect(p.authors.length).toBeGreaterThan(0);
      expect(p.year).toBeGreaterThan(2000);
      expect(p.pages?.from).toBeGreaterThan(0);
      expect(p.pages!.to).toBeGreaterThanOrEqual(p.pages!.from);
    }
  });
});
