"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  ArrowSquareOut,
  CalendarBlank,
  EnvelopeSimple,
  FolderOpen,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import {
  recruitments,
  recruitmentDrive,
  recruitmentGeneralForm,
} from "@/lib/recruitment";

export function RekrutacjaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("rekrutacja");
  const locale = useLocale();
  const hasOpen = recruitments.length > 0;

  const fmt = (d: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${d}T00:00:00`));

  return (
    <section className="section-padding" aria-labelledby="rekrutacja-heading">
      <div className="mx-auto max-w-[1200px]">
        {hasOpen ? (
          <>
            <h2
              id="rekrutacja-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("openHeading")}
            </h2>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {recruitments.map((r, i) => (
                <motion.article
                  key={r.title + i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.5, delay: Math.min(i, 4) * 0.06, ease: [0.16, 1, 0.3, 1] }
                  }
                  className="flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated"
                >
                  {r.deadline && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1 text-[0.75rem] font-medium text-ink-secondary">
                      <CalendarBlank size={14} weight="regular" aria-hidden="true" className="text-accent" />
                      {t("deadlineLabel")}: {fmt(r.deadline)}
                    </span>
                  )}
                  <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.01em] text-ink-primary">
                    {r.title}
                  </h3>
                  {r.desc && (
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                      {r.desc}
                    </p>
                  )}
                  <a
                    href={r.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-accent px-6 text-[0.9375rem] font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
                  >
                    {t("formButton")}
                    <ArrowRight size={18} weight="regular" aria-hidden="true" />
                  </a>
                </motion.article>
              ))}
            </div>
          </>
        ) : (
          <ScrollReveal>
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-10 text-center">
              <h2
                id="rekrutacja-heading"
                className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary"
              >
                {t("noneHeading")}
              </h2>
              <p className="max-w-[52ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">
                {t("noneBody")}
              </p>
              {recruitmentGeneralForm ? (
                <a
                  href={recruitmentGeneralForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
                >
                  {t("interestButton")}
                  <ArrowRight size={20} weight="regular" aria-hidden="true" />
                </a>
              ) : (
                <a
                  href="mailto:kontakt@samorzad.ue.wroc.pl"
                  className="mt-2 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
                >
                  <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
                  {t("generalButton")}
                </a>
              )}
            </div>
          </ScrollReveal>
        )}

        {recruitmentDrive && (
          <ScrollReveal delay={0.1}>
            <div className="mt-8">
              <a
                href={recruitmentDrive}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong px-6 text-[0.9375rem] font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated"
              >
                <FolderOpen size={18} weight="regular" aria-hidden="true" />
                {t("materialsButton")}
                <ArrowSquareOut size={16} weight="regular" aria-hidden="true" className="text-ink-tertiary" />
              </a>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
