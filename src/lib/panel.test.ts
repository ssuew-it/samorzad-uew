import { describe, expect, it, vi } from "vitest";

// `panel.ts` ma `import "server-only"` - w testach stubujemy ten moduł,
// bo poza serwerem Next on nie istnieje (patrz access.test.ts).
vi.mock("server-only", () => ({}));

import { ASSIGNABLE_ROLES, canSee } from "./roles-core";
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
});
