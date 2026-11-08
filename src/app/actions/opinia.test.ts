import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendFeedback } from "./opinia";

const fetchMock = vi.fn();
const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};
const ok = { ocena: "4", znalezione: "czesciowo", komentarz: "Brakuje mi terminów stypendiów na stronie głównej.", strona: "/pl/stypendia", jezyk: "pl" };

beforeEach(() => {
  vi.stubEnv("APPS_SCRIPT_URL", "https://example.test/exec");
  vi.stubEnv("APPS_SCRIPT_SECRET", "test-secret");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(Response.json({ ok: true }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe("opinia o stronie: umowa z Apps Script", () => {
  it("wysyła ocenę jako formularz „opinia”, bez danych osobowych", async () => {
    expect(await sendFeedback(form(ok))).toEqual({ status: "ok" });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload).toEqual({
      formularz: "opinia",
      ocena: 4,
      znalezione: "czesciowo",
      komentarz: ok.komentarz,
      strona: "/pl/stypendia",
      jezyk: "pl",
      secret: "test-secret",
    });
  });

  it("sama ocena wystarczy - reszta jest opcjonalna", async () => {
    expect(await sendFeedback(form({ ocena: "5" }))).toEqual({ status: "ok" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ ocena: 5, znalezione: "", komentarz: "", strona: "", jezyk: "pl" });
  });

  it.each(["0", "6", "3.5", "", "pięć"])("odrzuca ocenę spoza 1-5: %j", async (ocena) => {
    expect(await sendFeedback(form({ ...ok, ocena }))).toEqual({ status: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("odrzuca nieznaną odpowiedź na „czy udało się znaleźć”", async () => {
    expect(await sendFeedback(form({ ...ok, znalezione: "może" }))).toEqual({ status: "invalid" });
  });

  it("przycina za długi komentarz do 1000 znaków", async () => {
    await sendFeedback(form({ ...ok, komentarz: "a".repeat(1500) }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).komentarz).toHaveLength(1000);
  });

  it("adres strony przyjmuje tylko ścieżkę serwisu", async () => {
    await sendFeedback(form({ ...ok, strona: "https://zly.example/phish" }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).strona).toBe("");
  });

  it("wypełniony honeypot: udajemy sukces, nic nie wysyłamy", async () => {
    expect(await sendFeedback(form({ ...ok, firma: "bot" }))).toEqual({ status: "ok" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("bez konfiguracji Apps Script zwraca not_configured", async () => {
    vi.stubEnv("APPS_SCRIPT_URL", "");
    expect(await sendFeedback(form(ok))).toEqual({ status: "not_configured" });
  });

  it("odmowa Apps Script to błąd, nie sukces", async () => {
    fetchMock.mockResolvedValue(Response.json({ ok: false, blad: "brak_autoryzacji" }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendFeedback(form(ok))).toEqual({ status: "error" });
  });
});
