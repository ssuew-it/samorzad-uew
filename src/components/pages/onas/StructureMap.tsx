"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react";
import { Link, useRouter } from "@/i18n/navigation";
import { zoomInto } from "./zoomInto";
import styles from "./StructureMap.module.css";

/**
 * Struktura Samorządu jako siatka, przez którą wchodzi się do podstron.
 *
 * Środek to „Studenci UEW · w tym Ty” — z mocy ustawy Samorząd to wszyscy
 * studenci, a organy działają w ich imieniu. Od środka biegną linie do organów.
 *
 * Ruch ma znaczenie, nie ozdabia:
 *  - najechanie/fokus na organ rysuje linię od środka do niego i przygasza
 *    resztę — widać relację „Ty → ten organ”; panel obok mówi, co organ robi;
 *  - kliknięcie to „wejście przez węzeł” (zoomInto.ts): z węzła rozchodzi
 *    się kolor, siatka przybliża się, pojawia się nazwa organu, a pod tą
 *    zasłoną ładuje się jego podstrona;
 *  - siatka kropek w tle jaśnieje pod kursorem (tylko precyzyjny wskaźnik).
 *
 * Na telefonie ta sama treść układa się w pionową ścieżkę: środek u góry,
 * organy pod nim na jednej linii, opis od razu przy nazwie (bez najechania).
 */

type OrganKey = "chair" | "board" | "russ" | "audit" | "election" | "branch";
type ActiveKey = OrganKey | "center";

interface Organ {
  key: OrganKey;
  href?: string;
  /** Przestrzeń tłumaczeń strony docelowej — jej heroTitle pokazuje zasłona. */
  dest?: "zarzad" | "russ" | "skw" | "filia";
  /** Położenie punktu zaczepienia na siatce (procent szerokości / wysokości mapy). */
  x: number;
  y: number;
  /**
   * Którą krawędzią pigułka siedzi na punkcie. Węzły przy brzegach rosną do
   * środka mapy — wyśrodkowana długa nazwa („Rada Uczelniana…”) wychodziła
   * poza mapę i wjeżdżała na panel opisu. Linia kończy się pod pigułką.
   */
  align: "start" | "center" | "end";
}

const CENTER = { x: 50, y: 54 };

const ORGANS: Organ[] = [
  { key: "chair", href: "/zarzad", dest: "zarzad", x: 50, y: 9, align: "center" },
  { key: "board", href: "/zarzad", dest: "zarzad", x: 3, y: 30, align: "start" },
  { key: "russ", href: "/rada-uczelniana-samorzadu-studentow", dest: "russ", x: 97, y: 30, align: "end" },
  { key: "election", href: "/studencka-komisja-wyborcza", dest: "skw", x: 3, y: 80, align: "start" },
  { key: "audit", x: 97, y: 80, align: "end" },
  { key: "branch", href: "/filia-jelenia-gora", dest: "filia", x: 50, y: 97, align: "center" },
];

const SHIFT = { start: "0%", center: "-50%", end: "-100%" } as const;
const ORIGIN = { start: "left center", center: "center", end: "right center" } as const;

type Point = { x: number; y: number };

/**
 * Łagodny łuk od środka do węzła — prosta kreska wyglądała jak schemat z
 * PowerPointa. Liczony w pikselach mapy, nie w procentach: przy rozciągniętym
 * viewBoxie trzeba by `vector-effect: non-scaling-stroke`, a z nim Chrome
 * ignoruje `pathLength` i rysowanie linii (dashoffset) przestaje działać.
 */
