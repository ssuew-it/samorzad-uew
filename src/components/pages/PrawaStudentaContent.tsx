"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Megaphone, FileText, CaretDown } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "../ScrollReveal";
import { SectionRail } from "../SectionRail";
import { EASE } from "@/lib/motion";

const rightKeys = ["repeat", "ios", "absence", "change", "ects", "commission", "mode"];

export function PrawaStudentaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("prawaStudenta");

  return (
    <>
    <SectionRail ids={rightKeys.map((_, i) => `prawo-${i + 1}`)} label={t("sectionIndex")} />
    <section className="section-padding" aria-labelledby="prawa-lista-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
            {t("eyebrow")}
          </p>
          <h2
            id="prawa-lista-heading"
            className="mt-3 max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        <ol className="mt-12 grid gap-5 md:grid-cols-2">
          {rightKeys.map((key, i) => (
            <motion.li
              key={key}
              id={`prawo-${i + 1}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
                whileHover={
                  reduce
                    ? undefined
                  : { y: -5, transition: { duration: 0.24, ease: EASE } }
                }
              viewport={{ once: true, amount: 0.2 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: 0.5,
                      delay: Math.min(i, 4) * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
              className="group flex gap-5 rounded-xl border border-border-subtle bg-bg-surface p-6 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated"
            >
              <span
                aria-hidden="true"
                className="font-mono text-[1.75rem] font-medium leading-none text-accent tabular-nums"
              >
                §{i + 1}
              </span>
              <div>
                <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
                  {t(`rights.${key}.title`)}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                  {t(`rights.${key}.desc`)}
                </p>
                <details className="group/expl mt-3">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-mono text-[0.75rem] uppercase tracking-[0.06em] text-accent [&::-webkit-details-marker]:hidden">
                    {t("expandLabel")}
                    <CaretDown
                      size={12}
                      weight="bold"
                      aria-hidden="true"
                      className="transition-transform duration-200 group-open/expl:rotate-180"
                    />
                  </summary>
                  <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                    {t(`rights.${key}.expl`)}
                  </p>
                </details>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* CTA row */}
        <ScrollReveal>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20180001668/U/D20181668Lj.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <FileText size={20} weight="regular" aria-hidden="true" />
              {t("ctaPdf")}
            </a>
            <Link
              href="/rzecznik-praw-studenta"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-border-strong px-7 text-base font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated"
            >
              <Megaphone size={20} weight="regular" aria-hidden="true" />
              {t("ctaRzecznik")}
            </Link>
            <Link
              href="/dla-studenta"
              className="inline-flex h-12 items-center gap-1.5 px-3 text-base font-medium text-accent transition-colors hover:text-accent-dim"
            >
              {t("ctaBack")}
              <ArrowUpRight size={18} weight="regular" aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
    </>
  );
}
