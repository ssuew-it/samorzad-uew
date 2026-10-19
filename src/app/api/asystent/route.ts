import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ASSISTANT_SYSTEM_PROMPT, isAssistantConfigured } from "@/lib/assistant-config";
import { buildCorpus, type CorpusDoc } from "@/lib/corpus";

/**
 * "Zapytaj Samorząd" - asystent AI odpowiadający wyłącznie na podstawie treści
 * strony (corpus dokumentów z cytowaniami, patrz `src/lib/corpus.ts`). Cały
 * korpus (~15.6k tokenów) mieści się w kontekście modelu, więc nie ma tu bazy
 * wektorowej ani kroku retrieval - dokumenty idą w całości, z prompt cachingiem.
 *
 * Odpowiedź strumieniowana do przeglądarki jako NDJSON (jeden obiekt JSON na
 * linię), żeby UI mogło renderować tekst i cytowania w miarę napływania.
 */

export const runtime = "nodejs";

const MODEL = "claude-opus-5";
const MAX_TOKENS = 4096;
const MAX_QUESTION_LENGTH = 500;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_LIMIT_MAX_REQUESTS = 10;

/**
 * Prosty rate limit per IP, w pamięci procesu (Map).
 *
 * UCZCIWA UWAGA: na Vercel (serverless) każda instancja funkcji ma WŁASNĄ
 * pamięć - ta mapa nie jest współdzielona między instancjami ani nie
 * przetrwa zimnego startu. To jest zabezpieczenie best-effort (ogranicza
 * pojedynczą "gorącą" instancję), a NIE prawdziwa ochrona przed nadużyciem
 * - pod większym ruchem limit efektywnie się mnoży razy liczba instancji.
 * Prawdziwy rate limiting wymagałby trwałego, współdzielonego magazynu
 * (np. Vercel KV / Upstash Redis).
 */
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  bucket.count += 1;
  return false;
}

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

type AssistantEvent =
  | { type: "text"; text: string }
  | { type: "citation"; cited_text: string; title: string | null; context: string | null }
  | { type: "done" }
  | { type: "refusal" }
  | { type: "error"; code: string };

/** Dokumenty korpusu w formacie oczekiwanym przez Messages API, z cache_control na ostatnim. */
function toDocumentBlocks(corpus: CorpusDoc[]): Anthropic.Messages.DocumentBlockParam[] {
  return corpus.map((doc, i) => {
    const block: Anthropic.Messages.DocumentBlockParam = {
      type: "document",
      source: doc.source,
      title: doc.title,
      context: doc.context,
      citations: doc.citations,
    };
    if (i === corpus.length - 1) {
      block.cache_control = { type: "ephemeral" };
    }
    return block;
  });
}

/** Klasyfikacja błędu SDK na krótki kod dla klienta - bez dopasowywania treści komunikatu. */
function errorCode(err: unknown): string {
  if (err instanceof Anthropic.RateLimitError) return "rate_limited";
  if (err instanceof Anthropic.AuthenticationError) return "auth_error";
  if (err instanceof Anthropic.APIConnectionError) return "connection_error";
  if (err instanceof Anthropic.APIError) return "api_error";
  return "unknown_error";
}

export async function POST(req: NextRequest) {
  if (!isAssistantConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  if (isRateLimited(clientKey(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { question, locale } = (body ?? {}) as Record<string, unknown>;

  if (typeof question !== "string" || question.trim().length === 0 || question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json({ error: "invalid_question" }, { status: 400 });
  }
  if (locale !== "pl" && locale !== "en") {
    return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
  }

  const messagesModule = (await import(`../../../../messages/${locale}.json`)) as { default: unknown };
  const corpus = buildCorpus(messagesModule.default);
  const documents = toDocumentBlocks(corpus);

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AssistantEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          thinking: { type: "adaptive" },
          output_config: { effort: "low" },
          system: ASSISTANT_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [...documents, { type: "text", text: question }],
            },
          ],
        });

        // Tekst strumieniowany na żywo; cytowania czytamy dopiero z finalMessage()
        // (bloki `citations` są kompletne dopiero po zakończeniu bloku treści -
        // czytanie ich w locie z bieżącymi zdarzeniami stream jest niepotrzebnie
        // skomplikowane dla tego przypadku, więc idziemy prostszą, dozwoloną drogą).
        stream.on("text", (delta) => {
          send({ type: "text", text: delta });
        });

        const finalMessage = await stream.finalMessage();

        // Sprawdź stop_reason PRZED czytaniem content - przy odmowie content może być puste.
        if (finalMessage.stop_reason === "refusal") {
          send({ type: "refusal" });
          return;
        }

        for (const block of finalMessage.content) {
          if (block.type !== "text" || !block.citations) continue;
          for (const citation of block.citations) {
            if (!("document_index" in citation)) continue; // np. web_search_result_location - u nas się nie zdarza
            const doc = corpus[citation.document_index];
            send({
              type: "citation",
              cited_text: citation.cited_text,
              title: citation.document_title ?? doc?.title ?? null,
              context: doc?.context ?? null,
            });
          }
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", code: errorCode(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
