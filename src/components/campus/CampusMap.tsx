"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowSquareOut, ArrowsIn, CaretDown, MagnifyingGlass, Minus, NavigationArrow, Plus } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { CAMPUS_BUILDINGS_LIST, CAMPUS_TASKS, findBuilding, parseRoomQuery, type CampusBuilding } from "@/lib/campus-buildings";
import type { AccessSection, CampusMapProps } from "@/lib/campus-map-data";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./CampusMap.module.css";

/**
 * Interaktywny plan kampusu (wzór: mapa AI4Business, wykonanie nasze).
 *
 * - Plan rysujemy sami z danych OpenStreetMap: bez Google i plików cookie,
 *   w kolorach strony. Google zostaje tylko jako „Wyznacz trasę”.
 * - Lista w panelu jest pełnoprawnym sterowaniem dla klawiatury i czytnika -
 *   budynki na planie to skrót dla myszy i palca (SVG jest role="img").
 * - `?budynek=A&sala=121` z innych podstron zaznacza budynek i salę.
 */

type Tab = "buildings" | "tasks" | "transit";
type ViewBox = [number, number, number, number];

const MIN_W = 120;
const ACCESS_ORDER: AccessSection[] = ["entrance", "inside", "rooms", "toilets", "stairs", "service", "extras", "parking"];
const GROUPS: CampusBuilding["group"][] = ["kampus", "kamienna", "akademiki", "poza"];

