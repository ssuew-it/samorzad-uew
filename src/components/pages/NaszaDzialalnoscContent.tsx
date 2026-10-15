"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Lightning, HandHeart, Lightbulb, ArrowRight } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { Tilt } from "../Tilt";
import { CountUp } from "../CountUp";
import { MagneticButton } from "../MagneticButton";

const pillars = [
  { key: "act", icon: Lightning },
  { key: "support", icon: HandHeart },
  { key: "inspire", icon: Lightbulb },
];

const stats = [
  { to: 10000, suffix: "+", labelKey: "students" },
  { to: 6, suffix: "", labelKey: "committees" },
  { to: 9, suffix: "", labelKey: "projects" },
  { year: "1987", labelKey: "founded" },
];

export function NaszaDzialalnoscContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("naszaDzialalnosc");

  return (
    <>
      {/* Pillars */}
      <section className="section-padding" aria-labelledby="misja-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("missionEyebrow")}
            </p>
            <h2
              id="misja-heading"
              className="mt-3 max-w-[20ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("missionHeading")}
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar, i) => {
              const Glyph = pillar.icon;
              return (
                <motion.div
                  key={pillar.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          duration: 0.5,
                          delay: i * 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        }
                  }
                >
                  <Tilt className="h-full" max={6}>
                    <div className="flex h-full flex-col rounded-xl border border-border-subtle bg-bg-surface p-7 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-glow text-accent">
                        <Glyph size={26} weight="regular" aria-hidden="true" />
                      </span>
                      <h3 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.01em] text-ink-primary">
                        {t(`pillars.${pillar.key}.title`)}
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                        {t(`pillars.${pillar.key}.desc`)}
                      </p>
                    </div>
                  </Tilt>
                </motion.div>
              );
            })}
          </div>

          {/* Pull quote */}
          <ScrollReveal>
            <blockquote className="mt-14 border-l-2 border-accent py-1 pl-6">
              <p className="prose-constrained font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.3] tracking-[-0.02em] text-ink-primary">
                {t("quote")}
              </p>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats band */}
      <section
        className="section-padding border-y border-border-subtle bg-bg-surface py-16"
        aria-labelledby="liczby-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2 id="liczby-heading" className="sr-only">
            {t("statsSr")}
          </h2>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {stats.map((stat, i) => (
              <ScrollReveal key={i} delay={Math.min(i, 3) * 0.05}>
                <div>
                  {"year" in stat ? (
                    <span className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-none tracking-[-0.02em] text-ink-primary">
                      {stat.year}
                    </span>
                  ) : (
                    <CountUp
                      to={stat.to}
                      suffix={stat.suffix}
                      className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-none tracking-[-0.02em] text-ink-primary tabular-nums"
                    />
                  )}
                  <p className="mt-2 text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-ink-secondary">
                    {t(`stats.${stat.labelKey}`)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="flex flex-col items-start gap-8 rounded-2xl border border-border-subtle bg-bg-surface p-10 md:flex-row md:items-center md:justify-between">
              <div>
                <h2
                  id="cta-heading"
                  className="max-w-[20ch] font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
                >
                  {t("ctaHeading")}
                </h2>
                <p className="mt-3 text-[1rem] leading-[1.6] text-ink-secondary">
                  {t("ctaDesc")}
                </p>
              </div>
              <MagneticButton
                href="/nasze-projekty"
                ariaLabel={t("ctaAria")}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-colors hover:bg-accent-dim"
              >
                {t("ctaButton")}
                <ArrowRight size={20} weight="regular" aria-hidden="true" />
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
