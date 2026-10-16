"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { ArrowSquareOut, EnvelopeSimple } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { organizations } from "@/lib/organizations";

export function OrganizacjeContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("organizacje");
  const tc = useTranslations("common");
  const has = organizations.length > 0;

  return (
    <section className="section-padding" aria-labelledby="org-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <p className="prose-constrained text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
          <h2
            id="org-heading"
            className="mt-10 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("listHeading")}
          </h2>
        </ScrollReveal>

        {has ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((o, i) => (
              <motion.article
                key={o.name + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.5, delay: Math.min(i, 5) * 0.04, ease: [0.16, 1, 0.3, 1] }
                }
                className="flex h-full flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated"
              >
                {o.category && (
                  <span className="w-fit rounded-full border border-border-subtle px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-accent">
                    {o.category}
                  </span>
                )}
                <h3 className="mt-3 text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                  {o.name}
                </h3>
                {o.desc && (
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                    {o.desc}
                  </p>
                )}
                {o.url && (
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-[0.875rem] font-medium text-accent transition-colors hover:text-accent-dim"
                  >
                    {o.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    <ArrowSquareOut size={14} weight="regular" aria-hidden="true" />
                  </a>
                )}
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border-medium bg-bg-surface p-6">
            <span className="rounded-full border border-border-subtle px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
              {tc("comingSoon")}
            </span>
            <p className="text-[0.9375rem] text-ink-secondary">{t("soon")}</p>
          </div>
        )}

        <ScrollReveal delay={0.1}>
          <div className="mt-14 flex flex-col items-start gap-6 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="max-w-[26ch] font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">
                {t("ctaHeading")}
              </h2>
              <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">
                {t("ctaBody")}
              </p>
            </div>
            <a
              href="mailto:kontakt@samorzad.ue.wroc.pl?subject=Zg%C5%82oszenie%20organizacji%20studenckiej"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
              {t("ctaButton")}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
