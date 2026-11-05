import { describe, expect, it } from "vitest";
import { corpusToNumberedText, extractFacts, validateGroundedAnswer } from "./assistant-grounding";
import type { CorpusDoc } from "./corpus";

const doc = (title: string, context: string, data: string): CorpusDoc => ({
  type: "document",
  source: { type: "text", media_type: "text/plain", data },
  title,
  context,
  citations: { enabled: true },
});

const corpus = [
  doc("Stypendia", "/stypendia", "Wniosek o stypendium socjalne składasz w USOS do 15 października.\nKwota zależy od dochodu na osobę w rodzinie."),
  doc("Kontakt", "/kontakt", "Napisz do nas: samorzad@ue.wroc.pl. Biuro jest w budynku A, pokój 101."),
];

describe("assistant-grounding", () => {
  it("numeruje dokumenty od D1 z tytułem i adresem", () => {
    const text = corpusToNumberedText(corpus);
    expect(text.startsWith("[D1] Stypendia (/stypendia)\n")).toBe(true);
    expect(text).toContain("[D2] Kontakt (/kontakt)");
  });

  it("przepuszcza odpowiedź z dosłownym cytatem i faktami ze źródła", () => {
    const r = validateGroundedAnswer(
      { status: "answer", answer: "Wniosek składasz w USOS do 15 października.", quotes: [{ doc: 1, text: "Wniosek o stypendium socjalne składasz w USOS do 15 października." }] },
      corpus,
    );
    expect(r).toEqual({
      kind: "answer",
      text: "Wniosek składasz w USOS do 15 października.",
      citations: [{ cited_text: "Wniosek o stypendium socjalne składasz w USOS do 15 października.", title: "Stypendia", context: "/stypendia" }],
    });
  });

  it("toleruje inne cudzysłowy, spacje i wielkość liter w cytacie", () => {
    const r = validateGroundedAnswer(
      { status: "answer", answer: "Kwota zależy od dochodu.", quotes: [{ doc: 1, text: "kwota  zależy od dochodu na osobę" }] },
      corpus,
    );
    expect(r.kind).toBe("answer");
  });

  it("odrzuca zmyślony cytat - zostaje „nie wiem”", () => {
    const r = validateGroundedAnswer(
      { status: "answer", answer: "Stypendium wynosi zawsze tyle samo.", quotes: [{ doc: 1, text: "Stypendium socjalne wynosi zawsze tyle samo." }] },
      corpus,
    );
    expect(r).toEqual({ kind: "unknown" });
  });

  it("odrzuca cytat przypisany do złego dokumentu", () => {
    const r = validateGroundedAnswer(
      { status: "answer", answer: "Napisz na adres Samorządu.", quotes: [{ doc: 1, text: "Napisz do nas: samorzad@ue.wroc.pl." }] },
      corpus,
    );
    expect(r.kind).toBe("unknown");
  });

  it("odrzuca odpowiedź z datą, której nie ma w źródłach", () => {
    const r = validateGroundedAnswer(
      { status: "answer", answer: "Wniosek składasz do 31 października.", quotes: [{ doc: 1, text: "Wniosek o stypendium socjalne składasz w USOS" }] },
      corpus,
    );
    expect(r.kind).toBe("unknown");
  });

  it("odrzuca adres e-mail spoza źródeł", () => {
    const r = validateGroundedAnswer(
      { status: "answer", answer: "Napisz na stypendia@ue.wroc.pl.", quotes: [{ doc: 2, text: "Napisz do nas: samorzad@ue.wroc.pl." }] },
      corpus,
    );
    expect(r.kind).toBe("unknown");
  });

  it("numery punktów listy nie są faktami", () => {
    expect(extractFacts("1. Zaloguj się do USOS.\n2. Złóż wniosek do 15 października.")).toEqual(["15"]);
  });

  it("bez cytatów, z pustą odpowiedzią albo zepsutym JSON-em nie ma odpowiedzi", () => {
    expect(validateGroundedAnswer({ status: "answer", answer: "Tak.", quotes: [] }, corpus).kind).toBe("unknown");
    expect(validateGroundedAnswer({ status: "answer", answer: "", quotes: [{ doc: 1, text: "Kwota zależy od dochodu" }] }, corpus).kind).toBe("unknown");
    expect(validateGroundedAnswer(null, corpus).kind).toBe("unknown");
    expect(validateGroundedAnswer({ status: "unknown", answer: "", quotes: [] }, corpus).kind).toBe("unknown");
  });

  it("za krótki cytat nie wystarcza", () => {
    const r = validateGroundedAnswer({ status: "answer", answer: "Tak, w USOS.", quotes: [{ doc: 1, text: "w USOS" }] }, corpus);
    expect(r.kind).toBe("unknown");
  });

  it("pytanie spoza tematu to osobny wynik", () => {
    expect(validateGroundedAnswer({ status: "off_topic", answer: "", quotes: [] }, corpus).kind).toBe("off_topic");
  });
});
