"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  AirplaneTilt,
  ArrowDown,
  ArrowSquareOut,
  Briefcase,
  Flask,
  Lightbulb,
  MicrophoneStage,
  Path,
  SoccerBall,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { DURATION, EASE } from "@/lib/motion";
import { studentLifeInfopack, studentLifeSources } from "@/lib/living-documents";

type AnswerKey = "goal" | "pace" | "mode" | "start";
type PathKey = "organisations" | "circles" | "sport" | "choir" | "mobility" | "dthub" | "career" | "kafe";

interface StudentPath {
  key: PathKey;
  icon: typeof UsersThree;
  href: string;
  tags: string[];
}

const questions: Array<{ key: AnswerKey; options: string[] }> = [
  { key: "goal", options: ["relationships", "expertise", "career", "world", "expression", "impact"] },
  { key: "pace", options: ["weekly", "project", "flexible"] },
  { key: "mode", options: ["lead", "build", "perform", "compete", "support"] },
  { key: "start", options: ["zero", "ready"] },
];

const paths: StudentPath[] = [
  { key: "organisations", icon: UsersThree, href: studentLifeSources.organisations, tags: ["relationships", "impact", "weekly", "project", "lead", "build", "support", "zero"] },
  { key: "circles", icon: Flask, href: studentLifeSources.organisations, tags: ["expertise", "career", "weekly", "project", "build", "zero"] },
  { key: "sport", icon: SoccerBall, href: studentLifeSources.sport, tags: ["relationships", "expression", "weekly", "compete", "ready"] },
  { key: "choir", icon: MicrophoneStage, href: studentLifeSources.choir, tags: ["relationships", "expression", "weekly", "perform", "zero"] },
  { key: "mobility", icon: AirplaneTilt, href: studentLifeSources.mobility, tags: ["world", "expertise", "project", "flexible", "ready"] },
  { key: "dthub", icon: Lightbulb, href: studentLifeSources.dtHub, tags: ["expertise", "career", "impact", "project", "build", "zero"] },
  { key: "career", icon: Briefcase, href: studentLifeSources.career, tags: ["career", "expertise", "flexible", "project", "support", "zero"] },
  { key: "kafe", icon: Sparkle, href: studentLifeSources.kafe, tags: ["career", "expertise", "impact", "weekly", "project", "build", "zero"] },
];

const commitmentQuestions = ["hours", "firstTask", "peak", "exit"] as const;

