"use client";

import { useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { MapPin, NavigationArrow, DownloadSimple, ArrowSquareOut } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { MapEmbed } from "../MapEmbed";
import { documents } from "@/lib/documents";
import styles from "./MapaKampusuContent.module.css";

/**
 * Miejsca wyłącznie z treści serwisu (messages: mapa.locations). Zapytanie do
 * Map Google to ten sam adres, który widzi student, więc pinezka i podpis
 * zawsze się zgadzają.
 */
const places = [
  { key: "office", query: "ul. Kamienna 44, 53-307 Wrocław" },
  { key: "campus", query: "Uniwersytet Ekonomiczny we Wrocławiu, ul. Komandorska 118/120, Wrocław" },
] as const;

type PlaceKey = (typeof places)[number]["key"];

const mapSrc = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
const routeHref = (q: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
const searchHref = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function MapaKampusuContent() {
  const t = useTranslations("mapa");
  const tc = useTranslations("common");
  const [active, setActive] = useState<PlaceKey>("office");
  const place = places.find((p) => p.key === active) ?? places[0];
  const placeName = t(`locations.${place.key}.name`);

  const pathSteps = [
    { key: "street", value: "ul. Kamienna 44" },
    { key: "building", value: "L" },
    { key: "room", value: "110" },
  ];

  return (
    <>
      <section className="section-padding" aria-labelledby="mapa-heading">
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
                {places.map((p) => (
                  <label key={p.key} className={styles.option}>
                    <input
                      type="radio"
                      name="mapa-miejsce"
                      value={p.key}
                      checked={active === p.key}
                      onChange={() => setActive(p.key)}
                      className="sr-only"
                    />
                    <span className={styles.marker} aria-hidden="true">
                      <MapPin size={20} weight="fill" />
                    </span>
                    <span>
                      <span className={`${styles.name} block`}>{t(`locations.${p.key}.name`)}</span>
                      <span className={`${styles.detail} block`}>{t(`locations.${p.key}.detail`)}</span>
                      <span className={`${styles.note} block`}>{t(`locations.${p.key}.note`)}</span>
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
              address={`${placeName}, ${t(`locations.${place.key}.detail`)}`}
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
