/**
 * Link do mapy kampusu z zaznaczonym budynkiem i salą (np. przy dyżurach:
 * „bud. A, pok. 121” → /mapa-kampusu?budynek=A&sala=121).
 *
 * Budynki i ich obrysy są w lib/campus-buildings.ts (mapa z OpenStreetMap) -
 * link działa dla każdego budynku, który mapa zna.
 */
import { findBuilding } from "./campus-buildings";

/** Link do mapy z zaznaczonym budynkiem albo `null`, gdy budynku nie ma na mapie. */
export function campusMapHref(building?: string, room?: string): string | null {
  const b = building ? findBuilding(building) : null;
  if (!b) return null;
  const params = new URLSearchParams({ budynek: b.code });
  if (room) params.set("sala", room);
  return `/mapa-kampusu?${params.toString()}`;
}
