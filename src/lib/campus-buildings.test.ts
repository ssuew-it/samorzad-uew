import { describe, expect, it } from "vitest";
import { CAMPUS_BUILDINGS_LIST, findBuilding, parseRoomQuery } from "./campus-buildings";
import geometry from "./campus-map.generated.json";

describe("campus-buildings", () => {
  it("wyszukiwarka sali rozumie różne zapisy", () => {
    expect(parseRoomQuery("A1 2")).toMatchObject({ building: { code: "A1" }, room: "2" });
    expect(parseRoomQuery("bud. A, pok. 121")).toMatchObject({ building: { code: "A" }, room: "121" });
    expect(parseRoomQuery("Z/205")).toMatchObject({ building: { code: "Z" }, room: "205" });
    expect(parseRoomQuery("u/w")).toMatchObject({ building: { code: "W" }, room: null });
    expect(parseRoomQuery("cku")).toMatchObject({ building: { code: "CKU" } });
    expect(parseRoomQuery("stołówka")).toBeNull();
  });

  it("link ?budynek= trafia w budynek", () => {
    expect(findBuilding("a")?.code).toBe("A");
    expect(findBuilding("B/F")?.code).toBe("BF");
  });

  it("budynki z kampusu mają obrys na mapie (poza SJO i SWFiS, których nie ma w OSM)", () => {
    const shapes = geometry.buildings as Record<string, unknown>;
    const missing = CAMPUS_BUILDINGS_LIST.filter((b) => !shapes[b.code]).map((b) => b.code);
    expect(missing.sort()).toEqual(["SJO", "SWFIS"]);
  });
});
