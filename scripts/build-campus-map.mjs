/**
 * Geometria planu kampusu z OpenStreetMap → src/lib/campus-map.generated.json.
 *
 * Mapa na /mapa-kampusu jest rysowana u nas (SVG), a nie wczytywana z Google
 * czy z kafelków OSM: działa od razu, bez plików cookie i bez zgody, w kolorach
 * strony i w trybie ciemnym. Dane © współtwórcy OpenStreetMap (ODbL) - podpis
 * jest na mapie.
 *
 * Budynki Uczelni wskazujemy JAWNĄ listą identyfikatorów OSM (BUILDINGS), bo
 * w okolicy są też obce budynki opisane tą samą literą („A” przy al. Wiśniowej,
 * „I” przy Sudeckiej). Nowy budynek: znajdź jego way na openstreetmap.org,
 * dopisz tutaj i w src/lib/campus-buildings.ts, uruchom `npm run build:campus-map`.
 *
 *   node scripts/build-campus-map.mjs            (pobiera dane z api.openstreetmap.org)
 *   node scripts/build-campus-map.mjs osm.json   (z zapisanego pliku)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src/lib/campus-map.generated.json");
const BBOX = "17.0180,51.0855,17.0300,51.0935";

/** Kod budynku → way-e w OSM (część budynków to kilka brył). */
const BUILDINGS = {
  A: [961249105],
  A1: [368340213, 368664004],
  B: [100933778],
  C: [368266842],
  CKU: [214760348],
  D: [100929020, 100929228, 368987888, 368987914, 368988478],
  E: [100931116, 100941771, 369055938, 369055939],
  // 100923356 to inny budynek „F” z rejestru EGiB, poza kampusem.
  F: [369055950],
  G: [100928669],
  H: [100916778],
  I: [100916441],
  J: [100922054],
  K: [100935044],
  L: [100935042],
  N: [1136486661],
  P: [100916470],
  W: [100919088],
  Z: [100918036],
  Z1: [100918568],
  INQUBE: [100942358],
  BB: [100916435, 100934803],
  BF: [644545006],
  SLEZAK: [100927776],
  PRZEGUBOWIEC: [511417236],
};
const CAMPUS_AREAS = [55600983, 214760348];
/** Przystanki przy kampusie (nazwy jak w OSM i na tablicach MPK). */
const STOPS = ["Uniwersytet Ekonomiczny", "Drukarska", "Komandorska", "Wielka"];
const ROAD_TYPES = new Set(["primary", "secondary", "tertiary", "residential", "unclassified", "living_street", "pedestrian"]);
const LABELLED_ROADS = new Set(["Komandorska", "Kamienna", "Ślężna", "Wielka", "Drukarska"]);

let osm;
if (process.argv[2]) osm = JSON.parse(readFileSync(process.argv[2], "utf8"));
else {
  const res = await fetch(`https://api.openstreetmap.org/api/0.6/map.json?bbox=${BBOX}`, {
    headers: { "User-Agent": "SSUEW-campus-map/1.0 (kontakt@samorzad.ue.wroc.pl)" },
  });
  if (!res.ok) throw new Error(`OSM ${res.status}`);
  osm = await res.json();
}
const els = osm.elements;
const nodes = new Map(els.filter((e) => e.type === "node").map((n) => [n.id, n]));
const ways = new Map(els.filter((e) => e.type === "way").map((w) => [w.id, w]));

// Rzut: metry od środka kampusu, oś Y w dół (jak w SVG).
const campusWay = ways.get(CAMPUS_AREAS[0]);
const cLat = campusWay.nodes.reduce((s, id) => s + nodes.get(id).lat, 0) / campusWay.nodes.length;
const cLon = campusWay.nodes.reduce((s, id) => s + nodes.get(id).lon, 0) / campusWay.nodes.length;
const KX = Math.cos((cLat * Math.PI) / 180) * 111320;
const KY = 110540;
const proj = (n) => [(n.lon - cLon) * KX, -(n.lat - cLat) * KY];
const r1 = (v) => Math.round(v * 2) / 2;

const pts = (way) => way.nodes.map((id) => nodes.get(id)).filter(Boolean).map(proj);
const pathOf = (p, closed) => "M" + p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + (closed ? "Z" : "");
function centroid(p) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [x0, y0] = p[i], [x1, y1] = p[i + 1];
    const f = x0 * y1 - x1 * y0;
    a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  if (Math.abs(a) < 1e-6) return p[0];
  return [cx / (3 * a), cy / (3 * a)];
}
/** Punkt w bryle możliwie daleko od krawędzi - etykieta litery budynku w kształcie „L” nie wypada poza obrys. */
function labelPoint(p) {
  const insideP = (x, y) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, yi] = p[i], [xj, yj] = p[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const distEdge = (x, y) => {
    let m = Infinity;
    for (let i = 0; i < p.length - 1; i++) {
      const [x0, y0] = p[i], [x1, y1] = p[i + 1];
      const dx = x1 - x0, dy = y1 - y0, l = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / l));
      m = Math.min(m, Math.hypot(x - (x0 + t * dx), y - (y0 + t * dy)));
    }
    return m;
  };
  const c = centroid(p);
  if (insideP(c[0], c[1]) && distEdge(c[0], c[1]) > 4) return c;
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  let best = c, bestD = -1;
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += 1.5)
    for (let y = Math.min(...ys); y <= Math.max(...ys); y += 1.5)
      if (insideP(x, y)) { const d = distEdge(x, y); if (d > bestD) { bestD = d; best = [x, y]; } }
  return best;
}
const area = (p) => Math.abs(p.slice(0, -1).reduce((s, [x0, y0], i) => s + x0 * p[i + 1][1] - p[i + 1][0] * y0, 0)) / 2;

