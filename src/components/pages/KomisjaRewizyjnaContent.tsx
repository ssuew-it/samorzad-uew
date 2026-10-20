"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { CheckCircle, FileText } from "@phosphor-icons/react";
import { PersonCard } from "../PersonCard";
import { ScrollReveal } from "../ScrollReveal";
import { auditCommittee as czlonkowie } from "@/lib/people";
import { documents } from "@/lib/documents";

interface Rule {
  title: string;
  desc: string;
}

/**
 * Komisja Rewizyjna - organ kontrolny Samorządu.
 *
 * Treść wprost z Regulaminu Samorządu (uchwała RUSS 45/2024-25), Dział IX
 * (§ 41-45), § 22 pkt 13 (wybór przez Radę) i przepisy końcowe (spory
 * o Regulamin). Skład i adres e-mail Komisji dopiszemy, gdy Samorząd je
 * poda - do tego czasu sekcja składu pokazuje „wkrótce”, jak przy SKW.
 */
export function KomisjaRewizyjnaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("kr");
  const tc = useTranslations("common");
  const kompetencje = t.raw("kompetencje") as string[];
  const rules = t.raw("rules") as Rule[];

  return (
    <section className="section-padding" aria-labelledby="kr-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="kr-heading"
            className="max-w-[26ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        {/* Droga skargi - jedyna rzecz, z którą student przychodzi do KR sam. */}
        <ScrollReveal>
          <div className="mt-12 rounded-2xl border border-accent/40 bg-bg-surface p-6 sm:p-8">
            <h3 className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink-primary">
              {t("complaintHeading")}
            </h3>
            <p className="mt-3 max-w-[62ch] text-[1rem] leading-[1.7] text-ink-secondary">{t("complaintBody")}</p>
          </div>
        </ScrollReveal>

        <h3 className="mt-14 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
          {t("kompetencjeHeading")}
        </h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {kompetencje.map((k, i) => (
            <motion.li
              key={k}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.5, delay: Math.min(i, 4) * 0.06, ease: [0.16, 1, 0.3, 1] }
              }
              className="flex gap-3 rounded-xl border border-border-subtle bg-bg-surface p-5"
            >
              <CheckCircle size={22} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <span className="text-[0.9375rem] leading-[1.6] text-ink-secondary">{k}</span>
            </motion.li>
          ))}
        </ul>

        <h3 className="mt-14 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
          {t("rulesHeading")}
        </h3>
        <dl className="mt-6 grid gap-x-12 gap-y-8 border-t border-border-subtle pt-8 md:grid-cols-2">
          {rules.map((rule) => (
            <div key={rule.title}>
              <dt className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">{rule.title}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-[1.65] text-ink-secondary">{rule.desc}</dd>
            </div>
          ))}
        </dl>

        {/* Skład */}
        <h3 className="mt-14 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
          {t("skladHeading")}
        </h3>
        {czlonkowie.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {czlonkowie.map((c) => (
              <PersonCard key={c.name} name={c.name} role={t(`roles.${c.roleKey}`)} email={c.email} className="h-full" />
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

        <ScrollReveal>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <a
              href={documents.regulacje.government.href}
              download
              className="inline-flex h-12 items-center gap-2 self-start rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <FileText size={20} weight="regular" aria-hidden="true" />
              {t("regulaminButton")}
            </a>
            <p className="max-w-[52ch] text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("sourceNote")}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
