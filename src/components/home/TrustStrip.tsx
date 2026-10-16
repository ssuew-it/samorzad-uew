"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Pause, Play } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { partners } from "@/lib/partners";
import styles from "./TrustStrip.module.css";

/**
 * Pas „Zaufali nam” na stronie głównej — ciche potwierdzenie wiarygodności,
 * które prowadzi do pełnej listy na /partnerzy.
 *
 * Trzy rzeczy, których zwykła karuzela logotypów nie ma, a powinna:
 * - PRZYCISK PAUZY. Ruch trwający dłużej niż 5 s obok innej treści trzeba
 *   móc zatrzymać (WCAG 2.2.2) — z klawiatury i na telefonie, nie tylko
 *   najechaniem myszą.
 * - LISTA NAZW dla czytników ekranu. Przesuwający się pas jest dla nich
 *   ukryty (powtarza się dwa razy), więc nazwy dostają osobną, zwykłą listę.
 * - BEZ SZWU. Dwie identyczne grupy, każda z odstępem na końcu, przesuwane
 *   o dokładnie połowę — pętla nie przeskakuje o pół odstępu.
 */
export function TrustStrip() {
  const t = useTranslations("trustStrip");
  const [paused, setPaused] = useState(false);

  if (partners.length === 0) return null;

  const group = (hidden: boolean) => (
    <ul className={styles.group} aria-hidden={hidden || undefined}>
      {partners.map((p) => (
        <li key={p.name} className={styles.tile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.logo} alt="" loading="lazy" decoding="async" className={styles.logo} />
        </li>
      ))}
    </ul>
  );

  return (
    <section className={styles.strip} aria-labelledby="trust-strip-title">
      <div className={styles.head}>
        <h2 id="trust-strip-title" className={styles.title}>
          {t("title")}
        </h2>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.pause}
            aria-pressed={paused}
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? <Play size={14} weight="fill" aria-hidden="true" /> : <Pause size={14} weight="fill" aria-hidden="true" />}
            <span>{paused ? t("play") : t("pause")}</span>
          </button>
          <Link href="/partnerzy" className={styles.all}>
            {t("all")}
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Nazwy dla czytników ekranu — pas niżej jest dla nich ukryty. */}
      <ul className="sr-only">
        {partners.map((p) => (
          <li key={p.name}>{p.name}</li>
        ))}
      </ul>

      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.track} data-paused={paused ? "true" : undefined}>
          {group(false)}
          {group(true)}
        </div>
      </div>
    </section>
  );
}
