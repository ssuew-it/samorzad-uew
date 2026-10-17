"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./ProcesWniosku.module.css";

const STEPS = ["print", "submit", "decision"] as const;

/**
 * „Jak złożyć wniosek” — wspólny proces dla wszystkich świadczeń, raz.
 *
 * Wcześniej te same trzy kroki stały osobno przy stypendium Rektora,
 * socjalnym, dla osób z niepełnosprawnością i przy zapomodze. Teraz jedna oś,
 * która rysuje się razem z przewijaniem (CSS, `animation-timeline: view()`),
 * a każde świadczenie niżej mówi już tylko o tym, czym się różni.
 *
 * Grafika (Higgsfield) to obiekt-symbol w serii szklanych przedmiotów marki,
 * celowo bez ludzi. Dwie wersje pod motyw jasny i ciemny.
 */
export function ProcesWniosku() {
  const t = useTranslations("stypendia");
  const td = useTranslations("stypendiumDetail");

  return (
    <section id="jak-zlozyc" className={`section-padding scroll-mt-24 ${styles.section}`} aria-labelledby="jak-zlozyc-heading">
      <div className={`mx-auto max-w-[1200px] ${styles.grid}`}>
        <div className={styles.art} aria-hidden="true">
          <Image
            src="/photos/stypendia/monety-jasne.webp"
            alt=""
            width={900}
            height={1125}
            sizes="(max-width: 899px) 70vw, 400px"
            className={`${styles.artImg} ${styles.artLight}`}
          />
          <Image
            src="/photos/stypendia/monety-ciemne.webp"
            alt=""
            width={900}
            height={1125}
            sizes="(max-width: 899px) 70vw, 400px"
            className={`${styles.artImg} ${styles.artDark}`}
          />
        </div>

        <div>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">{t("process.eyebrow")}</p>
          <h2
            id="jak-zlozyc-heading"
            className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-ink-primary"
          >
            {t("process.heading")}
          </h2>
          <p className="mt-4 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("process.lead")}</p>

          <ol className={styles.steps}>
            <span className={styles.rail} aria-hidden="true">
              <span className={styles.railFill} />
            </span>
            {STEPS.map((step, i) => (
              <li key={step} className={styles.step}>
                <span className={styles.node} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{td(`steps.${step}.title`)}</h3>
                  <p className={styles.stepDesc}>{td(`steps.${step}.desc`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
