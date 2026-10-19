"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useInView, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowDown, ArrowUpRight, Pause, Play } from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { partners } from "@/lib/partners";
import styles from "./Partners.module.css";

const copy = {
  pl: { first: "Dobre pomysły.", second: "Większe możliwości.", lead: "Energia studentów. Doświadczenie marek. Twórzmy razem projekty, które zostają z ludźmi na dłużej.", contact: "Stwórzmy coś razem", wall: "Poznaj marki", pause: "Zatrzymaj ruch", play: "Włącz ruch", foot: "Marki, które były częścią naszej historii" },
  en: { first: "Great ideas.", second: "Bigger possibilities.", lead: "Student energy. Brand experience. Let’s create projects that stay with people long after the moment.", contact: "Let’s create together", wall: "Meet the brands", pause: "Pause motion", play: "Enable motion", foot: "Brands that have been part of our story" },
};
const featured = ["BNY", "PwC", "Techland", "Pasibus", "mBank", "Pyszne.pl"].map(name => partners.find(partner => partner.name === name)).filter(partner => partner !== undefined);

export function PartnerHero() {
  const t = useTranslations("partnerzy");
  const tc = useTranslations("common");
  const c = copy[useLocale() === "en" ? "en" : "pl"];
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const x = useSpring(0, { stiffness: 90, damping: 22 });
  const y = useSpring(0, { stiffness: 90, damping: 22 });
  function track(event: PointerEvent<HTMLDivElement>) {
    if (reduced || paused || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - box.left) / box.width - .5) * 14);
    y.set(((event.clientY - box.top) / box.height - .5) * 14);
  }
  return (
    <section className={styles.hero} aria-labelledby="partners-title">
      <div className={styles.inner}>
        <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("heroTitle") }]} />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t("heroEyebrow")} <span aria-hidden="true">↗</span></p>
            <h1 id="partners-title">{c.first}<br /><span>{c.second}</span></h1>
            <p className={styles.lead}>{c.lead}</p>
            <div className={styles.actions}>
              <a href="#kontakt-partnerzy" className={styles.primary}>{c.contact}<ArrowUpRight size={20} aria-hidden="true" /></a>
              <a href="#marki" className={styles.secondary}>{c.wall}<ArrowDown size={18} aria-hidden="true" /></a>
            </div>
          </div>
          <div ref={ref} className={styles.visual} data-paused={paused || !inView || Boolean(reduced)} onPointerMove={track} onPointerLeave={() => { x.set(0); y.set(0); }}>
            <motion.div className={styles.constellation} style={{ x: reduced || paused ? 0 : x, y: reduced || paused ? 0 : y }} aria-hidden="true">
              <div className={styles.ring} /><div className={styles.ringOuter} />
              <div className={styles.core}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-light.svg" alt="" className={styles.coreLogo} />
              </div>
              {featured.map((partner, i) => (
                <div key={partner.name} className={styles.satellite} data-primary={partner.name === "BNY"} style={{ "--i": i } as CSSProperties}>
                  <div className={styles.logoFloat}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={partner.logo} alt="" width={120} height={64} />
                  </div>
                </div>
              ))}
              <span className={styles.sparkOne}>+</span><span className={styles.sparkTwo}>+</span>
            </motion.div>
            <div className={styles.visualFooter}><p>{c.foot}</p><button type="button" className={styles.motionToggle} onClick={() => setPaused(!paused)} aria-label={paused ? c.play : c.pause} aria-pressed={paused}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button></div>
          </div>
        </div>
      </div>
    </section>
  );
}
