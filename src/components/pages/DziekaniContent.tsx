"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { InitialsAvatar } from "../InitialsAvatar";
import { ScrollReveal } from "../ScrollReveal";
import { PersonCard } from "../PersonCard";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { dean, viceDeans as prodziekani, DEAN_UNIT_URL } from "@/lib/people";

const dziekanName = dean.name;

export function DziekaniContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("dziekani");
  const tc = useTranslations("common");

  return (
    <section className="section-padding" aria-labelledby="dziekani-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="dziekani-heading"
            className="max-w-[26ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        {/* Dziekan - bez kierunków; rozstrzyga sprawy z zamkniętej listy. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid gap-8 rounded-2xl border border-accent/40 bg-bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12"
        >
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <InitialsAvatar name={dziekanName} size={88} />
            <div className="min-w-0">
              <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
                {dziekanName}
              </h3>
              <p className="mt-2 text-[0.9375rem] font-medium text-accent">{t("dziekanRole")}</p>
              <dl className="mt-6 grid gap-1">
                <dt className="text-[0.8125rem] font-semibold text-ink-primary">{t("dean.officeLabel")}</dt>
                <dd className="text-[1.0625rem] text-ink-primary">{t("dean.officeHours")}</dd>
              </dl>
              <p className="mt-3 max-w-[44ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("dean.officeNote")}</p>
              <a
                href={DEAN_UNIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-medium text-accent underline underline-offset-4 hover:text-accent-dim"
              >
                {t("dean.contactLink")}
                <ArrowSquareOut size={16} aria-hidden="true" />
                <span className="sr-only">({tc("newTab")})</span>
              </a>
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-[1.0625rem] font-semibold text-ink-primary">{t("dean.scopeHeading")}</h4>
            <ul className="mt-3 grid gap-2">
              {(t.raw("dean.scope") as string[]).map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.55] text-ink-secondary">
                  <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Prodziekani - wspólny zakres spraw, potem kierunki każdej osoby. */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <div>
            <h3 className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-semibold tracking-[-0.02em] text-ink-primary">
              {t("viceHeading")}
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink-secondary">{t("viceLead")}</p>
          </div>
          <ul className="grid gap-2">
            {(t.raw("viceScope") as string[]).map((item) => (
              <li key={item} className="flex gap-3 text-[0.9375rem] leading-[1.55] text-ink-secondary">
                <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {prodziekani.map((p, i) => (
            <motion.div
              key={p.key}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.5, delay: Math.min(i, 4) * 0.08, ease: [0.16, 1, 0.3, 1] }
              }
              className="h-full"
            >
              <PersonCard name={p.name} role={t("prodziekanRole")} email={p.email} meta={t.raw(`kierunki.${p.key}`) as string[]} plain className="h-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
