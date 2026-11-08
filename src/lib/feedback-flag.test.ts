import { afterEach, describe, expect, it, vi } from "vitest";
import { FEEDBACK_KEY, feedbackDone, markFeedbackDone, feedbackForcedByUrl } from "./feedback-flag";

function pamiec() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("flaga oceny strony", () => {
  it("bez wpisu okienko może się pokazać", () => {
    vi.stubGlobal("localStorage", pamiec());
    expect(feedbackDone()).toBe(false);
  });

  it("po zamknięciu albo wysłaniu nie wraca", () => {
    const ls = pamiec();
    vi.stubGlobal("localStorage", ls);
    markFeedbackDone();
    expect(ls.getItem(FEEDBACK_KEY)).toBeTruthy();
    expect(feedbackDone()).toBe(true);
  });

  it("zablokowana pamięć przeglądarki: okienko się nie pokazuje (nie męczymy w kółko)", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(feedbackDone()).toBe(true);
    expect(() => markFeedbackDone()).not.toThrow();
  });

  it("?opinia=teraz pokazuje okienko od razu (do sprawdzania i testów)", () => {
    expect(feedbackForcedByUrl("?opinia=teraz")).toBe(true);
    expect(feedbackForcedByUrl("?q=stypendia")).toBe(false);
  });
});
