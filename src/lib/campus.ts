/**
 * Budynki Uczelni, do których prowadzą linki z innych podstron
 * (np. „bud. A, pok. 121” przy dyżurach) - /mapa-kampusu?budynek=A&sala=121
 * zaznacza budynek na mapie.
 *
 * Współrzędne to środek obrysu budynku w OpenStreetMap, sprawdzone z planem
 * kampusu Uczelni (Dział Zarządzania Nieruchomościami, 2025). Nowy budynek
 * dopisz tutaj i w messages: mapa.buildings.<litera>.
 */
export const CAMPUS_BUILDINGS = {
  A: { query: "51.090110,17.026479" },
  Z: { query: "51.089953,17.027992" },
  // Wejście do budynku L (siedziba Samorządu) - sam adres Google stawiał w złym miejscu.
  L: { query: "51.087908,17.024116" },
} as const;

export type CampusBuilding = keyof typeof CAMPUS_BUILDINGS;

export function isCampusBuilding(b: string | undefined | null): b is CampusBuilding {
  return !!b && Object.hasOwn(CAMPUS_BUILDINGS, b);
}

/** Link do mapy z zaznaczonym budynkiem albo `null`, gdy budynku nie ma na mapie. */
export function campusMapHref(building?: string, room?: string): string | null {
  if (!isCampusBuilding(building)) return null;
  const params = new URLSearchParams({ budynek: building });
  if (room) params.set("sala", room);
  return `/mapa-kampusu?${params.toString()}`;
}
