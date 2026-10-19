/**
 * Klient strumienia asystenta - JEDNO miejsce, w którym czytamy NDJSON
 * z `POST /api/asystent`.
 *
 * Wydzielone z palety ⌘K, bo asystent ma teraz dwa wejścia (paleta i strona
 * `/asystent`). Duplikat tej pętli oznaczałby dwie osobne szanse na zgubienie
 * niedokończonej linii albo na potraktowanie anulowania jako błędu.
 */

/** Kształt zdarzeń wysyłanych przez trasę serwerową. */
export type AssistantStreamEvent =
  | { type: "text"; text: string }
  | { type: "citation"; cited_text: string; title: string | null; context: string | null }
  | { type: "done" }
  | { type: "refusal" }
  | { type: "error"; code: string };

export interface AssistantCitation {
  title: string | null;
  citedText: string;
  context: string | null;
}

export type AssistantStatus =
  | "idle"
  | "streaming"
  | "done"
  | "refusal"
  | "error"
  | "not_configured";

/**
 * Dokłada cytowanie do listy, pomijając powtórzenia tego samego źródła.
 * Wyodrębnione, żeby dało się to przetestować bez przeglądarki.
 */
export function addCitation(
  list: AssistantCitation[],
  event: Extract<AssistantStreamEvent, { type: "citation" }>,
): AssistantCitation[] {
  const keyOf = (c: AssistantCitation) => c.context ?? c.title ?? c.citedText;
  const incoming: AssistantCitation = {
    title: event.title,
    citedText: event.cited_text,
    context: event.context,
  };
  if (list.some((c) => keyOf(c) === keyOf(incoming))) return list;
  return [...list, incoming];
}

/**
 * Dzieli napływający tekst na kompletne linie NDJSON.
 * Zwraca sparsowane zdarzenia oraz *resztę* - niedokończoną linię, która musi
 * poczekać na kolejną porcję danych. Parsowanie uciętej linii to najczęstszy
 * błąd przy strumieniach, więc trzymamy tę logikę osobno i pod testem.
 */
export function parseLines(buffer: string): {
  events: AssistantStreamEvent[];
  rest: string;
} {
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  const events: AssistantStreamEvent[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line) as AssistantStreamEvent);
    } catch {
      // Uszkodzona linia - pomijamy ją zamiast przerywać całą odpowiedź.
    }
  }
  return { events, rest };
}

interface RunAssistantOptions {
  question: string;
  locale: string;
  signal: AbortSignal;
  onEvent: (event: AssistantStreamEvent) => void;
  onStatus: (status: AssistantStatus) => void;
}

/**
 * Zadaje pytanie i przekazuje zdarzenia w miarę ich napływania.
 *
 * Brak klucza API kończy się statusem `not_configured`, a nie błędem - to stan
 * oczekiwany do czasu wpisania klucza w Vercelu i interfejs mówi o tym wprost,
 * zamiast udawać, że asystent myśli.
 */
export async function runAssistant({
  question,
  locale,
  signal,
  onEvent,
  onStatus,
}: RunAssistantOptions): Promise<void> {
  try {
    const res = await fetch("/api/asystent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, locale }),
      signal,
    });

    if (res.status === 503) {
      onStatus("not_configured");
      return;
    }
    if (!res.ok || !res.body) {
      onStatus("error");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseLines(buffer);
      buffer = rest;
      events.forEach(onEvent);
    }

    // Ostatnia linia bywa bez znaku końca - domykamy ją, jeśli jest kompletna.
    if (buffer.trim()) {
      const { events } = parseLines(buffer + "\n");
      events.forEach(onEvent);
    }
  } catch {
    if (signal.aborted) return; // użytkownik zamknął widok - to nie awaria
    onStatus("error");
  }
}
