"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { TERM } from "@/lib/term";
import { useTranslations } from "next-intl";
import { EnvelopeSimple, CheckCircle, FileText } from "@phosphor-icons/react";
import { PersonCard } from "../PersonCard";
import { ScrollReveal } from "../ScrollReveal";
import { electionCommittee as czlonkowie } from "@/lib/people";
import { documents } from "@/lib/documents";

export function KomisjaWyborczaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("skw");
  const tc = useTranslations("common");
  const zadania = t.raw("zadania") as string[];

  return (
    <section className="section-padding" aria-labelledby="skw-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="skw-heading"
            className="max-w-[26ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        {/* Zadania */}
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {zadania.map((z, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.5, delay: Math.min(i, 4) * 0.06, ease: [0.16, 1, 0.3, 1] }
              }
              className="flex gap-3 rounded-xl border border-border-subtle bg-bg-surface p-5"
            >
              <CheckCircle size={22} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <span className="text-[0.9375rem] leading-[1.6] text-ink-secondary">{z}</span>
            </motion.li>
          ))}
        </ul>

        {/* Skład */}
        <h3 className="mt-14 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
          {t("skladHeading")}
        </h3>
        {czlonkowie.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {czlonkowie.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.5, delay: Math.min(i, 4) * 0.08, ease: [0.16, 1, 0.3, 1] }
                }
                className="h-full"
              >
                <PersonCard name={c.name} role={t(`roles.${c.roleKey}`)} className="h-full" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border-medium bg-bg-surface p-6">
            <span className="rounded-full border border-border-subtle px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
              {tc("comingSoon")}
            </span>
            <p className="text-[0.9375rem] text-ink-secondary">{t("skladSoon")}</p>
          </div>
        )}

        {/* CTA */}
        <ScrollReveal>
          <div className="mt-12 flex flex-col flex-wrap gap-4 sm:flex-row">
            <a
              href="mailto:skw@samorzad.ue.wroc.pl"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
              skw@samorzad.ue.wroc.pl
            </a>
            {documents.skwResolutions.href && (
              <a
                href={documents.skwResolutions.href}
                {...(documents.skwResolutions.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : { download: true })}
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border-strong px-7 text-base font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated"
              >
                <FileText size={20} weight="regular" aria-hidden="true" />
                {t("uchwalyButton", { term: TERM })}
              </a>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
