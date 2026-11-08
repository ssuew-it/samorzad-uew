import { describe, expect, it, vi } from "vitest";

// `panel.ts` ma `import "server-only"` - w testach stubujemy ten moduł,
// bo poza serwerem Next on nie istnieje (patrz access.test.ts).
vi.mock("server-only", () => ({}));

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ASSIGNABLE_ROLES, canSee, type RoleId } from "./roles-core";
import { panelTiles } from "./panel";

describe("panelTiles", () => {
  it("kafelek Role i dostęp widzi tylko superadmin", () => {
    const tile = panelTiles.find((t) => t.internal === "/strefa-dzialacza/role")!;
    expect(canSee(tile.roles, { isSuperadmin: false, roles: [{ role: "zarzad", until: null }] })).toBe(false);
    expect(canSee(tile.roles, { isSuperadmin: true, roles: [] })).toBe(true);
  });

  it("każda rola w kafelkach istnieje", () => {
    const znane = new Set(["superadmin", ...ASSIGNABLE_ROLES, "normal"]);
    for (const t of panelTiles) for (const r of t.roles ?? []) expect(znane.has(r)).toBe(true);
  });

  it("każdy widzi to, co ustalono (3.11.2026)", () => {
    const widzi = (role: RoleId) =>
      panelTiles
        .filter((t) => canSee(t.roles, { isSuperadmin: role === "superadmin", roles: [{ role, until: null }] }))
        .map((t) => t.name);
    expect(widzi("normal")).toEqual(["CRA", "Generator stopki mailowej"]);
    expect(widzi("zarzad")).toEqual(["Treści strony", "CRA", "Generator stopki mailowej", "Project D.E.C.K"]);
    expect(widzi("projekty")).toEqual(["Treści strony", "CRA", "Generator stopki mailowej"]);
    expect(widzi("russ")).toEqual(["CRA", "Generator stopki mailowej", "RadaStudentów24"]);
    expect(widzi("przewodniczacy")).toEqual(["CRA", "Generator stopki mailowej", "RadaStudentów24", "Project D.E.C.K"]);
    expect(widzi("admi")).toEqual(["CRA", "Generator stopki mailowej", "AdminOS"]);
    expect(widzi("superadmin")).toHaveLength(panelTiles.length);
  });

  it("ramka przy generatorze stopki podaje numer zarządzenia o obowiązkowej stopce", () => {
    const tile = panelTiles.find((t) => t.name === "Generator stopki mailowej")!;
    expect(tile.notice).toContain("01/ZRZ-SIDO/2026-2027");
    expect(tile.notice).not.toContain("…");
  });

  it("opisy kafelków bez długich myślników i z ludzkim opisem CRA", () => {
    for (const t of panelTiles) {
      expect(`${t.desc ?? ""}${t.notice ?? ""}`).not.toMatch(/[—–]/);
    }
    expect(panelTiles.find((t) => t.name === "CRA")!.desc).toMatch(/^Potrzebujesz sali/);
  });

  it("każda ikona kafelka istnieje w public/", () => {
    for (const t of panelTiles) if (t.icon) expect(existsSync(join(process.cwd(), "public", t.icon))).toBe(true);
  });
});
