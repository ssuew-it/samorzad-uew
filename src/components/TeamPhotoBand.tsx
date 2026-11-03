"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Zdjęcie zespołu pod hero, w oprawie jak odbitka: jasny passe-partout,
 * cienka ramka i podpis mono. Kadr przycięty do samej grupy (bez schodów
 * i poręczy po bokach) i do bioder; szerokość ograniczona, bo źródło ma
 * 2400 px i na pełnej szerokości strony było rozmyte (uwagi z 3.11.2026).
 */
export function TeamPhotoBand({ src, alt, label, place, position = "50% 30%" }: { src: string; alt: string; label: string; place: string; position?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-10 md:pt-14">
      <motion.figure
        className="mx-auto max-w-[980px] rounded-2xl border border-border-medium bg-bg-surface p-2 shadow-[0_1px_2px_rgba(11,19,34,0.04),0_12px_32px_-12px_rgba(11,19,34,0.18)] sm:p-3"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.15, ease: EASE }}
      >
        <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-bg-elevated">
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 1.4, delay: 0.15, ease: EASE }}
          >
            <Image src={src} alt={alt} fill priority sizes="(min-width: 1048px) 960px, 100vw" className="object-cover" style={{ objectPosition: position }} />
          </motion.div>
        </div>
        <figcaption className="flex flex-col gap-0.5 px-2 pb-1 pt-3 font-mono text-[0.6875rem] uppercase tracking-[0.08em] sm:flex-row sm:items-center sm:justify-between sm:px-1">
          <span className="text-ink-primary">{label}</span>
          <span className="text-ink-tertiary">{place}</span>
        </figcaption>
      </motion.figure>
    </div>
  );
}
