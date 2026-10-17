import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendForm, type FormKind } from "./formularze";

const fetchMock = vi.fn();
const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};
const base = { name: "Jan Testowy", email: "test@example.com", message: "Proszę o kontakt w sprawie wydarzenia." };

beforeEach(() => {
  vi.stubEnv("APPS_SCRIPT_URL", "https://example.test/exec");
  vi.stubEnv("APPS_SCRIPT_SECRET", "test-secret");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(Response.json({ ok: true }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetAllMocks(); });

describe("formularze: umowa między stroną a Apps Script", () => {
  it.each<FormKind>(["kontakt", "rzecznik", "partnerzy"])("przyjmuje poprawny formularz %s", async (kind) => {
    const data = form({ ...base, subject: "Pytanie", organisation: "Organizacja Testowa" });
    expect(await sendForm(kind, data)).toEqual({ status: "ok" });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload).toMatchObject({ formularz: kind, ...base, subject: kind === "partnerzy" ? "Organizacja Testowa" : "Pytanie" });
  });
  it("obsługuje również partnerów ze starszego formularza contactPerson", async () => {
    const { name, ...rest } = base;
    expect(await sendForm("partnerzy", form({ ...rest, contactPerson: name, organisation: "Firma" }))).toEqual({ status: "ok" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ name, subject: "Firma" });
  });
  it("odrzuca partnera bez organizacji przed wysłaniem", async () => {
    expect(await sendForm("partnerzy", form(base))).toEqual({ status: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([{ email: "zły adres" }, { name: "" }, { message: "krótka" }])("waliduje dane na serwerze: %o", async (invalid) => {
    expect(await sendForm("kontakt", form({ ...base, ...invalid }))).toEqual({ status: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("odrzuca nieznany typ formularza", async () => {
    expect(await sendForm("unknown" as FormKind, form(base))).toEqual({ status: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("zwraca brak konfiguracji bez połączenia z Google", async () => {
    vi.stubEnv("APPS_SCRIPT_SECRET", "");
    expect(await sendForm("kontakt", form(base))).toEqual({ status: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("obsługuje awarię połączenia", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(await sendForm("kontakt", form(base))).toEqual({ status: "error" });
  });
  it("nie uznaje odpowiedzi HTTP 500 za sukces", async () => {
    fetchMock.mockResolvedValue(Response.json({ ok: true }, { status: 500 }));
    expect(await sendForm("kontakt", form(base))).toEqual({ status: "error" });
  });
});
