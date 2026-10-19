import { describe, it, expect } from "vitest";
import { addCitation, parseLines, type AssistantCitation } from "./assistant-client";

describe("parseLines", () => {
  it("returns complete lines and keeps the unfinished one as rest", () => {
    const { events, rest } = parseLines('{"type":"text","text":"a"}\n{"type":"te');
    expect(events).toEqual([{ type: "text", text: "a" }]);
    expect(rest).toBe('{"type":"te');
  });

  it("never parses a truncated trailing line", () => {
    // The classic streaming bug: JSON.parse on a half-received chunk.
    const { events } = parseLines('{"type":"text","text":"hel');
    expect(events).toEqual([]);
  });

  it("reassembles an event split across two chunks", () => {
    const first = parseLines('{"type":"text","tex');
    expect(first.events).toEqual([]);
    const second = parseLines(first.rest + 't":"ok"}\n');
    expect(second.events).toEqual([{ type: "text", text: "ok" }]);
    expect(second.rest).toBe("");
  });

  it("skips blank lines", () => {
    const { events } = parseLines('\n\n{"type":"done"}\n');
    expect(events).toEqual([{ type: "done" }]);
  });

  it("skips a corrupted line instead of dropping the whole response", () => {
    const { events } = parseLines('not json\n{"type":"done"}\n');
    expect(events).toEqual([{ type: "done" }]);
  });
});

describe("addCitation", () => {
  const cite = (context: string | null, title: string | null = "T", cited_text = "x") =>
    ({ type: "citation", context, title, cited_text }) as const;

  it("adds a new source", () => {
    const out = addCitation([], cite("/stypendia"));
    expect(out).toHaveLength(1);
    expect(out[0].context).toBe("/stypendia");
  });

  it("does not repeat the same source twice", () => {
    const first: AssistantCitation[] = addCitation([], cite("/stypendia"));
    const second = addCitation(first, cite("/stypendia", "T", "different quote"));
    expect(second).toHaveLength(1);
    expect(second).toBe(first); // unchanged reference - no needless re-render
  });

  it("keeps distinct sources apart", () => {
    let list: AssistantCitation[] = [];
    list = addCitation(list, cite("/stypendia"));
    list = addCitation(list, cite("/zarzad"));
    expect(list.map((c) => c.context)).toEqual(["/stypendia", "/zarzad"]);
  });

  it("falls back to title, then to the quote, when there is no route", () => {
    let list = addCitation([], cite(null, "Regulamin"));
    list = addCitation(list, cite(null, "Regulamin", "inny fragment"));
    expect(list).toHaveLength(1);
    list = addCitation(list, cite(null, null, "zupełnie inny"));
    expect(list).toHaveLength(2);
  });
});
