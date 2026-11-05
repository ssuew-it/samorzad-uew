import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { buildAdjacency, shortestPath, walkMinutes, type WalkGraph } from "./campus-route";
import geometry from "./campus-map.generated.json";

// Kwadrat 0-1-2-3 z przekątną-schodami 0-2.
const g: WalkGraph = { nodes: [[0, 0], [100, 0], [100, 100], [0, 100]], edges: [[0, 1, 0], [1, 2, 0], [2, 3, 0], [3, 0, 0], [0, 2, 1]] };

describe("campus-route", () => {
  it("najkrótsza droga może iść schodami", () => {
    const r = shortestPath(buildAdjacency(g), 0, 2)!;
    expect(r.nodes).toEqual([0, 2]);
    expect(r.length).toBeCloseTo(141.42, 1);
    expect(r.steps).toBe(true);
  });

  it("„bez schodów” omija schody", () => {
    const r = shortestPath(buildAdjacency(g), 0, 2, true)!;
    expect(r.length).toBe(200);
    expect(r.steps).toBe(false);
  });

  it("minuty marszu: 80 m/min, co najmniej 1", () => {
    expect(walkMinutes(30)).toBe(1);
    expect(walkMinutes(480)).toBe(6);
  });

  it("na prawdziwym grafie z przystanku Uniwersytet Ekonomiczny da się dojść do budynku L", () => {
    const real = JSON.parse(fs.readFileSync("public/mapa/graf-pieszy.json", "utf8")) as WalkGraph;
    const adj = buildAdjacency(real);
    const stop = geometry.stops.find((s) => s.name === "Uniwersytet Ekonomiczny")!;
    const r = shortestPath(adj, stop.node, (geometry.buildings as Record<string, { node: number }>).L.node);
    expect(r).not.toBeNull();
    // Kilkaset metrów, a nie kilometry objazdu.
    expect(r!.length).toBeGreaterThan(150);
    expect(r!.length).toBeLessThan(1200);
  });
});
