"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowSquareOut,
  ArrowsIn,
  ArrowsOut,
  CaretDown,
  CornersIn,
  Crosshair,
  MagnifyingGlass,
  Minus,
  NavigationArrow,
  Plus,
  PersonSimpleWalk,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { CAMPUS_BUILDINGS_LIST, CAMPUS_TASKS, findBuilding, kindOf, parseRoomQuery, type BuildingKind, type CampusBuilding } from "@/lib/campus-buildings";
import { buildAdjacency, nearestNode, shortestPath, walkMinutes, type Adjacency, type WalkGraph } from "@/lib/campus-route";
import type { AccessSection, CampusMapProps, PoiKind } from "@/lib/campus-map-data";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./CampusMap.module.css";

/**
 * Interaktywny plan kampusu (wzór: mapa AI4Business, wykonanie nasze).
 *
 * - Plan rysujemy sami z danych OpenStreetMap: bez Google i plików cookie,
 *   w kolorach strony. Budynki pokolorowane według POTWIERDZONEJ funkcji.
 * - Prowadzenie pieszo po prawdziwej sieci chodników (lib/campus-route), także
 *   „bez schodów” - graf pobieramy dopiero przy pierwszej trasie.
 * - „Gdzie jestem” liczy pozycję tylko w przeglądarce; nic nie wysyłamy.
 * - Lista w panelu jest pełnoprawnym sterowaniem dla klawiatury i czytnika -
 *   obiekty na planie to skrót dla myszy i palca (SVG jest role="img").
 * - `?budynek=A&sala=121` z innych podstron zaznacza budynek i salę.
 */

type Tab = "buildings" | "points" | "transit";
type ViewBox = [number, number, number, number];
type Origin = { kind: "stop"; name: string } | { kind: "building"; code: string } | { kind: "me" };
type RouteResult = { points: [number, number][]; length: number; steps: boolean; to: string };

const MIN_W = 110;
const ACCESS_ORDER: AccessSection[] = ["entrance", "inside", "rooms", "toilets", "stairs", "service", "extras", "parking"];
const GROUPS: CampusBuilding["group"][] = ["kampus", "kamienna", "akademiki", "poza"];
const POI_KINDS: PoiKind[] = ["entrance", "aed", "bike", "bikeRental", "parcel", "atm", "food"];
const LEGEND: BuildingKind[] = ["samorzad", "obsluga", "administracja", "biblioteka", "wydzial", "aula", "sport", "akademik", "inne"];

/** Prostokąt obrysu z „M x yLx y…Z”. */
function boundsOf(d: string): ViewBox {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  return [minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY];
}

function boundsOfPoints(p: [number, number][]): ViewBox {
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  return [minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY];
}

/** Kadr wokół prostokąta, w proporcji widoku i nie ciaśniej niż MIN_W. */
function fit([x, y, w, h]: ViewBox, aspect: number, pad = 2.6): ViewBox {
  const cx = x + w / 2, cy = y + h / 2;
  let vw = Math.max(w * pad, MIN_W * 1.8), vh = Math.max(h * pad, (MIN_W * 1.8) / aspect);
  if (vw / vh > aspect) vh = vw / aspect;
  else vw = vh * aspect;
  return [cx - vw / 2, cy - vh / 2, vw, vh];
}

function useUrlBuilding() {
  const search = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const b = findBuilding(params.get("budynek") ?? "");
  return b ? { code: b.code, room: params.get("sala")?.trim().slice(0, 12) || null } : null;
}

/** Ikony punktów w siatce 16×16 - rysowane w kółku na planie. */
const POI_ICON: Record<PoiKind, string> = {
  entrance: "M5 3h6v10H5zM9 8h1",
  aed: "M8 13s-5-3-5-6.5A2.5 2.5 0 0 1 8 5a2.5 2.5 0 0 1 5 1.5C13 10 8 13 8 13zM8 7v3M6.5 8.5h3",
  bike: "M4.5 11.5a2 2 0 1 0 0-.01M11.5 11.5a2 2 0 1 0 0-.01M4.5 11.5 7 6h3l1.5 5.5M7 6 9 11.5",
  bikeRental: "M4.5 11.5a2 2 0 1 0 0-.01M11.5 11.5a2 2 0 1 0 0-.01M4.5 11.5 7 6h3l1.5 5.5M6 4h3",
  parcel: "M3 5.5 8 3l5 2.5v5L8 13l-5-2.5zM3 5.5 8 8l5-2.5M8 8v5",
  atm: "M2.5 5h11v6h-11zM2.5 7.5h11M5 9.5h2",
  food: "M5 3v4a1.5 1.5 0 0 0 3 0V3M6.5 7v6M11 3c-1.2 0-2 1.5-2 3.5S10 9 11 9v4",
};

