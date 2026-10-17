"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Calculator, CaretDown } from "@phosphor-icons/react";
import styles from "./KalkulatorZwijany.module.css";

/**
 * Kalkulator średniej schowany za kartą.
 *
 * Pełna tabela przedmiotów zajmowała w środku huba ok. dwóch ekranów, także
 * u kogoś, kto przyszedł po stypendium socjalne. Teraz to karta, która
 * rozwija kalkulator na żądanie.
 *
 * Strefa studenta i strona główna linkują wprost do `/stypendia#kalkulator`,
 * więc wejście z taką kotwicą (i każda późniejsza zmiana kotwicy na nią)
 * rozwija kalkulator sam — inaczej link prowadziłby do zamkniętej karty.
 *
 * Rozwijanie: przejście `grid-template-rows` 0fr → 1fr, bez mierzenia
 * wysokości w JS. Zwinięta treść jest `inert`, więc nie łapie fokusu.
 */
export function KalkulatorZwijany({ children }: { children: ReactNode }) {
  const t = useTranslations("stypendia.calc");
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#kalkulator") setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <section id="kalkulator" className="section-padding scroll-mt-24 pt-0" aria-labelledby={`${panelId}-title`}>
      <div className="mx-auto max-w-[1200px]">
        <div className={styles.card} data-open={open ? "true" : undefined}>
          <div className={styles.head}>
            <span className={styles.icon} aria-hidden="true">
              <Calculator size={24} weight="regular" />
            </span>
            <div className={styles.text}>
              <h2 id={`${panelId}-title`} className={styles.title}>
                {t("title")}
              </h2>
              <p className={styles.desc}>{t("desc")}</p>
            </div>
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? t("close") : t("open")}
              <CaretDown size={16} weight="bold" aria-hidden="true" className={styles.caret} />
            </button>
          </div>

          <div id={panelId} className={styles.panel} inert={!open}>
            <div className={styles.panelInner}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
