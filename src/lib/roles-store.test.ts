import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeRolesStore } from "./roles-store";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  vi.stubEnv("EDGE_CONFIG_ID", "ecfg_test123");
  vi.stubEnv("VERCEL_API_TOKEN", "token-abc");
  vi.stubEnv("VERCEL_TEAM_ID", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
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

  it("rzuca przy odpowiedzi błędem (403)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(writeRolesStore({ v: 1, people: {} })).rejects.toThrow();
  });
});