/** Prostokąt obrysu z „M x yLx y…Z”. */
function boundsOf(d: string): ViewBox {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
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

export function CampusMap({ children, viewBox: FULL, shapes, stops, generatedAt, access: accessAll, accessDate, addresses }: CampusMapProps & { children: ReactNode }) {
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
  // Szerokość okna mapy w pikselach - z niej skala --k (metry na piksel), żeby
  // podpisy i pinezki miały stały rozmiar na ekranie przy każdym przybliżeniu.
  const [px, setPx] = useState(0);

  // Wybór z linku obowiązuje, dopóki ktoś nie kliknie czegoś innego.
  const selected = picked ?? fromUrl;
  const building = selected ? CAMPUS_BUILDINGS_LIST.find((b) => b.code === selected.code) ?? null : null;

  const wrapRef = useRef<HTMLDivElement>(null);
  const vbRef = useRef(vb);
  const anim = useRef<number | null>(null);
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
      const from = vbRef.current, start = performance.now(), dur = 480;
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

  const focusBuilding = useCallback(
    (code: string) => {
      const shape = shapes[code];
      if (shape) flyTo(fit(boundsOf(shape.d), aspect()));
    },
    [flyTo, shapes, aspect],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPx(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Wejście z linku (?budynek=): od razu najazd na budynek i przewinięcie do mapy.
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
    setTab("buildings");
    focusBuilding(code);
  };

  const selectStop = (name: string) => {
    const s = stops.find((x) => x.name === name);
    if (!s) return;
    setStop(name);
    flyTo(fit([s.at[0] - 90, s.at[1] - 90, 180, 180], aspect(), 1));
  };

  // ---------- przesuwanie i przybliżanie ----------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);

  const zoomBy = useCallback((factor: number, cx?: number, cy?: number) => {
    const [x, y, w, h] = vbRef.current;
    const nw = Math.min(FULL[2] * 1.6, Math.max(MIN_W, w * factor));
    const k = nw / w;
    const px = cx ?? x + w / 2, py = cy ?? y + h / 2;
    setView([px - (px - x) * k, py - (py - y) * k, nw, h * k]);
  }, [FULL, setView]);

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

  return (
    <div className={styles.shell}>
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
          style={{ "--k": px ? vb[2] / px : FULL[2] / 800 } as React.CSSProperties}
          viewBox={vb.join(" ")}
          role="img" aria-label={t("mapLabel")} preserveAspectRatio="xMidYMid meet">
          {children}
          <g className={styles.buildings} data-has-active={building ? "" : undefined}>
            {CAMPUS_BUILDINGS_LIST.map((b) => {
              const s = shapes[b.code];
              if (!s) return null;
              return (
                <g
                  key={b.code}
                  className={styles.building}
                  data-active={building?.code === b.code || undefined}
                  onClick={() => !dragging && select(b.code)}
                >
                  <title>{b.name[locale]}</title>
                  <path d={s.d} />
                  <text x={s.label[0]} y={s.label[1]}>{b.short}</text>
                </g>
              );
            })}
          </g>
          <g>
            {stops.map((s) => (
              <g key={s.name} className={styles.stop} data-active={stop === s.name || undefined} onClick={() => !dragging && (setTab("transit"), selectStop(s.name))}>
                <title>{s.name}</title>
                <circle cx={s.at[0]} cy={s.at[1]} />
                <text x={s.at[0]} y={s.at[1]}>{s.tram.length ? "T" : "A"}</text>
              </g>
            ))}
          </g>
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
        </div>
        <p className={styles.hint} aria-hidden="true">{t("hint")}</p>
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
              {parsed.room ? t("searchGoRoom", { building: parsed.building.name[locale], room: parsed.room }) : t("searchGo", { building: parsed.building.name[locale] })}
            </button>
          )}
        </form>

        <div className={styles.tabs} role="tablist" aria-label={t("tabsLabel")}>
          {(["buildings", "tasks", "transit"] as Tab[]).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={styles.tab} onClick={() => setTab(k)}>
              {t(`tab.${k}`)}
            </button>
          ))}
        </div>

        <div className={styles.scroll} role="tabpanel">
          {tab === "buildings" && building && (
            <div className={styles.card}>
              <button type="button" className={styles.back} onClick={() => (setPicked(null), setQuery(""), showAll())}>
                <ArrowLeft size={16} weight="bold" aria-hidden="true" />
                {t("back")}
              </button>
              <div className="mt-2 flex items-center gap-3">
                <span className={styles.chip} data-strong="">{building.short}</span>
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

              <div className={styles.actions}>
                {shape ? (
                  <>
                    <a className={styles.primary} href={routeHref(shape.geo[0], shape.geo[1])} target="_blank" rel="noopener noreferrer">
                      <NavigationArrow size={16} weight="bold" aria-hidden="true" />
                      {t("route")}
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
                    {ACCESS_ORDER.filter((k) => access.sections[k]?.length).map((k) => (
                      <div key={k}>
                        <h4>{t(`access.${k}`)}</h4>
                        {access.sections[k]!.map((line) => (
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

          {tab === "buildings" && !building &&
            GROUPS.map((group) => {
              const items = filtered.filter((b) => b.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <p className={styles.groupLabel}>{t(`group.${group}`)}</p>
                  <ul>
                    {items.map((b) => (
                      <li key={b.code}>
                        <button type="button" className={styles.item} onClick={() => select(b.code)}>
                          <span className={styles.chip}>{b.short}</span>
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
          {tab === "buildings" && !building && filtered.length === 0 && (
            <p className="px-2 py-6 text-[0.9375rem] text-ink-secondary">{t("searchNoMatch")}</p>
          )}

          {tab === "tasks" && (
            <>
              <p className="px-2 pb-2 pt-3 text-[0.875rem] text-ink-secondary">{t("tasksLead")}</p>
              <ul>
                {CAMPUS_TASKS.map((task) => {
                  const b = CAMPUS_BUILDINGS_LIST.find((x) => x.code === task.code)!;
                  return (
                    <li key={task.label.pl}>
                      <button type="button" className={styles.item} onClick={() => select(task.code)}>
                        <span className={styles.chip}>{b.short}</span>
                        <span className="min-w-0">
                          <span className={`${styles.itemName} block`}>{task.label[locale]}</span>
                          <span className={`${styles.itemMeta} block`}>{b.name[locale]}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
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
                            {[s.tram.length && `${t("tram")}: ${s.tram.join(", ")}`, day.length && `${t("bus")}: ${day.join(", ")}`, night.length && `${t("night")}: ${night.join(", ")}`].filter(Boolean).join(". ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="px-2 pt-4">
                <a className={styles.primary} href={routeHref(officeGeo[0], officeGeo[1], "transit")} target="_blank" rel="noopener noreferrer">
                  <NavigationArrow size={16} weight="bold" aria-hidden="true" />
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
