/**
 * „Klatka wiedzy” asystenta dla modeli bez natywnych cytowań (Gemini).
 *
 * Claude dostaje dokumenty z włączonymi cytowaniami i sam wskazuje fragmenty
 * źródeł. Gemini takiej funkcji nie ma, więc model zwraca JSON: odpowiedź plus
 * DOSŁOWNE cytaty z ponumerowanych dokumentów - a serwer sprawdza je tutaj,
 * zanim cokolwiek trafi do przeglądarki. Model, który zmyśla, nie przejdzie:
 *
 * 1. Każdy cytat musi występować w treści wskazanego dokumentu (po ujednoliceniu
 *    spacji, cudzysłowów i wielkości liter). Cytaty zmyślone wypadają.
 * 2. Bez choćby jednego prawdziwego cytatu nie ma odpowiedzi - jest „nie wiem”.
 * 3. Każda liczba, data, adres e-mail i link z odpowiedzi musi występować
 *    w zacytowanych dokumentach. Przepisy, terminy i kwoty spoza serwisu to
 *    dokładnie te błędy, które w sprawach studenckich szkodzą najbardziej.
 *
 * Czyste funkcje bez sieci - testy w assistant-grounding.test.ts.
 */
import type { CorpusDoc } from "./corpus";

/** Odpowiedź modelu w formacie wymuszonym schematem (GROUNDED_ANSWER_SCHEMA). */
export interface GroundedAnswerRaw {
  status: "answer" | "unknown" | "off_topic";
  answer: string;
  quotes: { doc: number; text: string }[];
}

export type GroundedResult =
  | { kind: "answer"; text: string; citations: { cited_text: string; title: string; context: string }[] }
  | { kind: "unknown" }
  | { kind: "off_topic" };

/** Najkrótszy cytat, który coś znaczy - krótsze („tak”, „UEW”) pasowałyby wszędzie. */
const MIN_QUOTE_LENGTH = 12;

/** JSON Schema odpowiedzi - Gemini (responseJsonSchema) nie zwróci nic innego. */
export const GROUNDED_ANSWER_SCHEMA = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["answer", "unknown", "off_topic"],
      description:
        "answer = odpowiedź jest w dokumentach; unknown = dokumenty jej nie zawierają; off_topic = pytanie nie dotyczy Samorządu Studentów ani studiowania na Uczelni",
    },
    answer: { type: "string", description: "Odpowiedź dla studenta, tylko z dokumentów. Pusta przy unknown i off_topic." },
    quotes: {
      type: "array",
      description: "Dosłowne fragmenty dokumentów, na których opiera się odpowiedź.",
      items: {
        type: "object",
        properties: {
          doc: { type: "integer", description: "Numer dokumentu z nagłówka [D<numer>]." },
          text: { type: "string", description: "Fragment skopiowany z dokumentu słowo w słowo." },
        },
        required: ["doc", "text"],
      },
    },
  },
  required: ["status", "answer", "quotes"],
} as const;

/** Dokumenty jako jeden blok tekstu z numerami [D1]…[Dn] (kolejność = kolejność korpusu). */
export function corpusToNumberedText(corpus: CorpusDoc[]): string {
  return corpus
    .map((doc, i) => `[D${i + 1}] ${doc.title} (${doc.context})\n${doc.source.data}`)
    .join("\n\n");
}

/** Ujednolicenie do porównań: spacje, cudzysłowy, myślniki, wielkość liter, markdown. */
export function normalize(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[„”“"«»‘’‚']/g, "'")
    .replace(/[‐-―−]/g, "-")
    .replace(/\*\*|__/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Konkretne fakty z odpowiedzi: liczby (także daty i kwoty w każdym zapisie),
 * adresy e-mail i linki. Zwraca je w postaci znormalizowanej.
 */
export function extractFacts(answer: string): string[] {
  // Numery punktów listy („1. Złóż wniosek”) to układ odpowiedzi, nie fakt.
  const text = normalize(answer.replace(/^\s*\d+[.)]\s+/gm, ""));
  const facts = new Set<string>();
  for (const m of text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) facts.add(m[0]);
  for (const m of text.matchAll(/https?:\/\/[^\s)]+|www\.[^\s)]+/g)) facts.add(m[0].replace(/[.,;:]+$/, ""));
  // Liczby po usunięciu adresów (żeby cyfry z e-maila nie liczyły się drugi raz).
  const rest = text.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+|https?:\/\/[^\s)]+|www\.[^\s)]+/g, " ");
  for (const m of rest.matchAll(/\d+(?:[ .,:/-]\d+)*/g)) facts.add(m[0]);
  return [...facts];
}

/** Czy fakt występuje w tekście źródła. Liczby porównujemy bez separatorów (1 000 = 1000). */
function factInSource(fact: string, source: string): boolean {
  if (source.includes(fact)) return true;
  if (/^[\d .,:/-]+$/.test(fact)) {
    const digits = (s: string) => s.replace(/(\d)[ .](?=\d{3}\b)/g, "$1");
    return digits(source).includes(digits(fact));
  }
  return false;
}

/** Sprawdza odpowiedź modelu względem korpusu. Wszystko, co nie przejdzie, kończy się „nie wiem”. */
export function validateGroundedAnswer(raw: unknown, corpus: CorpusDoc[]): GroundedResult {
  if (!raw || typeof raw !== "object") return { kind: "unknown" };
  const { status, answer, quotes } = raw as Partial<GroundedAnswerRaw>;
  if (status === "off_topic") return { kind: "off_topic" };
  if (status !== "answer" || typeof answer !== "string" || !answer.trim() || !Array.isArray(quotes)) {
    return { kind: "unknown" };
  }

  const sources = corpus.map((doc) => normalize(doc.source.data));
  const citations: { cited_text: string; title: string; context: string }[] = [];
  const citedDocs = new Set<number>();
  for (const q of quotes) {
    if (!q || typeof q.text !== "string" || typeof q.doc !== "number") continue;
    const index = q.doc - 1;
    const doc = corpus[index];
    const quote = normalize(q.text);
    if (!doc || quote.length < MIN_QUOTE_LENGTH || !sources[index]!.includes(quote)) continue;
    if (citations.some((c) => normalize(c.cited_text) === quote)) continue;
    citedDocs.add(index);
    citations.push({ cited_text: q.text.trim(), title: doc.title, context: doc.context });
  }
  if (citations.length === 0) return { kind: "unknown" };

  const cited = [...citedDocs].map((i) => sources[i]!).join("\n");
  if (!extractFacts(answer).every((fact) => factInSource(fact, cited))) return { kind: "unknown" };

  return { kind: "answer", text: answer.trim(), citations };
}