// Budynki Uczelni.
const buildings = {};
const ours = new Set();
for (const [code, ids] of Object.entries(BUILDINGS)) {
  const parts = ids.map((id) => ways.get(id)).filter(Boolean).map(pts);
  if (!parts.length) {
    console.warn(`! ${code}: brak way-a w danych OSM`);
    continue;
  }
  ids.forEach((id) => ours.add(id));
  // Etykieta w środku największej bryły.
  const main = parts.reduce((a, b) => (area(b) > area(a) ? b : a));
  const [lx, ly] = labelPoint(main);
  // Współrzędne etykiety - cel dla „Wyznacz trasę” w Mapach Google.
  const geo = [Math.round((cLat - ly / KY) * 1e6) / 1e6, Math.round((cLon + lx / KX) * 1e6) / 1e6];
  buildings[code] = { d: parts.map((p) => pathOf(p, true)).join(""), label: [r1(lx), r1(ly)], geo };
}

// Granica widoku: budynki Uczelni + przystanki, z marginesem.
const ourPts = Object.values(BUILDINGS).flat().map((id) => ways.get(id)).filter(Boolean).flatMap(pts);
const stopNodes = els.filter((e) => e.type === "node" && e.tags && STOPS.includes(e.tags.name) && (e.tags.highway === "bus_stop" || e.tags.railway === "tram_stop" || e.tags.public_transport === "platform"));
// Kadr wyznaczają budynki i najbliższe przystanki; dalsze („Wielka”) są tylko na liście dojazdu.
const NEAR_STOPS = new Set(["Uniwersytet Ekonomiczny", "Drukarska", "Komandorska"]);
const box = [...ourPts, ...stopNodes.filter((n) => NEAR_STOPS.has(n.tags.name)).map(proj)];
const M = 45;
const minX = Math.min(...box.map((p) => p[0])) - M, maxX = Math.max(...box.map((p) => p[0])) + M;
const minY = Math.min(...box.map((p) => p[1])) - M, maxY = Math.max(...box.map((p) => p[1])) + M;
const inside = ([x, y]) => x > minX - 40 && x < maxX + 40 && y > minY - 40 && y < maxY + 40;

// Tło: pozostałe budynki, zieleń, ulice, torowiska.
const context = [], green = [], roads = [], rails = [];
for (const w of ways.values()) {
  if (!w.tags || ours.has(w.id)) continue;
  const p = pts(w);
  if (!p.length || !p.some(inside)) continue;
  if (w.tags.building) context.push(pathOf(p, true));
  else if (w.tags.leisure === "park" || w.tags.landuse === "grass" || w.tags.leisure === "garden" || w.tags.landuse === "cemetery") green.push(pathOf(p, true));
  else if (ROAD_TYPES.has(w.tags.highway)) roads.push({ d: pathOf(p, false), name: w.tags.name ?? "", major: ["primary", "secondary", "tertiary"].includes(w.tags.highway) });
  else if (w.tags.railway === "tram") rails.push(pathOf(p, false));
}
const campus = CAMPUS_AREAS.map((id) => ways.get(id)).filter(Boolean).map((w) => pathOf(pts(w), true));

// Etykiety ulic: najdłuższy odcinek danej nazwy, kąt wzdłuż odcinka.
const labels = [];
for (const name of LABELLED_ROADS) {
  const segs = [...ways.values()].filter((w) => w.tags?.name === name && ROAD_TYPES.has(w.tags.highway)).map(pts).filter((p) => p.some(inside));
  if (!segs.length) continue;
  const longest = segs.reduce((a, b) => (b.length > a.length ? b : a));
  const mid = Math.floor(longest.length / 2);
  const [a, b] = [longest[Math.max(0, mid - 1)], longest[Math.min(longest.length - 1, mid + 1)]];
  let angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  labels.push({ name, at: [r1(longest[mid][0]), r1(longest[mid][1])], angle: Math.round(angle) });
}

// Przystanki: jedna pinezka na nazwę (środek peronów), linie z relacji tras.
const lineOf = new Map();
for (const r of els.filter((e) => e.type === "relation" && (e.tags?.route === "tram" || e.tags?.route === "bus"))) {
  for (const m of r.members) if (m.type === "node") {
    if (!lineOf.has(m.ref)) lineOf.set(m.ref, new Set());
    lineOf.get(m.ref).add(`${r.tags.route}:${r.tags.ref}`);
  }
}
const stops = STOPS.map((name) => {
  const ns = stopNodes.filter((n) => n.tags.name === name);
  if (!ns.length) return null;
  const pp = ns.map(proj);
  const all = new Set(ns.flatMap((n) => [...(lineOf.get(n.id) ?? [])]));
  const sorted = (kind) => [...all].filter((l) => l.startsWith(kind)).map((l) => l.split(":")[1]).sort((a, b) => Number(a) - Number(b));
  return {
    name,
    at: [r1(pp.reduce((s, p) => s + p[0], 0) / pp.length), r1(pp.reduce((s, p) => s + p[1], 0) / pp.length)],
    lat: ns[0].lat,
    lon: ns[0].lon,
    tram: sorted("tram"),
    bus: sorted("bus"),
  };
}).filter(Boolean);

const out = {
  source: "© współtwórcy OpenStreetMap (ODbL)",
  generatedAt: new Date().toISOString().slice(0, 10),
  viewBox: [r1(minX), r1(minY), r1(maxX - minX), r1(maxY - minY)],
  campus,
  green,
  context,
  roads,
  rails,
  labels,
  buildings,
  stops,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`Zapisano ${OUT}: ${Object.keys(buildings).length} budynków Uczelni, ${context.length} w tle, ${roads.length} ulic, ${stops.length} przystanki, ${Math.round(JSON.stringify(out).length / 1024)} KB`);
