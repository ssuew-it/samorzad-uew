"use client";

import type { CSSProperties } from "react";
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
  ArrowRight,
  ArrowUpRight,
  EnvelopeSimple,
  Newspaper,
  CalendarBlank,
  CalendarDots,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { Spotlight } from "../Spotlight";
import { situations, studentTools, type StudentTool } from "@/lib/situations";
import { TERM } from "@/lib/term";
import styles from "./DlaStudentaContent.module.css";

const situationIcons: Record<string, Icon> = {
  zapomoga: HandCoins,
  stypendium: GraduationCap,
  srednia: Calculator,
  semestr: Exam,
  podanie: FileText,
  usos: Desktop,
  ocena: Scales,
  spor: Gavel,
  psychika: Heart,
  zajecia: MapTrifold,
  biblioteka: Books,
  dyplom: GraduationCap,
  start: Compass,
  kontakt: Question,
  zaangazowanie: UsersFour,
  publikacja: BookOpenText,
};

const toolIcons: Record<StudentTool["key"], Icon> = {
  usos: Desktop,
  intranet: Newspaper,
  plan: CalendarBlank,
  harmonogram: CalendarDots,
};

export function DlaStudentaContent() {
  const t = useTranslations("dlaStudenta");
  const tc = useTranslations("common");

  return (
    <>
      {/*
        Narzędzia na co dzień — zaraz pod hero. To najczęściej klikane rzeczy na
        studiach; wcześniej stały na końcu strony jako cztery drobne pigułki,
        więc student, który chciał tylko wejść do USOS, przewijał 16 kart.
      */}
      <nav aria-label={t("toolsLabel")} className={styles.toolsWrap}>
        <ul className={styles.tools}>
          {studentTools.map((tool) => {
            const Glyph = toolIcons[tool.key];
            return (
              <li key={tool.key}>
                <a href={tool.href} target="_blank" rel="noopener noreferrer" className={styles.tool}>
                  <span className={styles.toolIcon}>
                    <Glyph size={20} weight="regular" aria-hidden="true" />
                  </span>
                  <span className={styles.toolText}>
                    <span className={styles.toolTitle}>{t(`quickLinks.${tool.key}`, { term: TERM })}</span>
                    <span className={styles.toolDesc}>{t(`quickDesc.${tool.key}`)}</span>
                  </span>
                  <ArrowUpRight size={16} weight="bold" aria-hidden="true" className={styles.toolArrow} />
                  <span className="sr-only">({tc("newTab")})</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sytuacje — student zaczyna od tego, co go spotkało, nie od nazwy jednostki. */}
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
              <ArrowRight
                size={14}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-150 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/*
            Cztery kolumny na szerokim ekranie, a nie trzy: przy 16 sytuacjach
            trzy kolumny zostawiały jedną kartę samą w ostatnim rzędzie.
            Wejście kart robi CSS (`.reveal`), nie skrypt — karty są widoczne
            w HTML z serwera od pierwszej chwili.
          */}
          <ul className={styles.grid}>
            {situations.map((situation, i) => {
              const Glyph = situationIcons[situation.key] ?? Compass;
              return (
                <li
                  key={situation.key}
                  className={`reveal ${styles.card}`}
                  style={{ "--reveal-delay": Math.min(i % 4, 3) * 0.06 } as CSSProperties}
                >
                  <span className={styles.cardIcon}>
                    <Glyph size={22} weight="regular" aria-hidden="true" />
                  </span>
                  <h3 className={styles.cardTitle}>
                    {/* Rozciągnięty odnośnik: cała karta jest celem, a dostępna
                        nazwa to sam tytuł, bez powtarzania opisu. */}
                    <Link href={situation.href} className={styles.cardLink}>
                      {t(`situations.${situation.key}.title`)}
                    </Link>
                  </h3>
                  <p className={styles.cardDesc}>{t(`situations.${situation.key}.desc`)}</p>
                  <p className={styles.cardDest}>
                    <span>{t(`situations.${situation.key}.dest`)}</span>
                    <ArrowRight size={14} weight="bold" aria-hidden="true" className={styles.cardArrow} />
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Ostatnia deska ratunku: nic nie pasuje — piszesz do nas. */}
      <section className="section-padding pt-0" aria-labelledby="dla-studenta-cta">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:flex-row sm:items-center">
              <div>
                <h2
                  id="dla-studenta-cta"
                  className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
                >
                  {t("ctaHeading")}
                </h2>
                <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("ctaDesc")}</p>
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
