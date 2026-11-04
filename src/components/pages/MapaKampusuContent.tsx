"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DownloadSimple } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { documents } from "@/lib/documents";
import styles from "./MapaKampusuContent.module.css";

/**
 * Mapa kampusu: interaktywny plan (przekazany z serwera - tło planu renderuje
 * się na serwerze, patrz components/campus), pod nim droga do Samorządu
 * „adres → budynek → piętro i pokój” i oficjalny plan Uczelni do pobrania.
 */
export function MapaKampusuContent({ map }: { map: ReactNode }) {
  const t = useTranslations("mapa");

  const pathSteps = [
    { key: "street", value: "ul. Kamienna 44" },
    { key: "building", value: "L" },
    { key: "room", value: t("pathRoomValue") },
  ];

  return (
    <>
      <section className="section-padding scroll-mt-20" aria-labelledby="mapa-heading">
        <div className="mx-auto max-w-[1320px]">
          <h2
            id="mapa-heading"
            className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="mt-3 max-w-[64ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("lead")}</p>
          <div className="mt-8">{map}</div>
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
            <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("pathLead")}</p>
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
                download
                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-lg border border-border-strong px-6 text-[0.9375rem] font-medium text-ink-primary transition-[background-color,transform] duration-150 ease-out hover:bg-bg-elevated active:scale-[0.97] motion-reduce:active:scale-100"
              >
                <DownloadSimple size={18} weight="regular" aria-hidden="true" />
                {t("downloadButton")}
              </a>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
