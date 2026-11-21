"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { ArrowRight, ArrowUpRight, Check } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { ProjectLogo } from "../ProjectLogo";
import type { ProjectLogo as ProjectLogoData } from "@/lib/photos";
import { wybierzTemat } from "@/lib/wspolpraca";
import { useWybor } from "./useWybor";
import type { ZdjecieDane } from "./WspolpracaAtuty";
import styles from "./Wspolpraca.module.css";

/**
 * Wysokość logotypu na kafelku dobrana do proporcji: podłużne niższe,
 * zwarte wyższe - wszystkie zajmują podobną powierzchnię (jak na głównej).
 */
function wysokoscLogo(logo: ProjectLogoData) {
  const ratio = logo.light.width / logo.light.height;
  return Math.round(Math.min(64, Math.max(26, Math.sqrt(4200 / ratio))));
}

export interface ProjektPartnerski {
  key: string;
  name: string;
  when: string;
  desc: string;
  forms: string[];
  photo: ZdjecieDane;
  logo: ProjectLogoData;
  /** Szkic wiadomości do formularza po „Porozmawiajmy o tym projekcie”. */
  draft: string;
}

/**
 * „Nasze projekty” dla partnerów: kafelki z logotypami, a pod nimi duży
 * panel wybranego projektu - zdjęcie, opis, formy zaangażowania i przejście
 * do formularza z wpisanym tematem.
 */
export function ProjektyPartnerskie({
  items,
  labels,
}: {
  items: ProjektPartnerski[];
  labels: { list: string; when: string; forms: string; more: string; ask: string };
}) {
  const ids = useId();
  const panelId = `${ids}-panel`;
  const tab = (i: number) => `${ids}-tab-${i}`;
  const { selected, instant, onKeyDown, tabProps } = useWybor(items.length);
  const panelRef = useRef<HTMLDivElement>(null);
  const p = items[selected];

  return (
    <>
      <div role="tablist" aria-label={labels.list} className={styles.tiles} onKeyDown={onKeyDown}>
        {items.map((it, i) => {
          const props = tabProps(i, { tab, panel: panelId });
          return (
            <button
              key={it.key}
              {...props}
              onClick={(e) => {
                props.onClick();
                // Na telefonie panel stoi pod pięcioma rzędami kafelków -
                // stuknięcie przewija do niego, żeby wybór był widoczny.
                if (e.detail > 0 && window.matchMedia("(max-width: 639px)").matches) {
                  panelRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
                }
              }}
              className={styles.tile}
            >
              <ProjectLogo logo={it.logo} height={64} alt={it.name} className="max-w-full" style={{ height: wysokoscLogo(it.logo) }} />
            </button>
          );
        })}
      </div>

      <div ref={panelRef} id={panelId} role="tabpanel" aria-labelledby={tab(selected)} className={styles.projectPanel}>
        <div key={`${p.key}-photo`} className={styles.swap} data-instant={instant}>
          <div className={styles.photo}>
            <Image src={p.photo.src} alt={p.photo.alt} fill sizes="(min-width: 900px) 560px, 100vw" className="object-cover" />
          </div>
        </div>
        <div key={`${p.key}-text`} className={styles.swap} data-instant={instant}>
          <h3 className={styles.panelTitle}>{p.name}</h3>
          <p className={styles.meta}>
            <span>{labels.when}</span>
            <span>{p.when}</span>
          </p>
          <p className={styles.panelText}>{p.desc}</p>
          <p className={styles.listLabel}>{labels.forms}</p>
          <ul className={styles.checks}>
            {p.forms.map((f) => (
              <li key={f}>
                <Check size={18} weight="bold" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <a href="#kontakt-partnerzy" className={styles.ask} onClick={() => wybierzTemat({ message: `${p.draft}\n\n`, topic: p.name })}>
              {labels.ask}
              <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </a>
            <Link href={`/nasze-projekty#projekt-${p.key}`} className={styles.more}>
              {labels.more}
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
