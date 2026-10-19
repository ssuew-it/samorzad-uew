"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { DURATION, EASE } from "@/lib/motion";

export interface PageHeroPhoto {
  src: string;
  /** Opis kadru - co na nim widać, nie „zdjęcie”. */
  alt: string;
  /** `object-position` - gdzie w kadrze jest to, czego nie wolno uciąć. */
  position?: string;
}

interface PageHeroProps {
  title: string;
  lead?: string;
  breadcrumbs: Crumb[];
  /** Zdjęcie z życia Samorządu. Wypełnia prawą część nagłówka do krawędzi ekranu. */
  photo?: PageHeroPhoto;
  /** Własna grafika strony (obiekt bez tła), gdy strona ma swoją „duszę”. */
  visual?: ReactNode;
}

/**
 * Nagłówek podstrony.
 *
 * Do 10.2026 każda podstrona startowała tak samo: lawendowa mgła, kreska
 * z małym napisem wersalikami nad tytułem, tytuł średniej wielkości. Strony
 * były czyste, ale ciche i jednakowe. Teraz charakter niesie skala tytułu
 * i - tam, gdzie mamy prawdziwe zdjęcie - kadr z życia Samorządu. Okruszki
 * mówią, gdzie jesteś, więc etykieta nad tytułem nic już nie dodawała.
 */
export function PageHero({ title, lead, breadcrumbs, photo, visual }: PageHeroProps) {
  const reduce = useReducedMotion();
  const t = useTranslations("ui.aria");
  const instant = { duration: 0 };

  const heading = (
    <>
      <div className="overflow-hidden pb-[0.1em]">
        <motion.h1
          initial={reduce ? false : { y: "108%" }}
          animate={{ y: "0%" }}
          transition={reduce ? instant : { duration: DURATION.draw, delay: 0.05, ease: EASE }}
          className="max-w-[17ch] text-balance break-words font-display text-[clamp(2.25rem,7.4vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink-primary [hyphens:auto]"
        >
          {title}
        </motion.h1>
      </div>
      {lead && (
        <motion.p
          className="mt-6 max-w-[38rem] text-pretty text-[1.125rem] leading-[1.6] text-ink-secondary md:mt-8 md:text-[1.3125rem] md:leading-[1.55]"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? instant : { duration: 0.6, delay: 0.28, ease: EASE }}
        >
          {lead}
        </motion.p>
      )}
    </>
  );

  const crumbs = (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduce ? instant : { duration: DURATION.reveal, ease: EASE }}
    >
      <Breadcrumbs items={breadcrumbs} />
    </motion.div>
  );

  if (photo) {
    return (
      <section
        aria-label={t("pageHeader")}
        className="relative border-b border-border-subtle bg-bg-base pt-[72px]"
      >
        <div className="lg:grid lg:min-h-[min(78svh,640px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)_minmax(0,600px)_minmax(0,1fr)]">
          <div className="flex flex-col px-6 pb-12 pt-10 md:pb-16 lg:col-start-2 lg:pb-20 lg:pr-12 lg:pt-12">
            {crumbs}
            <div className="mt-10 lg:mt-auto">{heading}</div>
          </div>

          {/* Kadr wychodzi do prawej krawędzi ekranu - rozbija siatkę
              treści, żeby zdjęcie było częścią nagłówka, a nie ilustracją
              wstawioną obok tekstu. */}
          <motion.div
            className="relative aspect-[16/10] overflow-hidden bg-bg-elevated lg:col-span-2 lg:col-start-3 lg:aspect-auto"
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={reduce ? instant : { duration: 1.1, delay: 0.1, ease: EASE }}
          >
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={reduce ? instant : { duration: 1.6, delay: 0.1, ease: EASE }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                style={{ objectPosition: photo.position ?? "center" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={t("pageHeader")}
      className="relative border-b border-border-subtle bg-bg-base"
    >
      <div className="mx-auto max-w-[1200px] px-6 pb-14 pt-[120px] md:pb-20 md:pt-[136px]">
        {crumbs}
        <div
          className={
            visual
              ? "mt-10 grid items-center gap-9 md:mt-14 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] md:gap-14"
              : "mt-10 md:mt-16"
          }
        >
          <div className="min-w-0">{heading}</div>
          {visual ? <div className="order-first min-w-0 md:order-none">{visual}</div> : null}
        </div>
      </div>
    </section>
  );
}
