import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readRolesStore, rolesConnectionString, writeRolesStore } from "./roles-store";

vi.mock("server-only", () => ({}));

// SDK Edge Config mockowany: sprawdzamy tylko, O CO pytamy (zwykły odczyt
// czy spójny), a nie samo połączenie.
const edgeGet = vi.fn();
vi.mock("@vercel/global-config", () => ({
  createClient: () => ({ get: (...args: unknown[]) => edgeGet(...args) }),
}));

beforeEach(() => {
  vi.stubEnv("EDGE_CONFIG_ID", "ecfg_test123");
  vi.stubEnv("VERCEL_API_TOKEN", "token-abc");
  vi.stubEnv("VERCEL_TEAM_ID", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("readRolesStore", () => {
  beforeEach(() => {
    vi.stubEnv("EDGE_CONFIG", "https://edge-config.vercel.com/ecfg_test123?token=t");
    edgeGet.mockReset();
    edgeGet.mockResolvedValue({ v: 1, people: { jan: { r: { admi: null } } } });
  });

  it("domyślnie zwykły odczyt (z kopii brzegowej, bez consistentRead)", async () => {
    const read = await readRolesStore();
    expect(edgeGet).toHaveBeenCalledWith("role");
    expect(edgeGet.mock.calls[0][1]).toBeUndefined();
    expect(read).toEqual({ ok: true, configured: true, store: { v: 1, people: { jan: { r: { admi: null } } } } });
  });

  it("consistent: true -> consistentRead (z pominięciem cache i kopii brzegowej)", async () => {
    await readRolesStore({ consistent: true });
    expect(edgeGet).toHaveBeenCalledWith("role", { consistentRead: true });
  });

  it("czyta też nową zmienną GLOBAL_CONFIG, którą Vercel dodaje po przemianowaniu", async () => {
    vi.stubEnv("EDGE_CONFIG", "");
    vi.stubEnv("GLOBAL_CONFIG", "https://global-config.vercel.com/ecfg_test123?token=t");
    expect(rolesConnectionString()).toBe("https://global-config.vercel.com/ecfg_test123?token=t");
    expect((await readRolesStore()).ok).toBe(true);
  });

  it("bez żadnej zmiennej: pusty, nieskonfigurowany magazyn bez dotykania SDK", async () => {
    vi.stubEnv("EDGE_CONFIG", "");
    vi.stubEnv("GLOBAL_CONFIG", "");
    expect(await readRolesStore()).toEqual({ ok: true, configured: false, store: { v: 1, people: {} } });
    expect(edgeGet).not.toHaveBeenCalled();
  });

  it("błąd SDK -> ok:false", async () => {
    edgeGet.mockRejectedValue(new Error("401"));
    expect(await readRolesStore({ consistent: true })).toEqual({ ok: false });
  });
});

describe("writeRolesStore", () => {
  it("wysyła PATCH z Bearer i poprawnym body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const store = { v: 1 as const, people: {} };
    await writeRolesStore(store);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.vercel.com/v1/edge-config/ecfg_test123/items");
    expect(init.method).toBe("PATCH");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-abc");
    expect(JSON.parse(init.body as string)).toEqual({
      items: [{ operation: "upsert", key: "role", value: store }],
    });
  });

  it("dołącza teamId do adresu, gdy ustawiony", async () => {
    vi.stubEnv("VERCEL_TEAM_ID", "team_xyz");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await writeRolesStore({ v: 1, people: {} });

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("https://api.vercel.com/v1/edge-config/ecfg_test123/items?teamId=team_xyz");
  });

  it("rzuca przy odpowiedzi błędem (403) i loguje kod oraz komunikat Vercela bez tokenu", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => '{"error":{"code":"forbidden","message":"Not authorized"}}',
    });
    vi.stubGlobal("fetch", fetchMock);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(writeRolesStore({ v: 1, people: {} })).rejects.toThrow("HTTP 403");
    const line = String(log.mock.calls[0][0]);
    expect(line).toContain("HTTP 403");
    expect(line).toContain("forbidden");
    expect(line).not.toContain("token-abc");
    log.mockRestore();
  });

  it("przycina białe znaki wklejone razem z wartościami zmiennych", async () => {
    vi.stubEnv("EDGE_CONFIG_ID", " ecfg_test123\n");
    vi.stubEnv("VERCEL_API_TOKEN", "token-abc\n");
    vi.stubEnv("VERCEL_TEAM_ID", " team_xyz ");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await writeRolesStore({ v: 1, people: {} });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.vercel.com/v1/edge-config/ecfg_test123/items?teamId=team_xyz");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-abc");
  });
});
