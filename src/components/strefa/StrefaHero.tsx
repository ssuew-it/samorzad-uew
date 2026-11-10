"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { DURATION, EASE } from "@/lib/motion";
import { Breadcrumbs, type Crumb } from "../Breadcrumbs";

interface Props {
  eyebrow: string;
  title: string;
  lead: string;
  breadcrumbs: Crumb[];
  /** Po zalogowaniu brama jest podświetlona, przed - przygaszona. */
  lit: boolean;
}

/**
 * Nagłówek Strefy Działacza: granatowe tło z delikatną siatką i brama
 * z sygnetu Samorządu (obiekt 3D z Higgsfielda, ta sama co w stopkach).
 * Tekst zawsze na ciemnym, jednolitym polu - brama stoi obok, nigdy pod
 * tekstem, więc kontrast nie zależy od jasnych fragmentów szkła. Na telefonie
 * brama jest mała, nad tytułem po prawej.
 */
export function StrefaHero({ eyebrow, title, lead, breadcrumbs, lit }: Props) {
  const reduce = useReducedMotion();
  const t = useTranslations("ui.aria");
  const instant = { duration: 0 };

  const brama = (cls: string) => (
    <div aria-hidden="true" className={`pointer-events-none relative ${cls}`}>
      {lit && (
        <motion.span
          className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(120,170,255,0.55),transparent)] blur-2xl"
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduce ? instant : { duration: 1.4, delay: 0.35, ease: EASE }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- statyczny obiekt z przezroczystością, next/image nic tu nie daje */}
      <img
        src="/strefa/brama.webp"
        alt=""
        width={464}
        height={520}
        className={`relative h-full w-auto drop-shadow-[0_28px_40px_rgba(0,0,0,0.5)] transition-[opacity,filter] duration-700 ${
          lit ? "" : "opacity-60 saturate-[0.7]"
        }`}
      />
    </div>
  );

  return (
    <section
      aria-label={t("pageHeader")}
      className="relative overflow-hidden bg-[radial-gradient(110%_120%_at_85%_20%,#2a4bd8_0%,#0d306e_48%,#070b1c_100%)] text-white"
    >
      {/* Siatka jak na planie technicznym - gaśnie ku tekstowi. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(90deg,transparent_25%,#000_75%)]"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-end gap-8 px-6 pb-14 pt-[120px] md:grid-cols-[minmax(0,1fr)_auto] md:pb-16 md:pt-[136px]">
        <div className="min-w-0">
          <motion.div
            className="[&_a:hover]:text-white [&_ol]:text-white/70 [&_svg]:text-white/45 [&_[aria-current=page]]:text-white"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? instant : { duration: DURATION.reveal, ease: EASE }}
          >
            <Breadcrumbs items={breadcrumbs} />
          </motion.div>
          <div className="mt-8 flex items-start justify-between gap-4 md:mt-14">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-[#b4c3ff]">{eyebrow}</p>
            {brama("h-[104px] shrink-0 -mt-2 md:hidden")}
          </div>
          <div className="mt-3 overflow-hidden pb-[0.1em]">
            <motion.h1
              initial={reduce ? false : { y: "108%" }}
              animate={{ y: "0%" }}
              transition={reduce ? instant : { duration: DURATION.draw, delay: 0.05, ease: EASE }}
              className="max-w-[16ch] text-balance font-display text-[clamp(2.1rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]"
            >
              {title}
            </motion.h1>
          </div>
          <motion.p
            className="mt-6 max-w-[38rem] text-pretty text-[1.0625rem] leading-[1.6] text-[#dfe5f5] md:text-[1.1875rem]"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? instant : { duration: 0.6, delay: 0.28, ease: EASE }}
          >
            {lead}
          </motion.p>
        </div>
        {brama("hidden h-[300px] md:block lg:h-[340px]")}
      </div>
    </section>
  );
}
