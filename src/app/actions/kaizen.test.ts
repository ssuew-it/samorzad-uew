import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getAccess = vi.fn();
vi.mock("@/lib/access", () => ({ getAccess: () => getAccess() }));

const { sendKaizen } = await import("./kaizen");

const fetchMock = vi.fn();
const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};
const ok = { obszar: "komunikacja", zauwazam: "Ogłoszenia giną w czacie.", proponuje: "Przypinać podsumowanie tygodnia." };

beforeEach(() => {
  vi.stubEnv("APPS_SCRIPT_URL", "https://example.test/exec");
  vi.stubEnv("APPS_SCRIPT_SECRET", "test-secret");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(Response.json({ ok: true }));
  getAccess.mockResolvedValue({ session: { name: "Jan Działacz", email: "jan@samorzad.ue.wroc.pl" }, roles: [] });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe("karteczka Kaizen: wysyłka", () => {
  it("wysyła tylko obszar i treść - bez imienia i adresu Działacza", async () => {
    expect(await sendKaizen(form(ok))).toEqual({ status: "ok" });
    const body = fetchMock.mock.calls[0][1].body as string;
    expect(JSON.parse(body)).toEqual({ formularz: "kaizen", ...ok, secret: "test-secret" });
    expect(body).not.toContain("Jan");
    expect(body).not.toContain("samorzad.ue.wroc.pl");
  });

  it("bez zalogowania nie wysyła niczego", async () => {
    getAccess.mockResolvedValue(null);
    expect(await sendKaizen(form(ok))).toEqual({ status: "unauthorized" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("odrzuca niepełną karteczkę", async () => {
    expect(await sendKaizen(form({ ...ok, proponuje: "" }))).toEqual({ status: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pole-pułapka dla botów: udaje sukces, nic nie wysyła", async () => {
    expect(await sendKaizen(form({ ...ok, firma: "spam" }))).toEqual({ status: "ok" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("odrzucenie przez Apps Script to błąd, nie fałszywe „dziękujemy”", async () => {
    fetchMock.mockResolvedValue(Response.json({ ok: false, blad: "x" }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendKaizen(form(ok))).toEqual({ status: "error" });
  });
});
