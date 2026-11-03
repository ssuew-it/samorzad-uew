import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RolesStore } from "@/lib/roles-core";

// Akcje testujemy bez Next i bez Edge Config: dostęp i magazyn są mockowane,
// więc test sprawdza wyłącznie kolejność decyzji (uprawnienia -> konfiguracja
// -> odczyt -> edycja -> zapis) i to, co akcja oddaje panelowi.
vi.mock("server-only", () => ({}));

const getAccess = vi.fn();
vi.mock("@/lib/access", () => ({ getAccess: () => getAccess() }));

const readRolesStore = vi.fn();
const canWriteRoles = vi.fn();
const writeRolesStore = vi.fn();
vi.mock("@/lib/roles-store", () => ({
  readRolesStore: (...args: unknown[]) => readRolesStore(...args),
  canWriteRoles: () => canWriteRoles(),
  writeRolesStore: (s: RolesStore) => writeRolesStore(s),
}));

const { savePersonRoles, setPersonBlocked, deletePerson } = await import("./role");

const session = { email: "kontakt@samorzad.ue.wroc.pl", name: "Samorząd", iat: 0, exp: 1 };
const stored = (people: RolesStore["people"] = {}) => ({ ok: true, configured: true, store: { v: 1, people } });

function asSuperadmin() {
  getAccess.mockResolvedValue({ isSuperadmin: true, roles: [{ role: "superadmin", until: null }], session });
}

