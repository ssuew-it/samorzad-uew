"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowRight,
  ArrowSquareOut,
  BookOpen,
  CheckCircle,
  Info,
  WarningCircle,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { DURATION, EASE } from "@/lib/motion";
import {
  studyRegulationInfopack,
  studyRegulationPage,
  studyRegulationSource,
} from "@/lib/living-documents";

type TopicKey =
  | "absence"
  | "supplementary"
  | "grades"
  | "exams"
  | "conditional"
  | "registration"
  | "leave"
  | "applications";

interface Topic {
  key: TopicKey;
  section: string;
  page: number;
  correction?: boolean;
}

interface GradeScaleRow {
  name: string;
  grade: string;
  threshold: string;
}

const topics: Topic[] = [
  { key: "absence", section: "§ 18", page: 16 },
  { key: "supplementary", section: "§ 23–24", page: 19 },
  { key: "grades", section: "§ 26–27", page: 21 },
  { key: "exams", section: "§ 28–31", page: 24 },
  { key: "conditional", section: "§ 39–40", page: 28, correction: true },
  { key: "registration", section: "§ 23–24", page: 19 },
  { key: "leave", section: "§ 19–20", page: 16 },
  { key: "applications", section: "§ 11–14", page: 11 },
];

export function RegulaminStudiowContent() {
  const t = useTranslations("studyRegLive");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [activeKey, setActiveKey] = useState<TopicKey>("absence");
  const activeTopic = topics.find((topic) => topic.key === activeKey) ?? topics[0];
  const activeIndex = topics.findIndex((topic) => topic.key === activeTopic.key);
  const facts = t.raw(`topics.${activeTopic.key}.facts`) as string[];
  const gradeScale = activeTopic.key === "grades"
    ? t.raw("topics.grades.scale") as GradeScaleRow[]
    : [];

  return (
    <>
      <section
        className="living-regulation-hero relative overflow-hidden border-b border-white/10 bg-[#0a1639] text-white"
        aria-labelledby="study-regulation-title"
      >
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="living-regulation-enter living-regulation-enter-1 living-regulation-breadcrumbs">
            <Breadcrumbs
              items={[
                { label: tc("home"), href: "/" },
                { label: t("breadcrumbs.infopacks"), href: "/infopacki" },
                { label: t("heroTitle") },
              ]}
            />
          </div>

          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(350px,0.72fr)] lg:gap-20">
            <div>
              <p className="living-regulation-enter living-regulation-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#aebcff]">
                <span className="living-source-pulse h-2.5 w-2.5 rounded-full bg-[#ffb21c]" aria-hidden="true" />
                {t("heroLabel")}
              </p>
              <h1
                id="study-regulation-title"
                className="living-regulation-enter living-regulation-enter-3 mt-6 max-w-[15ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]"
              >
                {t("heroTitle")}
              </h1>
              <p className="living-regulation-enter living-regulation-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/75 sm:text-[1.125rem]">
                {t("heroLead")}
              </p>
              <a
                href="#tematy"
                className="living-regulation-motion living-regulation-enter living-regulation-enter-5 group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-white px-6 py-3 font-semibold text-[#0a1740] transition-[background-color,transform] duration-150 hover:bg-[#e9edff] active:scale-[0.98]"
              >
                {t("heroCta")}
                <ArrowDown
                  size={19}
                  weight="bold"
                  className="transition-transform duration-200 group-hover:translate-y-1"
                  aria-hidden="true"
                />
              </a>
            </div>

            <InfopackSourceVisual
              src="/photos/infopacki/regulamin-cover.jpg"
              href={studyRegulationInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.versionLabel"), value: t("source.version") },
                { label: t("source.checkedLabel"), value: t("source.checkedDate") },
                { label: t("source.ownerLabel"), value: t("source.owner") },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section
        id="tematy"
        className="section-padding scroll-mt-20"
        aria-labelledby="topics-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.62fr)] lg:items-end lg:gap-20">
            <div>
              <h2
                id="topics-heading"
                className="max-w-[17ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary"
              >
                {t("navigator.heading")}
              </h2>
              <p className="mt-5 max-w-[65ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
                {t("navigator.lead")}
              </p>
              <p className="mt-4 max-w-[65ch] text-pretty text-[0.875rem] font-medium leading-[1.65] text-accent">
                {t("navigator.infopackStructure")}
              </p>
            </div>
            <p className="flex items-start gap-3 border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary">
              <Info size={19} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              {t("navigator.disclaimer")}
            </p>
          </div>

          <div className="mt-12 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
            <div role="group" aria-label={t("navigator.ariaLabel")} className="min-w-0 border-y border-border-medium">
              {topics.map((topic, index) => {
                const isActive = topic.key === activeKey;

                return (
                  <button
                    key={topic.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveKey(topic.key)}
                    className="living-topic-button living-regulation-motion group grid min-h-[76px] w-full grid-cols-[44px_minmax(0,1fr)_22px] items-center gap-4 border-b border-border-subtle px-2 py-3 text-left last:border-b-0 sm:px-4"
                  >
                    <span
                      className={`font-display text-[1.25rem] font-semibold tabular-nums transition-colors duration-200 ${
                        isActive ? "text-[#754300] dark:text-[#ffbd3e]" : "text-ink-tertiary group-hover:text-accent"
                      }`}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-[0.875rem] font-semibold leading-[1.4] text-ink-primary">
                        {t(`topics.${topic.key}.label`)}
                      </span>
                      <span
                        className={`mt-1 block font-mono text-[0.6875rem] ${
                          isActive ? "text-ink-secondary" : "text-ink-tertiary"
                        }`}
                      >
                        {topic.section}
                      </span>
                    </span>
                    <ArrowRight
                      size={18}
                      weight="bold"
                      className={`transition-transform duration-200 ${isActive ? "translate-x-1 text-accent" : "text-ink-tertiary group-hover:translate-x-1 group-hover:text-accent"}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <div className="min-h-[560px] min-w-0" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={activeTopic.key}
                  initial={reduce ? false : { opacity: 0, x: 14, filter: "blur(3px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={reduce ? undefined : { opacity: 0, x: -8, filter: "blur(2px)" }}
                  transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }}
                  className="min-h-[560px] bg-bg-surface"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-medium bg-bg-elevated px-5 py-4 sm:px-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-display text-[0.9375rem] font-semibold text-[#754300] dark:text-[#ffbd3e]">
                        {String(activeIndex + 1).padStart(2, "0")} / {String(topics.length).padStart(2, "0")}
                      </p>
                      <p className="font-mono text-[0.6875rem] font-medium text-ink-secondary">
                        {activeTopic.section} · {t("navigator.sourcePage", { page: activeTopic.page })}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold text-accent">
                      <CheckCircle size={15} weight="fill" aria-hidden="true" />
                      {t("navigator.verified")}
                    </span>
                  </div>

                  <div className="p-6 sm:p-9">
                    <h3 className="max-w-[18ch] text-balance font-display text-[clamp(1.9rem,3.5vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink-primary">
                      {t(`topics.${activeTopic.key}.title`)}
                    </h3>
                    <p className="mt-5 max-w-[65ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">
                      {t(`topics.${activeTopic.key}.summary`)}
                    </p>

                    {activeTopic.correction ? (
                      <div className="mt-7 flex gap-3 rounded-lg border border-[#d6a400]/35 bg-[#fff8db] p-4 text-[#514000] dark:border-[#e6bd32]/30 dark:bg-[#3a310e] dark:text-[#fff0ae]">
                        <WarningCircle size={21} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-[0.8125rem] font-semibold">{t("correction.title")}</p>
                          <p className="mt-1 text-[0.8125rem] leading-[1.6]">{t("correction.body")}</p>
                        </div>
                      </div>
                    ) : null}

                    {activeTopic.key === "grades" ? (
                      <div className="mt-8 overflow-x-auto bg-[#214f83] px-5 py-6 text-white sm:px-7">
                        <table className="w-full min-w-[520px] border-collapse text-left">
                          <caption className="mb-5 text-left text-[0.8125rem] font-semibold text-white">
                            {t("navigator.gradeScale")}
                          </caption>
                          <thead>
                            <tr className="border-y border-white/70 text-[0.75rem] font-semibold text-[#ffbd3e]">
                              <th scope="col" className="px-2 py-3">{t("navigator.gradeName")}</th>
                              <th scope="col" className="px-2 py-3 text-center">{t("navigator.gradeValue")}</th>
                              <th scope="col" className="px-2 py-3 text-right">{t("navigator.gradeThreshold")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gradeScale.map((row) => (
                              <tr key={row.grade} className="border-b border-white/35 text-[0.8125rem]">
                                <td className="px-2 py-3.5">{row.name}</td>
                                <td className="px-2 py-3.5 text-center font-semibold tabular-nums">{row.grade}</td>
                                <td className="px-2 py-3.5 text-right tabular-nums">{row.threshold}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="mt-5 text-[0.75rem] leading-[1.6] text-white/75">{facts[3]}</p>
                      </div>
                    ) : (
                      <>
                        <h4 className="mt-8 text-[0.8125rem] font-semibold text-ink-primary">
                          {t("navigator.keyFacts")}
                        </h4>
                        <ul className="mt-3 border-y border-border-medium">
                          {facts.map((fact, index) => (
                            <li key={fact} className="grid grid-cols-[28px_1fr] gap-4 border-b border-border-subtle py-4 last:border-b-0">
                              <span className="font-display text-[0.75rem] font-semibold text-[#754300] dark:text-[#ffbd3e]" aria-hidden="true">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="text-[0.875rem] leading-[1.65] text-ink-secondary">{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <a
                      href={studyRegulationPage(activeTopic.page)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="living-regulation-motion group mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-accent-dim active:scale-[0.98]"
                    >
                      {t("navigator.openSource", { section: activeTopic.section, page: activeTopic.page })}
                      <ArrowSquareOut
                        size={18}
                        weight="bold"
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-border-subtle bg-bg-surface" aria-labelledby="sources-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20">
            <div>
              <BookOpen size={34} weight="duotone" className="text-accent" aria-hidden="true" />
              <h2
                id="sources-heading"
                className="mt-6 max-w-[15ch] text-balance font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink-primary"
              >
                {t("sources.heading")}
              </h2>
              <p className="mt-5 max-w-[56ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">
                {t("sources.lead")}
              </p>
            </div>

            <ul className="border-y border-border-medium">
              <li className="border-b border-border-subtle">
                <a
                  href={studyRegulationSource.landingPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="living-regulation-motion group flex min-h-[92px] items-center justify-between gap-5 px-2 py-4 hover:bg-bg-elevated sm:px-5"
                >
                  <span>
                    <span className="block text-[0.875rem] font-semibold text-ink-primary">{t("sources.bipTitle")}</span>
                    <span className="mt-1 block text-[0.75rem] text-ink-tertiary">{t("sources.bipDesc")}</span>
                  </span>
                  <ArrowSquareOut size={19} weight="bold" className="shrink-0 text-accent" aria-hidden="true" />
                </a>
              </li>
              <li className="border-b border-border-subtle">
                <a
                  href={studyRegulationSource.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="living-regulation-motion group flex min-h-[92px] items-center justify-between gap-5 px-2 py-4 hover:bg-bg-elevated sm:px-5"
                >
                  <span>
                    <span className="block text-[0.875rem] font-semibold text-ink-primary">{t("sources.pdfTitle")}</span>
                    <span className="mt-1 block text-[0.75rem] text-ink-tertiary">{t("sources.pdfDesc")}</span>
                  </span>
                  <ArrowSquareOut size={19} weight="bold" className="shrink-0 text-accent" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={studyRegulationInfopack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="living-regulation-motion group flex min-h-[92px] items-center justify-between gap-5 px-2 py-4 hover:bg-bg-elevated sm:px-5"
                >
                  <span>
                    <span className="block text-[0.875rem] font-semibold text-ink-primary">{t("sources.infopackTitle")}</span>
                    <span className="mt-1 block text-[0.75rem] text-ink-tertiary">{t("sources.infopackDesc")}</span>
                  </span>
                  <ArrowSquareOut size={19} weight="bold" className="shrink-0 text-accent" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
