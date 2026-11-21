"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Lightbulb } from "@phosphor-icons/react";
import { ProjectLogo } from "../ProjectLogo";
import type { ProjectLogo as ProjectLogoData } from "@/lib/photos";
import { wybierzTemat } from "@/lib/wspolpraca";
import styles from "./Wspolpraca.module.css";

/** Logotypy o podobnej powierzchni niezależnie od proporcji (jak na kafelkach projektów). */
function wysokoscLogo(logo: ProjectLogoData) {
  const ratio = logo.light.width / logo.light.height;
  return Math.round(Math.min(44, Math.max(22, Math.sqrt(2600 / ratio))));
}

export interface Potrzeba {
  key: string;
  label: string;
  offers: { title: string; desc: string; logo: ProjectLogoData | null; projectName: string | null }[];
}

/**
 * „Potrzebuję:” - partner wybiera potrzebę, a pod spodem od razu stoją
 * gotowe propozycje (projekt + forma). „Zapytaj o tę propozycję” wpisuje
 * temat do formularza na dole strony.
 */
export function PotrzebujeDopasowanie({
  items,
  labels,
}: {
  items: Potrzeba[];
  labels: { need: string; proposals: string; ask: string; draft: string; note: string };
}) {
  const ids = useId();
  const [selected, setSelected] = useState(0);
  const need = items[selected];

  return (
    <>
      <fieldset className={styles.needs}>
        <legend className={styles.needLegend}>{labels.need}</legend>
        <div className={styles.needList}>
          {items.map((it, i) => (
            <label key={it.key} className={styles.need}>
              <input type="radio" name={`${ids}-potrzeba`} value={it.key} checked={selected === i} onChange={() => setSelected(i)} aria-controls={`${ids}-oferty`} />
              <span>{it.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <section id={`${ids}-oferty`} aria-label={labels.proposals} aria-live="polite">
        <ul key={need.key} className={styles.offers}>
          {need.offers.map((o) => (
            <li key={o.title} className={`${styles.offer} ${styles.swap}`}>
              <div className={styles.offerLogo}>
                {o.logo ? (
                  <ProjectLogo logo={o.logo} height={44} alt={o.projectName ?? ""} className="max-w-full" style={{ height: wysokoscLogo(o.logo) }} />
                ) : (
                  <span className={styles.offerMark} aria-hidden="true">
                    <Lightbulb size={22} weight="duotone" />
                  </span>
                )}
              </div>
              <div className={styles.offerBody}>
                <h3>{o.title}</h3>
                <p>{o.desc}</p>
              </div>
              <a
                href="#kontakt-partnerzy"
                className={styles.ask}
                onClick={() => wybierzTemat({ message: `${labels.draft.replace("{offer}", o.title)}\n\n`, topic: o.title })}
              >
                {labels.ask}
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                <span className="sr-only">: {o.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <p className={styles.note}>{labels.note}</p>
    </>
  );
}
