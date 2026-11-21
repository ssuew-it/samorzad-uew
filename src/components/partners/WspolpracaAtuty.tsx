"use client";

import Image from "next/image";
import { useId, type CSSProperties } from "react";
import { Check } from "@phosphor-icons/react";
import { useWybor } from "./useWybor";
import styles from "./Wspolpraca.module.css";

export interface ZdjecieDane {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Atut {
  key: string;
  short: string;
  title: string;
  desc: string;
  examples: string[];
  photo: ZdjecieDane;
  caption: string;
}

/** Kąty odnóg (stopnie, 0 = w prawo, zgodnie z ruchem wskazówek), jak na szkicu z rozpiski. */
const KATY = [-148, -38, 12, 64, 160];
const PROMIEN = 38;

const pozycja = (i: number) => {
  const rad = ((KATY[i % KATY.length] ?? 0) * Math.PI) / 180;
  return { x: 50 + PROMIEN * Math.cos(rad), y: 50 + PROMIEN * Math.sin(rad) };
};

/**
 * „Współpraca z nami” - koło z odnogami. Wybór (najechanie, klawiatura,
 * stuknięcie) pokazuje obok panel ze zdjęciem z projektu, opisem i
 * przykładami. Na węższych ekranach koło zamienia się w siatkę przycisków.
 */
export function WspolpracaAtuty({
  center,
  label,
  examplesLabel,
  items,
}: {
  center: string;
  label: string;
  examplesLabel: string;
  items: Atut[];
}) {
  const ids = useId();
  const panelId = `${ids}-panel`;
  const tab = (i: number) => `${ids}-tab-${i}`;
  const { selected, instant, onKeyDown, tabProps } = useWybor(items.length);
  const atut = items[selected];

  return (
    <div className={styles.atutyGrid}>
      <div className={styles.wheel}>
        <svg className={styles.wheelLines} viewBox="0 0 100 100" aria-hidden="true">
          {items.map((it, i) => {
            const p = pozycja(i);
            return <line key={it.key} x1="50" y1="50" x2={p.x} y2={p.y} data-active={i === selected} />;
          })}
        </svg>
        <p className={styles.wheelCenter} aria-hidden="true">
          {center}
        </p>
        <div role="tablist" aria-label={label} className={styles.nodes} onKeyDown={onKeyDown}>
          {items.map((it, i) => {
            const p = pozycja(i);
            return (
              <button key={it.key} {...tabProps(i, { tab, panel: panelId })} className={styles.node} style={{ "--x": `${p.x}%`, "--y": `${p.y}%` } as CSSProperties}>
                <span className={styles.nodeNo} aria-hidden="true">
                  0{i + 1}
                </span>
                {it.short}
              </button>
            );
          })}
        </div>
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tab(selected)} className={styles.panel}>
        <div key={atut.key} className={styles.swap} data-instant={instant}>
          <div className={styles.photo}>
            <Image src={atut.photo.src} alt={atut.photo.alt} fill sizes="(min-width: 960px) 600px, 100vw" className="object-cover" />
          </div>
          <p className={styles.photoCaption}>{atut.caption}</p>
          <h3 className={styles.panelTitle}>{atut.title}</h3>
          <p className={styles.panelText}>{atut.desc}</p>
          <p className={styles.listLabel}>{examplesLabel}</p>
          <ul className={styles.checks}>
            {atut.examples.map((ex) => (
              <li key={ex}>
                <Check size={18} weight="bold" aria-hidden="true" />
                {ex}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
