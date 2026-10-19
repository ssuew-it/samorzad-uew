/**
 * Korpus dla asystenta AI ("Zapytaj Samorząd"): jeden dokument (Anthropic
 * document block, z cytowaniami) na każdą zmapowaną przestrzeń nazw i18n.
 *
 * Ponownie wykorzystuje tabelę namespace → trasa z `src/lib/knowledge.ts`
 * (ten sam plik zasila wyszukiwarkę treści) - nie duplikuje jej tutaj.
 * Kolejność jest deterministyczna (alfabetycznie po kluczu namespace), żeby
 * cache promptu (prefix po stronie Anthropic) był stabilny między requestami.
 */
import { NAMESPACE_ROUTES } from "./knowledge";

/** Klucze techniczne - nie są treścią dla czytelnika. Zgodne z knowledge.ts. */
const SKIP_KEY = /^(meta|og|aria|crumb|hub|nav|label|submit|err|placeholder)/i;

export interface CorpusDoc {
  type: "document";
  source: { type: "text"; media_type: "text/plain"; data: string };
  title: string;
  context: string;
  citations: { enabled: true };
}

/** Spłaszcza drzewo tłumaczeń danego namespace do czytelnego tekstu. */
function flatten(node: unknown, key: string, lines: string[]): void {
  if (typeof node === "string") {
    if (node.trim().length > 0 && !SKIP_KEY.test(key)) {
      lines.push(node);
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => flatten(item, key, lines));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      flatten(v, k, lines);
    }
  }
}

/**
 * Buduje tablicę dokumentów z pełnych tłumaczeń (messages/{locale}.json).
 * Czysta funkcja - bez efektów ubocznych, łatwa do testowania.
 */
export function buildCorpus(messages: unknown): CorpusDoc[] {
  const docs: CorpusDoc[] = [];
  if (!messages || typeof messages !== "object") return docs;

  const namespaces = Object.keys(messages as Record<string, unknown>)
    .filter((ns) => ns in NAMESPACE_ROUTES)
    .sort();

  for (const namespace of namespaces) {
    const route = NAMESPACE_ROUTES[namespace];
    const value = (messages as Record<string, unknown>)[namespace];
    const lines: string[] = [];
    flatten(value, "", lines);
    if (lines.length === 0) continue;

    docs.push({
      type: "document",
      source: { type: "text", media_type: "text/plain", data: lines.join("\n") },
      title: route.label,
      context: route.href,
      citations: { enabled: true },
    });
  }

  return docs;
}
