"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  HandCoins,
  GraduationCap,
  Calculator,
  Scales,
  Gavel,
  Heart,
  MapTrifold,
  Compass,
  Question,
  UsersFour,
  BookOpenText,
  Books,
  Desktop,
  Exam,
  FileText,
  ArrowSquareOut,
  EnvelopeSimple,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { Spotlight } from "../Spotlight";
import { EASE } from "@/lib/motion";

interface Situation {
  key: string;
  href: string;
  icon: Icon;
}

const situations: Situation[] = [
  { key: "zapomoga", href: "/stypendia#zapomoga", icon: HandCoins },
  { key: "stypendium", href: "/stypendia", icon: GraduationCap },
  { key: "srednia", href: "/stypendia#kalkulator", icon: Calculator },
  { key: "semestr", href: "/infopacki/zaliczenie-semestru", icon: Exam },
  { key: "podanie", href: "/infopacki/podania", icon: FileText },
  { key: "usos", href: "/infopacki/usos", icon: Desktop },
  { key: "ocena", href: "/prawa-studenta", icon: Scales },
  { key: "spor", href: "/rzecznik-praw-studenta", icon: Gavel },
  { key: "psychika", href: "/pomoc-psychologiczna", icon: Heart },
  { key: "zajecia", href: "/mapa-kampusu", icon: MapTrifold },
  { key: "biblioteka", href: "/infopacki/biblioteka", icon: Books },
  { key: "dyplom", href: "/infopacki/dyplomowanie", icon: GraduationCap },
  { key: "start", href: "/infopacki", icon: Compass },
  { key: "kontakt", href: "/infopacki/sprawy-studenckie", icon: Question },
  { key: "zaangazowanie", href: "/infopacki/zycie-studenckie", icon: UsersFour },
  { key: "publikacja", href: "/wydawnictwo", icon: BookOpenText },
];

const quickLinks = [
  { key: "usos", href: "https://usosweb.ue.wroc.pl/kontroler.php?_action=news/default" },
  { key: "intranet", href: "https://uewrc.sharepoint.com/sites/IntranetUEW" },
  { key: "plan", href: "https://plan.ue.wroc.pl" },
  {
    key: "harmonogram",
    href: "https://bip.ue.wroc.pl/download/attachment/3456/harmonogram-roku-akademickiego-2025-2026.pdf",
  },
];

export function DlaStudentaContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("dlaStudenta");

  return (
    <>
      {/* Situation router */}
      <section className="section-padding" aria-labelledby="sytuacje-heading">
        <Spotlight />
        <div className="relative z-10 mx-auto max-w-[1200px]">
          <h2
            id="sytuacje-heading"
            className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("situationsHeading")}
          </h2>
          <div className="mt-5 flex flex-col justify-between gap-5 border-t border-border-medium pt-5 sm:flex-row sm:items-center">
            <p className="max-w-[64ch] text-[0.9375rem] leading-[1.7] text-ink-secondary">
              {t("situationsLead")}
            </p>
            <Link
              href="/infopacki"
              className="group inline-flex min-h-11 shrink-0 items-center gap-3 text-[0.8125rem] font-semibold text-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-glow">
                <BookOpenText size={19} weight="duotone" aria-hidden="true" />
              </span>
              {t("livingGuides")}
              <span className="transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {situations.map((situation, i) => {
              const Glyph = situation.icon;
              return (
                <motion.div
                  key={situation.key}
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
                      : {
                          duration: 0.5,
                          delay: Math.min(i, 5) * 0.04,
                          ease: [0.16, 1, 0.3, 1],
                        }
                  }
                  className="group relative rounded-xl border border-border-subtle bg-bg-surface p-6 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-glow text-accent">
                    <Glyph size={24} weight="regular" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[1.0625rem] font-semibold leading-[1.3] tracking-[-0.01em] text-ink-primary">
                    {t(`situations.${situation.key}.title`)}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                    {t(`situations.${situation.key}.desc`)}
                  </p>
                  <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-tertiary">
                    {t(`situations.${situation.key}.dest`)}
                  </p>
                  {/* Stretched link overlay */}
                  <Link
                    href={situation.href}
                    aria-label={t(`situations.${situation.key}.title`)}
                    className="absolute inset-0 rounded-xl"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="section-padding pt-0" aria-labelledby="szybkie-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("quickEyebrow")}
            </p>
            <h2
              id="szybkie-heading"
              className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
            >
              {t("quickHeading")}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-[0.875rem] font-medium text-ink-primary transition-colors hover:border-accent hover:text-accent"
                >
                  {t(`quickLinks.${link.key}`)}
                  <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
                </a>
              ))}
            </div>
          </ScrollReveal>

          {/* Contact CTA */}
          <ScrollReveal delay={0.1}>
            <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">
                  {t("ctaHeading")}
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                  {t("ctaDesc")}
                </p>
              </div>
              <a
                href="mailto:kontakt@samorzad.ue.wroc.pl"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
              >
                <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
                {t("ctaButton")}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
