import { describe, expect, it } from "vitest";
import { buildCorpus } from "./corpus";

const messages = {
  stypRektora: {
    intro: "Stypendium Rektora przysługuje studentom z wysoką średnią ocen za poprzedni rok.",
  },
  stypendia: {
    metaTitle: "Stypendia",
    heroLead: "Wsparcie finansowe dla studentów Uniwersytetu Ekonomicznego we Wrocławiu.",
    sections: [
      { title: "Terminy", body: "Wniosek o stypendium rektora składasz do 15 października w USOSweb." },
    ],
  },
  nieznanyNamespace: {
    intro: "Ta treść nie ma przypisanej trasy, więc nie powinna trafić do korpusu wcale.",
  },
  kontakt: {
    ariaLabel: "Techniczny klucz, nie treść.",
  },
};

describe("buildCorpus", () => {
  it("returns [] for non-object input", () => {
    expect(buildCorpus(null)).toEqual([]);
    expect(buildCorpus("string")).toEqual([]);
  });

  it("produces one document per mapped namespace", () => {
    const docs = buildCorpus(messages);
    // kontakt jest mapowany, ale jego jedyny klucz jest techniczny (aria*) → pomijamy dokument.
    expect(docs.map((d) => d.context).sort()).toEqual(["/stypendia", "/stypendia#rektora"]);
  });

  it("skips namespaces with no route mapping", () => {
    const docs = buildCorpus(messages);
    expect(docs.some((d) => d.source.data.includes("nie ma przypisanej trasy"))).toBe(false);
  });

  it("skips technical keys (meta*/aria*)", () => {
    const docs = buildCorpus(messages);
    const stypendiaDoc = docs.find((d) => d.context === "/stypendia");
    expect(stypendiaDoc).toBeDefined();
    expect(stypendiaDoc!.source.data).not.toContain("Stypendia");
    expect(stypendiaDoc!.source.data).toContain("Wsparcie finansowe");
  });

  it("sorts namespaces deterministically (alphabetically by key)", () => {
    const docs = buildCorpus(messages);
    // Klucze: stypRektora, stypendia - alfabetycznie "stypRektora" < "stypendia" (wielkie R < e w ASCII).
    const contexts = docs.map((d) => d.context);
    const sortedKeys = Object.keys(messages).filter((k) => k !== "nieznanyNamespace" && k !== "kontakt").sort();
    const expectedContexts = sortedKeys.map((k) => (k === "stypRektora" ? "/stypendia#rektora" : "/stypendia"));
    expect(contexts).toEqual(expectedContexts);
  });

  it("is stable across repeated calls (same input → identical output)", () => {
    const a = buildCorpus(messages);
    const b = buildCorpus(messages);
    expect(a).toEqual(b);
  });

  it("sets context to the route href and title to the route label", () => {
    const docs = buildCorpus(messages);
    const doc = docs.find((d) => d.context === "/stypendia#rektora");
    expect(doc).toBeDefined();
    expect(doc!.title).toBe("Stypendium Rektora");
  });

  it("enables citations on every document", () => {
    const docs = buildCorpus(messages);
    expect(docs.every((d) => d.citations.enabled === true)).toBe(true);
  });

  it("uses text/plain document blocks", () => {
    const docs = buildCorpus(messages);
    expect(docs.every((d) => d.type === "document" && d.source.type === "text")).toBe(true);
  });
});
