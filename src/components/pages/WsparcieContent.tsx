"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Coins,
  Lifebuoy,
  Wheelchair,
  Trophy,
  PiggyBank,
  ArrowUpRight,
  Package,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { EASE } from "@/lib/motion";

interface Swiadczenie {
  key: string;
  href: string;
  icon: Icon;
}

const swiadczenia: Swiadczenie[] = [
  { key: "socjalne", href: "/stypendia#socjalne", icon: Coins },
  { key: "zapomoga", href: "/stypendia#zapomoga", icon: Lifebuoy },
  { key: "niepelnosprawni", href: "/stypendia#niepelnosprawni", icon: Wheelchair },
  { key: "rektora", href: "/stypendia#rektora", icon: Trophy },
  { key: "fundusz", href: "/stypendia#rektora", icon: PiggyBank },
];

export function WsparcieContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("wsparcie");

  return (
    <section className="section-padding" aria-labelledby="wsparcie-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
            {t("eyebrow")}
          </p>
          <h2
            id="wsparcie-heading"
            className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {swiadczenia.map((s, i) => {
            const Glyph = s.icon;
            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={
                  reduce
                    ? undefined
                    : { y: -5, transition: { duration: 0.24, ease: EASE } }
                }
                viewport={{ once: true, amount: 0.15 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.5, delay: Math.min(i, 5) * 0.05, ease: [0.16, 1, 0.3, 1] }
                }
                className="group relative flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-glow text-accent">
                  <Glyph size={24} weight="regular" aria-hidden="true" />
                </span>
                <h3 className="mt-5 flex items-start gap-1.5 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-ink-primary">
                  {t(`items.${s.key}.title`)}
                  <ArrowUpRight
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-ink-tertiary transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </h3>
                <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                  {t(`items.${s.key}.desc`)}
                </p>
                <Link href={s.href} aria-label={t(`items.${s.key}.title`)} className="absolute inset-0 rounded-xl" />
              </motion.div>
            );
          })}
        </div>

        {/* Infopack CTA */}
        <ScrollReveal>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">
                {t("ctaHeading")}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                {t("ctaDesc")}
              </p>
            </div>
            <Link
              href="/infopacki"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <Package size={20} weight="regular" aria-hidden="true" />
              {t("ctaButton")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