function arc(from: Point, to: Point, size: { w: number; h: number }) {
  const a = { x: (from.x / 100) * size.w, y: (from.y / 100) * size.h };
  const b = { x: (to.x / 100) * size.w, y: (to.y / 100) * size.h };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Odchylenie prostopadłe do odcinka, zawsze „na zewnątrz” od pionowej osi.
  const bend = 0.12 * Math.sign(dx || 1);
  const cx = (a.x + b.x) / 2 - dy * bend;
  const cy = (a.y + b.y) / 2 + dx * bend;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

export function StructureMap() {
  const t = useTranslations("oNas.structure");
  // Zasłona pokazuje DOKŁADNY tytuł strony docelowej (nie nazwę z węzła),
  // bo na końcu ląduje w jego miejscu — inny napis podmieniałby się na oczach.
  const tRoot = useTranslations();
  const router = useRouter();
  const [active, setActive] = useState<ActiveKey>("center");
  const gridRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Rozmiar mapy dla linii w pikselach. Na telefonie mapa jest listą i linii
  // nie ma (CSS je chowa), więc pomiar niczego tam nie psuje.
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Światło pod kursorem: zmienne ustawiamy na samej warstwie siatki, nie na
  // kontenerze, żeby nie przeliczać stylów wszystkich węzłów przy ruchu myszy.
  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !gridRef.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    gridRef.current.style.setProperty("--mx", `${e.clientX - box.left}px`);
    gridRef.current.style.setProperty("--my", `${e.clientY - box.top}px`);
  }, []);

  /**
   * Kliknięcie węzła: zasłona „wejścia przez węzeł”, a pod nią nawigacja.
   * Kliknięcia z modyfikatorem (nowa karta), środkowy przycisk i ograniczony
   * ruch zostają zwykłym linkiem. Na telefonie mapa jest listą — tam też
   * zwykła nawigacja, bo zasłona z wąskiego wiersza nie ma sensu.
   */
  const enter = (e: MouseEvent<HTMLAnchorElement>, href: string, name: string) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)").matches) return;
    e.preventDefault();
    const box = e.currentTarget.getBoundingClientRect();
    const color = mapRef.current
      ? getComputedStyle(mapRef.current).getPropertyValue("--organ-bg").trim() || "#1837c9"
      : "#1837c9";
    zoomInto({
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
      r: box.height / 2,
      label: name,
      color,
    });
    router.push(href);
  };

  const label = (key: ActiveKey, field: "name" | "verb" | "role") =>
    key === "center" ? t(`center.${field}`) : t(`organs.${key}.${field}`);

  const activeOrgan = ORGANS.find((o) => o.key === active);

  return (
    <div className={styles.wrap} data-active={active}>
      <div
        ref={mapRef}
        className={styles.map}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive("center")}
      >
        <div ref={gridRef} className={styles.grid} aria-hidden="true" />

        {size.w > 0 && (
        <svg className={styles.lines} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
          {ORGANS.map((organ, i) => {
            const d = arc(CENTER, organ, size);
            return (
              <g key={organ.key} style={{ "--i": i } as CSSProperties}>
                <path d={d} pathLength={1} className={styles.line} />
                <path
                  d={d}
                  pathLength={1}
                  className={styles.lineActive}
                  data-on={active === organ.key || undefined}
                />
              </g>
            );
          })}
          {/* Przewodniczący kieruje Zarządem — jedyna relacja poza środkiem. */}
          <path
            d={`M ${(ORGANS[0].x / 100) * size.w} ${(ORGANS[0].y / 100) * size.h} L ${(ORGANS[1].x / 100) * size.w} ${(ORGANS[1].y / 100) * size.h}`}
            className={`${styles.line} ${styles.lineDashed}`}
          />
        </svg>
        )}

        {/* Środek: wszyscy studenci. */}
        <button
          type="button"
          className={styles.center}
          // Zmienne, nie left/top inline: na telefonie środek jest zwykłym
          // blokiem (position: relative) i left: 50% wypychał go poza ekran.
          style={{ "--x": `${CENTER.x}%`, "--y": `${CENTER.y}%` } as CSSProperties}
          onPointerEnter={() => setActive("center")}
          onFocus={() => setActive("center")}
          aria-describedby="smap-center-role"
        >
          <span className={styles.ripple} aria-hidden="true" />
          <span className={styles.ripple} aria-hidden="true" />
          <span className={styles.centerName}>{t("center.name")}</span>
          <span className={styles.centerYou}>{t("center.you")}</span>
        </button>
        <span id="smap-center-role" className="sr-only">
          {t("center.role")}
        </span>

        <ol className={styles.nodes}>
          {ORGANS.map((organ, i) => {
            const name = t(`organs.${organ.key}.name`);
            const content = (
              <>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.nodeText}>
                  <span className={styles.nodeName}>{name}</span>
                  <span className={styles.nodeVerb}>{t(`organs.${organ.key}.verb`)}</span>
                  <span className={styles.nodeRole} id={`smap-role-${organ.key}`}>
                    {t(`organs.${organ.key}.role`)}
                  </span>
                </span>
                {organ.href && (
                  <ArrowRight size={16} weight="bold" aria-hidden="true" className={styles.nodeArrow} />
                )}
              </>
            );
            const common = {
              className: styles.node,
              "data-active": active === organ.key || undefined,
              onPointerEnter: () => setActive(organ.key),
              onFocus: () => setActive(organ.key),
              "aria-describedby": `smap-role-${organ.key}`,
            };
            return (
              <li
                key={organ.key}
                className={styles.nodeItem}
                style={{ "--x": `${organ.x}%`, "--y": `${organ.y}%`, "--tx": SHIFT[organ.align], "--origin": ORIGIN[organ.align], "--i": i } as CSSProperties}
              >
                {organ.href ? (
                  <Link href={organ.href} {...common} onClick={(e) => enter(e, organ.href!, organ.dest ? tRoot(`${organ.dest}.heroTitle`) : name)}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" {...common}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Panel opisu — wizualny odpowiednik opisów, które czytnik dostaje
          przez aria-describedby przy każdym węźle. */}
      <div className={styles.panel} aria-hidden="true">
        <div key={active} className={styles.panelInner}>
          <p className={styles.panelVerb}>{label(active, "verb")}</p>
          <p className={styles.panelName}>{label(active, "name")}</p>
          <p className={styles.panelRole}>{label(active, "role")}</p>
          <p className={styles.panelHint}>
            {active === "center"
              ? t("hint")
              : activeOrgan?.href
                ? (
                  <>
                    {t("enter")}
                    <ArrowRight size={16} weight="bold" />
                  </>
                )
                : t("noPage")}
          </p>
        </div>
      </div>
    </div>
  );
}
