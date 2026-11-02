"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { MapPin, NavigationArrow, DownloadSimple, ArrowSquareOut } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { MapEmbed } from "../MapEmbed";
import { documents } from "@/lib/documents";
import { CAMPUS_BUILDINGS, isCampusBuilding } from "@/lib/campus";
import styles from "./MapaKampusuContent.module.css";

/**
 * Miejsca wyłącznie z treści serwisu (messages: mapa.locations). Zapytanie do
 * Map Google to ten sam adres, który widzi student, więc pinezka i podpis
 * zawsze się zgadzają.
 */
const places = [
  { key: "office", query: CAMPUS_BUILDINGS.L.query },
  { key: "campus", query: "Uniwersytet Ekonomiczny we Wrocławiu, ul. Komandorska 118/120, Wrocław" },
] as const;

type PlaceKey = (typeof places)[number]["key"] | "building";

const mapSrc = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
const routeHref = (q: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
const searchHref = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/**
 * `?budynek=A&sala=121` z linków na innych podstronach (np. dyżury
 * Dziekana). Na serwerze i przy hydratacji pusty.
 */
function useBuildingParam(): { building: keyof typeof CAMPUS_BUILDINGS; room: string | null } | null {
  const search = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const building = params.get("budynek")?.trim().toUpperCase();
  if (!isCampusBuilding(building)) return null;
  const room = params.get("sala")?.trim().slice(0, 12) || null;
  return { building, room };
}

export function MapaKampusuContent() {
  const t = useTranslations("mapa");
  const tc = useTranslations("common");
  const param = useBuildingParam();
  // Budynek L to siedziba Samorządu - pokazujemy istniejące miejsce zamiast duplikatu.
  const linked = param && param.building !== "L" ? param : null;
  const [picked, setPicked] = useState<PlaceKey | null>(null);
  const active: PlaceKey = picked ?? (linked ? "building" : "office");
  const sectionRef = useRef<HTMLElement>(null);

  const options = [
    ...(linked
      ? [{
          key: "building" as const,
          query: CAMPUS_BUILDINGS[linked.building].query,
          name: linked.room
            ? t("buildingRoom", { name: t(`buildings.${linked.building}.name`), room: linked.room })
            : t(`buildings.${linked.building}.name`),
          detail: t(`buildings.${linked.building}.detail`),
          note: t(`buildings.${linked.building}.note`),
        }]
      : []),
    ...places.map((p) => ({
      key: p.key,
      query: p.query,
      name: t(`locations.${p.key}.name`),
      detail: t(`locations.${p.key}.detail`),
      note: t(`locations.${p.key}.note`),
    })),
  ];
  const place = options.find((p) => p.key === active) ?? options[0];
  const placeName = place.name;

  // Wejście z linku do budynku: od razu do mapy, nie do nagłówka strony.
  const linkedBuilding = param?.building;
  useEffect(() => {
    if (!linkedBuilding) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [linkedBuilding]);

  const pathSteps = [
    { key: "street", value: "ul. Kamienna 44" },
    { key: "building", value: "L" },
    { key: "room", value: "110" },
  ];

  return (
    <>
      <section ref={sectionRef} className="section-padding scroll-mt-20" aria-labelledby="mapa-heading">
        <div className="mx-auto max-w-[1200px]">
          <h2
            id="mapa-heading"
            className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>

          <div className={`${styles.locator} mt-8`}>
            <div className={styles.places}>
              <fieldset className="min-w-0">
                <legend className={styles.legend}>{t("pickLegend")}</legend>
                {options.map((p) => (
                  <label key={p.key} className={styles.option}>
                    <input
                      type="radio"
                      name="mapa-miejsce"
                      value={p.key}
                      checked={active === p.key}
                      onChange={() => setPicked(p.key)}
                      className="sr-only"
                    />
                    <span className={styles.marker} aria-hidden="true">
                      <MapPin size={20} weight="fill" />
                    </span>
                    <span>
                      <span className={`${styles.name} block`}>{p.name}</span>
                      <span className={`${styles.detail} block`}>{p.detail}</span>
                      <span className={`${styles.note} block`}>{p.note}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className={styles.actions}>
                <a
                  href={routeHref(place.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primary}
                >
                  <NavigationArrow size={18} weight="bold" aria-hidden="true" />
                  {t("routeTo", { place: placeName })}
                  <span className="sr-only"> ({tc("newTab")})</span>
                </a>
                <a
                  href={searchHref(place.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 text-[0.9375rem] font-medium text-accent transition-colors hover:text-accent-dim"
                >
                  {t("openInMaps")}
                  <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
                  <span className="sr-only"> ({tc("newTab")})</span>
                </a>
              </div>
            </div>

            <MapEmbed
              src={mapSrc(place.query)}
              title={`${t("mapTitle")}: ${placeName}`}
              address={`${placeName}, ${place.detail}`}
              loadLabel={t("mapLoad")}
              consentNote={t("mapConsent")}
              className="h-[360px] lg:h-full lg:min-h-[460px]"
            />
          </div>
        </div>
      </section>

      <section className="section-padding pt-0" aria-labelledby="mapa-path-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="mapa-path-heading"
              className="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
            >
              {t("pathHeading")}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">
              {t("pathLead")}
            </p>
          </ScrollReveal>

          <div className={`${styles.pathWrap} mt-12`}>
            <ol className={styles.path}>
              {pathSteps.map((step, i) => (
                <li key={step.key} className={styles.step} style={{ "--i": i } as CSSProperties}>
                  <span className={styles.dot} aria-hidden="true" />
                  <p className={styles.stepLabel}>{t(`path.${step.key}`)}</p>
                  <p className={styles.stepValue}>{step.value}</p>
                </li>
              ))}
            </ol>
          </div>

          {documents.mapa.href && (
            <ScrollReveal className="mt-14 flex flex-col gap-4 border-t border-border-medium pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[60ch] text-pretty text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("planNote")}</p>
              <a
                href={documents.mapa.href}
                {...(documents.mapa.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : { download: true })}
                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-lg border border-border-strong px-6 text-[0.9375rem] font-medium text-ink-primary transition-[background-color,transform] duration-150 ease-out hover:bg-bg-elevated active:scale-[0.97] motion-reduce:active:scale-100"
              >
                <DownloadSimple size={18} weight="regular" aria-hidden="true" />
                {t("downloadButton")}
                {documents.mapa.external && <span className="sr-only"> ({tc("newTab")})</span>}
              </a>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