export function ZycieStudenckieContent() {
  const t = useTranslations("studentLifeLive");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({ goal: "relationships", pace: "project", mode: "build", start: "zero" });

  const rankedPaths = useMemo(() => paths.map((path, originalIndex) => ({
    ...path,
    originalIndex,
    score: Object.values(answers).reduce((sum, answer) => sum + (path.tags.includes(answer) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex), [answers]);

  return (
    <>
      <section className="life-hero relative overflow-hidden border-b border-white/10 bg-[#171443] text-white" aria-labelledby="life-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="life-enter life-enter-1 life-breadcrumbs"><Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumbs.infopacks"), href: "/infopacki" }, { label: t("heroTitle") }]} /></div>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.56fr)] lg:gap-20">
            <div><p className="life-enter life-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#c9c4ff]"><span className="h-2.5 w-2.5 rounded-full bg-[#ffcf58]" aria-hidden="true" />{t("heroLabel")}</p><h1 id="life-title" className="life-enter life-enter-3 mt-6 max-w-[12ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("heroTitle")}</h1><p className="life-enter life-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/76 sm:text-[1.125rem]">{t("heroLead")}</p><a href="#matcher" className="life-motion group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#ffcf58] px-6 py-3 font-semibold text-[#211738] hover:bg-[#ffe39a]">{t("heroCta")}<ArrowDown size={19} weight="bold" className="transition-transform group-hover:translate-y-1" aria-hidden="true" /></a></div>
            <InfopackSourceVisual
              src="/photos/infopacki/zycie-cover.jpg"
              href={studentLifeInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.paths"), value: "8" },
                { label: t("source.questions"), value: "4" },
                { label: t("source.checked"), value: "13.08.2026" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section id="matcher" className="section-padding scroll-mt-20" aria-labelledby="matcher-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.5fr)] lg:items-end lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("matcher.label")}</p><h2 id="matcher-heading" className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("matcher.heading")}</h2><p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("matcher.lead")}</p></div><p className="border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("matcher.note")}</p></div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
          <div className="border-y border-border-medium">{questions.map((question, index) => <fieldset key={question.key} className="border-b border-border-medium py-6 last:border-b-0"><legend className="flex gap-3 text-[0.875rem] font-semibold text-ink-primary"><span className="font-mono text-[0.6875rem] text-accent">0{index + 1}</span>{t(`matcher.questions.${question.key}.label`)}</legend><div className="mt-4 flex flex-wrap gap-2">{question.options.map((option) => <button key={option} type="button" aria-pressed={answers[question.key] === option} onClick={() => setAnswers((current) => ({ ...current, [question.key]: option }))} className="life-option life-motion min-h-11 border border-border-medium bg-bg-surface px-4 py-2 text-[0.75rem] font-semibold text-ink-secondary">{t(`matcher.options.${option}`)}</button>)}</div></fieldset>)}</div>
          <div className="min-h-[630px] bg-[#211b55] p-5 text-white sm:p-8" aria-live="polite"><div className="flex items-center justify-between gap-5 border-b border-white/20 pb-5"><p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#ffda79]"><Path size={19} weight="duotone" aria-hidden="true" />{t("matcher.resultLabel")}</p><span className="font-mono text-[0.6875rem] text-white/55">{t("matcher.live")}</span></div><div className="mt-6 space-y-3">{rankedPaths.slice(0, 3).map((path, index) => { const Icon = path.icon; return <motion.article layout key={path.key} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} className={`life-result ${index === 0 ? "bg-white text-[#171443]" : "border border-white/20 text-white"} p-5`}><div className="flex items-start justify-between gap-4"><div className="flex gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-[#ffcf58] text-[#211738]" : "bg-white/10 text-[#ffda79]"}`}><Icon size={21} weight="duotone" aria-hidden="true" /></span><div><p className={`font-mono text-[0.625rem] uppercase tracking-[0.1em] ${index === 0 ? "text-[#5b527e]" : "text-white/55"}`}>{index === 0 ? t("matcher.best") : t("matcher.alternative", { number: index })}</p><h3 className="mt-2 text-[1.05rem] font-semibold">{t(`paths.${path.key}.title`)}</h3></div></div><span className={`font-display text-[1.6rem] font-semibold ${index === 0 ? "text-[#5645d6]" : "text-[#ffda79]"}`}>{path.score}/4</span></div><p className={`mt-4 text-[0.75rem] leading-[1.6] ${index === 0 ? "text-[#514c68]" : "text-white/70"}`}>{t(`paths.${path.key}.summary`)}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className={`text-[0.6875rem] font-medium ${index === 0 ? "text-[#514c68]" : "text-white/60"}`}>{t(`paths.${path.key}.rhythm`)}</span><a href={path.href} target="_blank" rel="noopener noreferrer" className={`life-motion inline-flex min-h-10 items-center gap-2 text-[0.75rem] font-semibold ${index === 0 ? "text-[#3c2fc0]" : "text-[#ffda79]"}`}>{t("matcher.open")}<ArrowSquareOut size={15} weight="bold" aria-hidden="true" /></a></div></motion.article>; })}</div><p className="mt-6 border-t border-white/20 pt-5 text-[0.75rem] leading-[1.6] text-white/65">{t("matcher.disclaimer")}</p></div>
        </div>
      </div></section>

      <section className="section-padding border-y border-border-medium bg-[#fff5d7] dark:bg-[#2c2410]" aria-labelledby="commitment-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[#7a5610] dark:text-[#ffda79]">{t("commitment.label")}</p><h2 id="commitment-heading" className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("commitment.heading")}</h2><p className="mt-5 max-w-[52ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("commitment.lead")}</p></div><ol className="border-y border-[#bba66c] dark:border-white/20">{commitmentQuestions.map((question, index) => <li key={question} className="grid gap-4 border-b border-[#d5c48e] py-5 last:border-b-0 dark:border-white/15 sm:grid-cols-[48px_minmax(0,1fr)]"><span className="font-display text-[1.5rem] font-semibold text-[#8a650f] dark:text-[#ffda79]">0{index + 1}</span><div><p className="text-[0.9375rem] font-semibold text-ink-primary">{t(`commitment.questions.${question}.question`)}</p><p className="mt-2 text-[0.75rem] leading-[1.6] text-ink-secondary">{t(`commitment.questions.${question}.why`)}</p></div></li>)}</ol></div></div></section>

      <section className="section-padding" aria-labelledby="start-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("start.label")}</p><h2 id="start-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("start.heading")}</h2><p className="mt-5 max-w-[48ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("start.lead")}</p></div><ol className="grid gap-px bg-border-medium sm:grid-cols-2">{(["observe", "contact", "trial", "decide"] as const).map((step, index) => <li key={step} className="bg-bg-surface p-6"><span className="font-mono text-[0.6875rem] font-semibold text-accent">0{index + 1}</span><h3 className="mt-4 text-[1rem] font-semibold text-ink-primary">{t(`start.steps.${step}.title`)}</h3><p className="mt-3 text-[0.75rem] leading-[1.6] text-ink-secondary">{t(`start.steps.${step}.body`)}</p></li>)}</ol></div></div></section>

      <section className="border-y border-border-medium bg-bg-elevated" aria-labelledby="current-heading"><div className="mx-auto max-w-[1200px] px-6 py-12"><div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-20"><div><p className="flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent"><Sparkle size={16} weight="fill" aria-hidden="true" />{t("current.label")}</p><h2 id="current-heading" className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-ink-primary">{t("current.heading")}</h2></div><div className="border-l-2 border-[#ffbf2f] pl-6"><p className="text-[0.9375rem] font-semibold text-ink-primary">{t("current.title")}</p><p className="mt-3 max-w-[70ch] text-[0.8125rem] leading-[1.65] text-ink-secondary">{t("current.body")}</p><a href={studentLifeSources.kafe} target="_blank" rel="noopener noreferrer" className="life-motion mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[0.8125rem] font-semibold text-white hover:bg-accent-dim">{t("current.cta")}<ArrowSquareOut size={16} weight="bold" aria-hidden="true" /></a></div></div></div></section>

      <section className="section-padding" aria-labelledby="life-sources-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("sources.label")}</p><h2 id="life-sources-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("sources.heading")}</h2><p className="mt-5 text-[0.875rem] leading-[1.7] text-ink-secondary">{t("sources.lead")}</p></div><div className="grid gap-px bg-border-medium sm:grid-cols-2">{(["organisations", "sport", "career", "dtHub"] as const).map((source) => <a key={source} href={studentLifeSources[source]} target="_blank" rel="noopener noreferrer" className="life-motion group flex min-h-[104px] items-start justify-between gap-5 bg-bg-surface p-5 hover:bg-bg-elevated"><span><span className="block text-[0.875rem] font-semibold text-ink-primary">{t(`sources.links.${source}.title`)}</span><span className="mt-2 block text-[0.75rem] leading-[1.5] text-ink-tertiary">{t(`sources.links.${source}.meta`)}</span></span><ArrowSquareOut size={18} weight="bold" className="shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></a>)}</div></div><a href={studentLifeInfopack} target="_blank" rel="noopener noreferrer" className="life-motion mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">{t("sources.infopack")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a></div></section>
    </>
  );
}