export function CampusMap({
  children,
  viewBox: FULL,
  shapes,
  stops,
  pois,
  proj,
  generatedAt,
  access: accessAll,
  accessDate,
  addresses,
}: CampusMapProps & { children: ReactNode }) {
  const t = useTranslations("mapa.map");
  const locale = useLocale() === "en" ? "en" : "pl";
  const reduce = useReducedMotion();
  const fromUrl = useUrlBuilding();

  const [tab, setTab] = useState<Tab>("buildings");
  const [picked, setPicked] = useState<{ code: string; room: string | null } | null>(null);
  const [stop, setStop] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [vb, setVb] = useState<ViewBox>(FULL);
  const [dragging, setDragging] = useState(false);
  const [px, setPx] = useState(0);
  const [layers, setLayers] = useState<Set<PoiKind>>(() => new Set<PoiKind>(["entrance", "aed"]));
  const [origin, setOrigin] = useState<Origin>({ kind: "stop", name: stops[0]?.name ?? "" });
  const [noSteps, setNoSteps] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeState, setRouteState] = useState<"idle" | "loading" | "none" | "error">("idle");
  const [me, setMe] = useState<[number, number] | null>(null);
  const [meState, setMeState] = useState<"idle" | "loading" | "denied" | "outside">("idle");
  const [fullscreen, setFullscreen] = useState(false);

  // Wybór z linku obowiązuje, dopóki ktoś nie kliknie czegoś innego.
  const selected = picked ?? fromUrl;
  const building = selected ? CAMPUS_BUILDINGS_LIST.find((b) => b.code === selected.code) ?? null : null;

  const shellRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const vbRef = useRef(vb);
  const anim = useRef<number | null>(null);
  const graphRef = useRef<{ g: WalkGraph; adj: Adjacency } | null>(null);

  // Kadr zmieniamy tylko tędy: ref (czytany w gestach) i stan (render) zawsze zgodne.
  const setView = useCallback((v: ViewBox) => {
    vbRef.current = v;
    setVb(v);
  }, []);

  const aspect = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect();
    return r && r.height ? r.width / r.height : FULL[2] / FULL[3];
  }, [FULL]);

  /** Płynny najazd kadru; przy ograniczeniu ruchu - od razu. */
  const flyTo = useCallback(
    (target: ViewBox) => {
      if (anim.current) cancelAnimationFrame(anim.current);
      if (reduce) return setView(target);
      const from = vbRef.current, start = performance.now(), dur = 520;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setView(from.map((v, i) => v + (target[i] - v) * e) as ViewBox);
        if (p < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [reduce, setView],
  );

  const showAll = useCallback(() => flyTo(fit(FULL, aspect(), 1)), [flyTo, FULL, aspect]);

  // Kadr dopasowany do proporcji okna mapy (inna na telefonie, inna na desktopie).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(fit(FULL, aspect(), 1));
  }, [FULL, aspect, setView]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPx(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const focusBuilding = useCallback(
    (code: string) => {
      const shape = shapes[code];
      if (shape) flyTo(fit(boundsOf(shape.d), aspect()));
    },
    [flyTo, shapes, aspect],
  );

  // Wejście z linku (?budynek=): najazd na budynek i przewinięcie do mapy.
  const urlCode = fromUrl?.code;
  useEffect(() => {
    if (!urlCode) return;
    // Klatkę później: kadr startowy musi się najpierw dopasować do okna.
    const id = requestAnimationFrame(() => {
      focusBuilding(urlCode);
      wrapRef.current?.closest("section")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [urlCode, focusBuilding, reduce]);

  const select = (code: string, room: string | null = null) => {
    setPicked({ code, room });
    setStop(null);
    setRoute(null);
    setRouteState("idle");
    setTab("buildings");
    focusBuilding(code);
  };

  const selectStop = (name: string) => {
    const s = stops.find((x) => x.name === name);
    if (!s) return;
    setStop(name);
    flyTo(fit([s.at[0] - 90, s.at[1] - 90, 180, 180], aspect(), 1));
  };

  // ---------- trasa piesza ----------
  const loadGraph = useCallback(async () => {
    if (graphRef.current) return graphRef.current;
    const g = (await (await fetch("/mapa/graf-pieszy.json")).json()) as WalkGraph;
    graphRef.current = { g, adj: buildAdjacency(g) };
    return graphRef.current;
  }, []);

  const locate = useCallback(
    () =>
      new Promise<[number, number] | null>((resolve) => {
        if (!("geolocation" in navigator)) return resolve(null);
        setMeState("loading");
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const p: [number, number] = [(coords.longitude - proj.lon) * proj.kx, -(coords.latitude - proj.lat) * proj.ky];
            // Dalej niż ~1,5 km od kampusu trasa po naszym planie nie ma sensu.
            if (Math.hypot(p[0], p[1]) > 1500) {
              setMeState("outside");
              setMe(null);
              return resolve(null);
            }
            setMe(p);
            setMeState("idle");
            resolve(p);
          },
          () => {
            setMeState("denied");
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }),
    [proj],
  );

  const showMe = async () => {
    const p = await locate();
    if (p) flyTo(fit([p[0] - 60, p[1] - 60, 120, 120], aspect(), 1));
  };

  const planRoute = async () => {
    if (!building || !shapes[building.code]) return;
    setRouteState("loading");
    try {
      const { g, adj } = await loadGraph();
      let from: number | null = null;
      if (origin.kind === "stop") from = stops.find((s) => s.name === origin.name)?.node ?? null;
      else if (origin.kind === "building") from = shapes[origin.code]?.node ?? null;
      else {
        const p = me ?? (await locate());
        from = p ? nearestNode(g, p) : null;
      }
      if (from === null) return setRouteState("none");
      const r = shortestPath(adj, from, shapes[building.code].node, noSteps);
      if (!r) {
        setRoute(null);
        return setRouteState("none");
      }
      const points = r.nodes.map((i) => g.nodes[i]);
      setRoute({ points, length: r.length, steps: r.steps, to: building.code });
      setRouteState("idle");
      flyTo(fit(boundsOfPoints(points), aspect(), 1.25));
    } catch {
      setRouteState("error");
    }
  };

  // ---------- przesuwanie i przybliżanie ----------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);

  const zoomBy = useCallback(
    (factor: number, cx?: number, cy?: number) => {
      const [x, y, w, h] = vbRef.current;
      const nw = Math.min(FULL[2] * 1.6, Math.max(MIN_W, w * factor));
      const k = nw / w;
      const px0 = cx ?? x + w / 2, py0 = cy ?? y + h / 2;
      setView([px0 - (px0 - x) * k, py0 - (py0 - y) * k, nw, h * k]);
    },
    [FULL, setView],
  );

  const toMap = useCallback((clientX: number, clientY: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const [x, y, w, h] = vbRef.current;
    return [x + ((clientX - r.left) / r.width) * w, y + ((clientY - r.top) / r.height) * h];
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = wrapRef.current!.getBoundingClientRect();
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const [mx, my] = toMap((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomBy(pinch.current / d, mx, my);
      pinch.current = d;
      return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (!dragging && Math.hypot(dx, dy) > 2) setDragging(true);
    const [x, y, w, h] = vbRef.current;
    setView([x - (dx / r.width) * w, y - (dy / r.height) * h, w, h]);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    // Kliknięcie po przeciągnięciu nie zaznacza budynku.
    if (pointers.current.size === 0) setTimeout(() => setDragging(false), 0);
  };

  // Samo kółko przewija stronę; przybliża dopiero z Ctrl (i gest szczypania na touchpadzie).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const [mx, my] = toMap(e.clientX, e.clientY);
      zoomBy(Math.exp(e.deltaY * 0.0025), mx, my);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [toMap, zoomBy]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else shellRef.current?.requestFullscreen?.().catch(() => {});
  };

  // ---------- wyszukiwarka ----------
  const parsed = useMemo(() => (query.trim() ? parseRoomQuery(query) : null), [query]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || parsed) return CAMPUS_BUILDINGS_LIST;
    return CAMPUS_BUILDINGS_LIST.filter((b) => `${b.short} ${b.name.pl} ${b.name.en}`.toLowerCase().includes(q));
  }, [query, parsed]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsed) select(parsed.building.code, parsed.room);
    else if (filtered.length === 1) select(filtered[0].code);
  };

  const routeHref = (lat: number, lon: number, mode = "") =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}${mode ? `&travelmode=${mode}` : ""}`;

  const access = building ? accessAll[building.code] : null;
  const shape = building ? shapes[building.code] : null;
  const address = building ? addresses[building.code] : null;
  const officeGeo = shapes.L.geo;

  // Skala: metry planu na piksel ekranu. Podpisy, pinezki i trasa mają stały rozmiar na ekranie.
  const k = px ? vb[2] / px : FULL[2] / 800;
  const visiblePois = pois.filter((p) => layers.has(p.kind));
  const originValue = origin.kind === "stop" ? `stop:${origin.name}` : origin.kind === "building" ? `building:${origin.code}` : "me";

  return (
    <div ref={shellRef} className={styles.shell} data-fullscreen={fullscreen || undefined}>
      <div
        ref={wrapRef}
        className={styles.mapWrap}
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          className={styles.svg}
          style={{ "--k": k } as React.CSSProperties}
          viewBox={vb.join(" ")}
          role="img"
          aria-label={t("mapLabel")}
          preserveAspectRatio="xMidYMid meet"
        >
          {children}

          <g className={styles.buildings} data-has-active={building ? "" : undefined}>
            {CAMPUS_BUILDINGS_LIST.map((b) => {
              const s = shapes[b.code];
              if (!s) return null;
              return (
                <g
                  key={b.code}
                  className={styles.building}
                  data-kind={kindOf(b.code)}
                  data-active={building?.code === b.code || undefined}
                  onClick={() => !dragging && select(b.code)}
                >
                  <title>{b.name[locale]}</title>
                  <path d={s.d} />
                </g>
              );
            })}
          </g>

          {route && (
            <g className={styles.route}>
              <polyline points={route.points.map((p) => p.join(",")).join(" ")} className={styles.routeHalo} />
              <polyline points={route.points.map((p) => p.join(",")).join(" ")} className={styles.routeLine} />
              <circle cx={route.points[0][0]} cy={route.points[0][1]} r={7 * k} className={styles.routeStart} />
            </g>
          )}

          <g className={styles.poiLayer}>
            {visiblePois.map((p, i) => (
              <g key={`${p.kind}-${i}`} className={styles.poi} data-kind={p.kind} transform={`translate(${p.at[0]} ${p.at[1]}) scale(${k})`}>
                <title>{p.name ? `${t(`poi.${p.kind}`)}: ${p.name}` : t(`poi.${p.kind}`)}</title>
                <circle r={p.kind === "entrance" ? 7 : 9} />
                <path d={POI_ICON[p.kind]} transform="translate(-8 -8)" />
              </g>
            ))}
          </g>

          {/* Etykiety budynków: „pigułki” o stałym rozmiarze na ekranie. */}
          <g className={styles.labels}>
            {CAMPUS_BUILDINGS_LIST.map((b) => {
              const s = shapes[b.code];
              if (!s) return null;
              const w = (b.short.length * 7.6 + 12) * k, h = 19 * k;
              return (
                <g
                  key={b.code}
                  className={styles.pill}
                  data-kind={kindOf(b.code)}
                  data-active={building?.code === b.code || undefined}
                  onClick={() => !dragging && select(b.code)}
                >
                  <rect x={s.label[0] - w / 2} y={s.label[1] - h / 2} width={w} height={h} rx={h / 2} />
                  <text x={s.label[0]} y={s.label[1]}>{b.short}</text>
                </g>
              );
            })}
          </g>

          <g>
            {stops.map((s) => (
              <g
                key={s.name}
                className={styles.stop}
                data-active={stop === s.name || undefined}
                onClick={() => !dragging && (setTab("transit"), selectStop(s.name))}
              >
                <title>{s.name}</title>
                <circle cx={s.at[0]} cy={s.at[1]} />
                <text x={s.at[0]} y={s.at[1]}>{s.tram.length ? "T" : "A"}</text>
              </g>
            ))}
          </g>

          {me && (
            <g className={styles.me}>
              <circle cx={me[0]} cy={me[1]} r={16 * k} className={styles.mePulse} />
              <circle cx={me[0]} cy={me[1]} r={7 * k} />
            </g>
          )}
        </svg>

        <div className={styles.controls} onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => zoomBy(0.7)} aria-label={t("zoomIn")}>
            <Plus size={18} weight="bold" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => zoomBy(1 / 0.7)} aria-label={t("zoomOut")}>
            <Minus size={18} weight="bold" aria-hidden="true" />
          </button>
          <button type="button" onClick={showAll} aria-label={t("reset")}>
            <ArrowsIn size={18} weight="bold" aria-hidden="true" />
          </button>
          <button type="button" onClick={showMe} aria-label={t("locate")} aria-pressed={!!me}>
            <Crosshair size={18} weight="bold" aria-hidden="true" />
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")}>
            {fullscreen ? <CornersIn size={18} weight="bold" aria-hidden="true" /> : <ArrowsOut size={18} weight="bold" aria-hidden="true" />}
          </button>
        </div>

        {meState !== "idle" && meState !== "loading" && (
          <p className={styles.toast} role="status">
            {t(meState === "denied" ? "locateDenied" : "locateOutside")}
          </p>
        )}

        <div className={styles.legend} aria-hidden="true">
          {LEGEND.filter((kind) => kind !== "inne").map((kind) => (
            <span key={kind} className={styles.legendItem} data-kind={kind}>
              <i />
              {t(`legend.${kind}`)}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <form className={styles.search} onSubmit={onSearch} role="search">
          <label className="relative block">
            <span className="sr-only">{t("searchLabel")}</span>
            <MagnifyingGlass size={18} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              className={styles.searchInput}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setTab("buildings");
              }}
              placeholder={t("searchPlaceholder")}
              enterKeyHint="search"
            />
          </label>
          {parsed && (
            <button type="submit" className="mt-2 text-left text-[0.875rem] font-medium text-accent underline underline-offset-2">
              {parsed.room
                ? t("searchGoRoom", { building: parsed.building.name[locale], room: parsed.room })
                : t("searchGo", { building: parsed.building.name[locale] })}
            </button>
          )}
        </form>

        <div className={styles.tabs} role="tablist" aria-label={t("tabsLabel")}>
          {(["buildings", "points", "transit"] as Tab[]).map((key) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} className={styles.tab} onClick={() => setTab(key)}>
              {t(`tab.${key}`)}
            </button>
          ))}
        </div>

        <div className={styles.scroll} role="tabpanel">
          {tab === "buildings" && building && (
            <div className={styles.card}>
              <button
                type="button"
                className={styles.back}
                onClick={() => {
                  setPicked(null);
                  setQuery("");
                  setRoute(null);
                  showAll();
                }}
              >
                <ArrowLeft size={16} weight="bold" aria-hidden="true" />
                {t("back")}
              </button>
              <div className="mt-2 flex items-center gap-3">
                <span className={styles.chip} data-kind={kindOf(building.code)} data-strong="">
                  {building.short}
                </span>
                <h3 className="font-display text-[1.375rem] font-semibold leading-tight text-ink-primary">{building.name[locale]}</h3>
              </div>
              {address && <p className="mt-2 text-[0.9375rem] text-ink-secondary">{address}</p>}
              {selected?.room && <p className="mt-1 font-mono text-[0.875rem] text-accent">{t("room", { room: selected.room })}</p>}
              {!shape && <p className="mt-2 text-[0.875rem] text-ink-tertiary">{t("noShape")}</p>}

              {building.facts.length > 0 && (
                <ul className={styles.facts}>
                  {building.facts.map((f) => (
                    <li key={f.text.pl} className={styles.fact}>
                      {f.href ? (
                        <Link href={f.href} className="font-medium text-ink-primary underline-offset-4 hover:text-accent hover:underline">
                          {f.text[locale]}
                        </Link>
                      ) : (
                        f.text[locale]
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {shape && (
                <div className={styles.planner}>
                  <p className={styles.plannerTitle}>
                    <PersonSimpleWalk size={18} weight="bold" aria-hidden="true" />
                    {t("route.heading")}
                  </p>
                  <label className="mt-3 block">
                    <span className="block text-[0.8125rem] font-medium text-ink-secondary">{t("route.from")}</span>
                    <select
                      className={styles.select}
                      value={originValue}
                      onChange={(e) => {
                        const v = e.target.value;
                        setOrigin(v === "me" ? { kind: "me" } : v.startsWith("stop:") ? { kind: "stop", name: v.slice(5) } : { kind: "building", code: v.slice(9) });
                      }}
                    >
                      <optgroup label={t("route.stops")}>
                        {stops.map((s) => (
                          <option key={s.name} value={`stop:${s.name}`}>
                            {t("route.fromStop", { name: s.name })}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={t("route.buildings")}>
                        {CAMPUS_BUILDINGS_LIST.filter((b) => shapes[b.code] && b.code !== building.code).map((b) => (
                          <option key={b.code} value={`building:${b.code}`}>
                            {b.name[locale]}
                          </option>
                        ))}
                      </optgroup>
                      <option value="me">{t("route.fromMe")}</option>
                    </select>
                  </label>
                  <label className="mt-3 flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink-secondary">
                    <input type="checkbox" checked={noSteps} onChange={(e) => setNoSteps(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
                    {t("route.noSteps")}
                  </label>
                  <button type="button" className={`${styles.primary} mt-2`} onClick={planRoute} disabled={routeState === "loading"}>
                    <PersonSimpleWalk size={16} weight="bold" aria-hidden="true" />
                    {routeState === "loading" ? t("route.loading") : t("route.show")}
                  </button>
                  <div aria-live="polite">
                    {route && route.to === building.code && (
                      <p className={styles.routeResult}>
                        <strong>{t("route.result", { meters: Math.round(route.length / 10) * 10, minutes: walkMinutes(route.length) })}</strong>
                        {route.steps && <span className="block text-[0.8125rem] text-ink-tertiary">{t("route.viaSteps")}</span>}
                      </p>
                    )}
                    {routeState === "none" && <p className={styles.routeResult}>{t(origin.kind === "me" ? "route.noMe" : "route.none")}</p>}
                    {routeState === "error" && <p className={styles.routeResult}>{t("route.error")}</p>}
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                {shape ? (
                  <>
                    <a className={styles.secondary} href={routeHref(shape.geo[0], shape.geo[1])} target="_blank" rel="noopener noreferrer">
                      <NavigationArrow size={15} weight="bold" aria-hidden="true" />
                      {t("routeGoogle")}
                      <span className="sr-only"> ({t("newTab")})</span>
                    </a>
                    <a className={styles.secondary} href={`https://www.google.com/maps/search/?api=1&query=${shape.geo[0]},${shape.geo[1]}`} target="_blank" rel="noopener noreferrer">
                      {t("openGoogle")}
                      <ArrowSquareOut size={15} aria-hidden="true" />
                      <span className="sr-only"> ({t("newTab")})</span>
                    </a>
                  </>
                ) : address ? (
                  <a className={styles.primary} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">
                    <NavigationArrow size={16} weight="bold" aria-hidden="true" />
                    {t("openGoogle")}
                    <span className="sr-only"> ({t("newTab")})</span>
                  </a>
                ) : null}
              </div>

              {access && (
                <details className={styles.access}>
                  <summary>
                    {t("accessHeading")}
                    <CaretDown size={16} weight="bold" aria-hidden="true" />
                  </summary>
                  <div className={styles.accessBody}>
                    {access.summary && <p>{access.summary}</p>}
                    {ACCESS_ORDER.filter((key) => access.sections[key]?.length).map((key) => (
                      <div key={key}>
                        <h4>{t(`access.${key}`)}</h4>
                        {access.sections[key]!.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ))}
                    <p className="mt-3 text-[0.75rem]">{t("accessSource", { date: accessDate })}</p>
                    {locale === "en" && <p className="text-[0.75rem]">{t("accessPolishOnly")}</p>}
                  </div>
                </details>
              )}
            </div>
          )}

          {tab === "buildings" && !building && (
            <>
              {!query.trim() && (
                <div className="px-2 pt-3">
                  <p className={styles.groupLabel} style={{ padding: "0 0 8px" }}>{t("quick")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CAMPUS_TASKS.map((task) => (
                      <button key={task.label.pl} type="button" className={styles.quickChip} onClick={() => select(task.code)}>
                        {task.label[locale]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {GROUPS.map((group) => {
                const items = filtered.filter((b) => b.group === group);
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <p className={styles.groupLabel}>{t(`group.${group}`)}</p>
                    <ul>
                      {items.map((b) => (
                        <li key={b.code}>
                          <button type="button" className={styles.item} onClick={() => select(b.code)}>
                            <span className={styles.chip} data-kind={kindOf(b.code)}>{b.short}</span>
                            <span className="min-w-0">
                              <span className={`${styles.itemName} block`}>{b.name[locale]}</span>
                              {b.facts[0] && <span className={`${styles.itemMeta} block`}>{b.facts[0].text[locale]}</span>}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="px-2 py-6 text-[0.9375rem] text-ink-secondary">{t("searchNoMatch")}</p>}
            </>
          )}

          {tab === "points" && (
            <>
              <p className="px-2 pb-2 pt-3 text-[0.875rem] text-ink-secondary">{t("pointsLead")}</p>
              <ul className="px-1">
                {POI_KINDS.map((kind) => {
                  const count = pois.filter((p) => p.kind === kind).length;
                  if (!count) return null;
                  const on = layers.has(kind);
                  return (
                    <li key={kind}>
                      <label className={styles.layer}>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            setLayers((prev) => {
                              const next = new Set(prev);
                              if (next.has(kind)) next.delete(kind);
                              else next.add(kind);
                              return next;
                            })
                          }
                          className="h-4 w-4 accent-[var(--accent)]"
                        />
                        <svg viewBox="-10 -10 20 20" className={styles.layerIcon} data-kind={kind} aria-hidden="true">
                          <circle r={9} />
                          <path d={POI_ICON[kind]} transform="translate(-8 -8)" />
                        </svg>
                        <span className="flex-1">
                          <span className={`${styles.itemName} block`}>{t(`poi.${kind}`)}</span>
                          <span className={`${styles.itemMeta} block`}>{t(`poiNote.${kind}`, { count })}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="px-2 pt-3 text-[0.75rem] text-ink-tertiary">{t("pointsSource", { date: generatedAt })}</p>
            </>
          )}

          {tab === "transit" && (
            <>
              <p className="px-2 pb-2 pt-3 text-[0.875rem] text-ink-secondary">{t("transitLead")}</p>
              <ul>
                {stops.map((s) => {
                  const day = s.bus.filter((n) => Number(n) < 200);
                  const night = s.bus.filter((n) => Number(n) >= 200);
                  return (
                    <li key={s.name}>
                      <button type="button" className={styles.item} onClick={() => selectStop(s.name)} aria-pressed={stop === s.name}>
                        <span className="min-w-0">
                          <span className={`${styles.itemName} block`}>{s.name}</span>
                          <span className={styles.lines}>
                            {s.tram.map((n) => (
                              <span key={`t${n}`} className={styles.line} data-kind="tram" title={t("tram")}>{n}</span>
                            ))}
                            {day.map((n) => (
                              <span key={`b${n}`} className={styles.line} data-kind="bus" title={t("bus")}>{n}</span>
                            ))}
                            {night.map((n) => (
                              <span key={`n${n}`} className={styles.line} data-kind="night" title={t("night")}>{n}</span>
                            ))}
                          </span>
                          <span className="sr-only">
                            {[s.tram.length && `${t("tram")}: ${s.tram.join(", ")}`, day.length && `${t("bus")}: ${day.join(", ")}`, night.length && `${t("night")}: ${night.join(", ")}`]
                              .filter(Boolean)
                              .join(". ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="px-2 pt-4">
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => {
                    setOrigin({ kind: "stop", name: stop ?? stops[0].name });
                    select("L");
                  }}
                >
                  <PersonSimpleWalk size={16} weight="bold" aria-hidden="true" />
                  {t("transitWalk")}
                </button>
                <a className={`${styles.secondary} mt-2`} href={routeHref(officeGeo[0], officeGeo[1], "transit")} target="_blank" rel="noopener noreferrer">
                  <NavigationArrow size={15} weight="bold" aria-hidden="true" />
                  {t("transitRoute")}
                  <span className="sr-only"> ({t("newTab")})</span>
                </a>
                <p className="mt-3 text-[0.75rem] text-ink-tertiary">{t("transitLegend", { date: generatedAt })}</p>
              </div>
            </>
          )}
        </div>

        <p className={styles.credit}>{t("credit")}</p>
      </div>
    </div>
  );
}