beforeEach(() => {
  canWriteRoles.mockReturnValue(true);
  readRolesStore.mockResolvedValue(stored());
  writeRolesStore.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe("akcje panelu Role i dostęp", () => {
  it("bez superadmina: forbidden i brak zapisu", async () => {
    getAccess.mockResolvedValue({ isSuperadmin: false, roles: [{ role: "zarzad", until: null }], session });
    expect(await savePersonRoles("jan", { admi: null })).toEqual({ ok: false, error: "forbidden" });
    expect(await setPersonBlocked("jan", true)).toEqual({ ok: false, error: "forbidden" });
    expect(await deletePerson("jan")).toEqual({ ok: false, error: "forbidden" });
    expect(writeRolesStore).not.toHaveBeenCalled();
  });

  it("niezalogowany (albo zablokowany): forbidden", async () => {
    getAccess.mockResolvedValue(null);
    expect(await savePersonRoles("jan", { admi: null })).toEqual({ ok: false, error: "forbidden" });
    expect(readRolesStore).not.toHaveBeenCalled();
  });

  it("superadmin nadaje rolę - zapis i widok z zapisanego magazynu", async () => {
    asSuperadmin();
    const r = await savePersonRoles("Jan@samorzad.ue.wroc.pl", { zarzad: "2027-05-31" });
    expect(writeRolesStore).toHaveBeenCalledWith({ v: 1, people: { jan: { r: { zarzad: "2027-05-31" } } } });
    expect(r).toEqual({
      ok: true,
      people: [{ email: "jan@samorzad.ue.wroc.pl", blocked: false, grants: [{ role: "zarzad", until: "2027-05-31" }] }],
    });
    // Po zapisie nie czytamy magazynu ponownie - Edge Config propaguje z opóźnieniem.
    expect(readRolesStore).toHaveBeenCalledTimes(1);
  });

  it("odczyt przed zapisem jest spójny (consistent: true) w każdej akcji", async () => {
    asSuperadmin();
    readRolesStore.mockResolvedValue(stored({ jan: { r: { admi: null } } }));
    await savePersonRoles("ola", { admi: null });
    await setPersonBlocked("ola", true);
    await deletePerson("jan");
    expect(readRolesStore).toHaveBeenCalledTimes(3);
    for (const call of readRolesStore.mock.calls) expect(call).toEqual([{ consistent: true }]);
  });

  it("blokada kontakt@ odrzucona", async () => {
    asSuperadmin();
    expect(await setPersonBlocked("kontakt@samorzad.ue.wroc.pl", true)).toEqual({ ok: false, error: "superadmin" });
    expect(writeRolesStore).not.toHaveBeenCalled();
  });

  it("blokada DEV_SUPERADMIN w trybie deweloperskim odrzucona", async () => {
    asSuperadmin();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_SUPERADMIN", "tester@samorzad.ue.wroc.pl");
    expect(await setPersonBlocked("tester", true)).toEqual({ ok: false, error: "superadmin" });
    expect(writeRolesStore).not.toHaveBeenCalled();
  });

  it("blokuje i odblokowuje, zachowując role", async () => {
    asSuperadmin();
    readRolesStore.mockResolvedValue(stored({ ola: { r: { admi: null } } }));
    expect(await setPersonBlocked("ola", true)).toEqual({
      ok: true,
      people: [{ email: "ola@samorzad.ue.wroc.pl", blocked: true, grants: [{ role: "admi", until: null }] }],
    });
    expect(writeRolesStore).toHaveBeenLastCalledWith({ v: 1, people: { ola: { r: { admi: null }, b: true } } });
  });

  it("usuwa osobę", async () => {
    asSuperadmin();
    readRolesStore.mockResolvedValue(stored({ jan: { r: { zarzad: "2027-05-31" } }, ola: { r: { admi: null } } }));
    const r = await deletePerson("jan");
    expect(writeRolesStore).toHaveBeenCalledWith({ v: 1, people: { ola: { r: { admi: null } } } });
    expect(r).toMatchObject({ ok: true, people: [{ email: "ola@samorzad.ue.wroc.pl" }] });
  });

  it("awaria zapisu zwraca write", async () => {
    asSuperadmin();
    writeRolesStore.mockRejectedValue(new Error("403"));
    expect(await deletePerson("jan")).toEqual({ ok: false, error: "write" });
  });

  it("bez konfiguracji: notConfigured, bez odczytu i zapisu", async () => {
    asSuperadmin();
    canWriteRoles.mockReturnValue(false);
    expect(await savePersonRoles("jan", { admi: null })).toEqual({ ok: false, error: "notConfigured" });
    expect(readRolesStore).not.toHaveBeenCalled();
    expect(writeRolesStore).not.toHaveBeenCalled();
  });

  it("bez EDGE_CONFIG (odczyt pusty, nieskonfigurowany): notConfigured - nie nadpisujemy magazynu", async () => {
    asSuperadmin();
    readRolesStore.mockResolvedValue({ ok: true, configured: false, store: { v: 1, people: {} } });
    expect(await savePersonRoles("jan", { admi: null })).toEqual({ ok: false, error: "notConfigured" });
    expect(writeRolesStore).not.toHaveBeenCalled();
  });

  it("awaria odczytu: read, bez zapisu", async () => {
    asSuperadmin();
    readRolesStore.mockResolvedValue({ ok: false });
    expect(await savePersonRoles("jan", { admi: null })).toEqual({ ok: false, error: "read" });
    expect(writeRolesStore).not.toHaveBeenCalled();
  });

  it("błędy edycji mapowane na kody", async () => {
    asSuperadmin();
    expect(await savePersonRoles("x@gmail.com", { admi: null })).toEqual({ ok: false, error: "email" });
    expect(await savePersonRoles("jan", { zarzad: "jutro" })).toEqual({ ok: false, error: "date" });
    expect(await savePersonRoles("jan", { superadmin: null } as never)).toEqual({ ok: false, error: "role" });
    expect(writeRolesStore).not.toHaveBeenCalled();
  });

  it("śmieci zamiast argumentów (wywołanie z pominięciem panelu) nie przechodzą", async () => {
    asSuperadmin();
    expect(await savePersonRoles(42 as never, { admi: null })).toEqual({ ok: false, error: "email" });
    expect(await savePersonRoles("jan", null as never)).toEqual({ ok: false, error: "role" });
    expect(await savePersonRoles("jan", ["admi"] as never)).toEqual({ ok: false, error: "role" });
    expect(await setPersonBlocked(null as never, true)).toEqual({ ok: false, error: "email" });
    expect(await deletePerson({} as never)).toEqual({ ok: false, error: "email" });
    expect(writeRolesStore).not.toHaveBeenCalled();
  });
});
