/**
 * Dane planu kampusu tylko dla serwera: geometria (scripts/build-campus-map.mjs,
 * OpenStreetMap) i dostępność budynków (scripts/import-campus-access.mjs,
 * deklaracja dostępności Uczelni). Strona przekazuje do mapy w przeglądarce
 * tylko to, czego mapa potrzebuje - tło planu jest renderowane na serwerze.
 */
import "server-only";
import geometry from "./campus-map.generated.json";
import access from "./campus-access.generated.json";
import { CAMPUS_BUILDINGS_LIST } from "./campus-buildings";

export type AccessSection = "entrance" | "inside" | "rooms" | "toilets" | "stairs" | "service" | "extras" | "parking";
export type BuildingAccess = { address: string; summary: string; sections: Partial<Record<AccessSection, string[]>> };
export type BuildingShape = { d: string; label: [number, number]; geo: [number, number] };
export type TransitStop = { name: string; at: [number, number]; lat: number; lon: number; tram: string[]; bus: string[] };

export const CAMPUS_GEOMETRY = geometry;
const ACCESS = access as { source: string; fetchedAt: string; buildings: Record<string, BuildingAccess> };

/** Wszystko, czego potrzebuje interaktywna warstwa mapy - bez tła. */
export function campusMapProps() {
  const shapes = geometry.buildings as unknown as Record<string, BuildingShape>;
  const addresses = Object.fromEntries(
    CAMPUS_BUILDINGS_LIST.map((b) => [b.code, b.address ?? ACCESS.buildings[b.code]?.address ?? null]),
  );
  return {
    viewBox: geometry.viewBox as unknown as [number, number, number, number],
    shapes,
    stops: geometry.stops as unknown as TransitStop[],
    generatedAt: geometry.generatedAt,
    access: ACCESS.buildings,
    accessDate: ACCESS.fetchedAt,
    addresses,
  };
}

export type CampusMapProps = ReturnType<typeof campusMapProps>;
