import { describe, expect, it } from "vitest";
import { buildTransparency } from "./transparency";

const t = (pl: string) => ({ pl, en: pl });

describe("buildTransparency", () => {
  it("liczy akty i układa ostatnio opublikowane od najnowszego, razem z obu źródeł", () => {
    const data = buildTransparency(
      [
        { number: "1/2026/2027", date: "2026-10-01", title: t("z1") },
        { number: "2/2026/2027", date: "2026-10-20", title: t("z2") },
      ],
      [
        { number: "1/2026/2027", date: "2026-10-10", title: t("u1") },
        { number: "2/2026/2027", date: "2026-11-05", title: t("u2") },
      ],
      3,
    );
    expect(data.counts).toEqual({ regulations: 5, orders: 2, resolutions: 2 });
    expect(data.lastOrder).toBe("2026-10-20");
    expect(data.lastResolution).toBe("2026-11-05");
    expect(data.recent.map((r) => `${r.kind}:${r.title.pl}`)).toEqual(["resolution:u2", "order:z2", "resolution:u1"]);
  });

  it("bez wpisów w arkuszu zostają same regulaminy", () => {
    const data = buildTransparency([], []);
    expect(data.counts.orders).toBe(0);
    expect(data.lastOrder).toBeUndefined();
    expect(data.recent).toEqual([]);
  });
});
