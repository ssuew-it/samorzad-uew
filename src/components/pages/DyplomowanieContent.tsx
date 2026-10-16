"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowSquareOut,
  Calculator,
  Check,
  CheckCircle,
  Exam,
  FileText,
  Gauge,
  GraduationCap,
  ShieldCheck,
  UploadSimple,
  WarningDiamond,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { DURATION, EASE } from "@/lib/motion";
import { diplomaInfopack, diplomaSources } from "@/lib/living-documents";

type GateKey = "grades" | "promoter" | "finance" | "apd" | "jsa" | "reviews";
type DeadlineKey = "firstWinter" | "secondWinter" | "firstSummer" | "secondSummer" | "taxSummer";
type JsaKey = "green" | "orange" | "red";
type ExamKey = "chair" | "promoter" | "reviewer";
type GradeKey = "studies" | "promoter" | "reviewer" | "examOne" | "examTwo" | "examThree";

const gateKeys: GateKey[] = ["grades", "promoter", "finance", "apd", "jsa", "reviews"];
const deadlineKeys: DeadlineKey[] = ["firstWinter", "secondWinter", "firstSummer", "secondSummer", "taxSummer"];
const jsaKeys: JsaKey[] = ["green", "orange", "red"];
const examKeys: ExamKey[] = ["chair", "promoter", "reviewer"];
const stageKeys = ["final", "metadata", "similarity", "decision", "reviews", "defence"] as const;
type StageKey = (typeof stageKeys)[number];

const stageIcons = [FileText, UploadSimple, ShieldCheck, CheckCircle, Exam, GraduationCap];

export function DyplomowanieContent() {
  const t = useTranslations("diplomaLive");
  // Uczelnia ma osobną, angielską instrukcję APD — na stronie EN linkujemy do niej.
  const locale = useLocale();
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [gates, setGates] = useState<Record<GateKey, boolean>>({ grades: false, promoter: false, finance: false, apd: false, jsa: false, reviews: false });
  const [deadline, setDeadline] = useState<DeadlineKey>("firstSummer");
  const [jsa, setJsa] = useState<JsaKey>("green");
  const [exam, setExam] = useState<ExamKey>("chair");
  const [activeStage, setActiveStage] = useState<StageKey>("metadata");
  const [grades, setGrades] = useState<Record<GradeKey, number>>({ studies: 4, promoter: 4, reviewer: 4, examOne: 4, examTwo: 4, examThree: 4 });

  const completed = gateKeys.filter((key) => gates[key]).length;
  const progress = Math.round((completed / gateKeys.length) * 100);
  const nextGate = gateKeys.find((key) => !gates[key]);
  const activeStageIndex = stageKeys.indexOf(activeStage);
  const ActiveStageIcon = stageIcons[activeStageIndex];
  const score = useMemo(() => {
    const reviewAverage = (grades.promoter + grades.reviewer) / 2;
    const examAverage = (grades.examOne + grades.examTwo + grades.examThree) / 3;
    return grades.studies * 0.6 + reviewAverage * 0.2 + examAverage * 0.2;
  }, [grades]);

  const setGrade = (key: GradeKey, value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) setGrades((current) => ({ ...current, [key]: Math.min(5, Math.max(2, parsed)) }));
  };

  return (
    <>
      <section className="diploma-hero relative overflow-hidden border-b border-white/10 bg-[#091d2a] text-white" aria-labelledby="diploma-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="diploma-enter diploma-enter-1 diploma-breadcrumbs">
            <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumbs.infopacks"), href: "/infopacki" }, { label: t("heroTitle") }]} />
          </div>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.56fr)] lg:gap-20">
            <div>
              <p className="diploma-enter diploma-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#a5e6d5]"><span className="diploma-status-dot h-2.5 w-2.5 rounded-full bg-[#59e2bb]" aria-hidden="true" />{t("heroLabel")}</p>
              <h1 id="diploma-title" className="diploma-enter diploma-enter-3 mt-6 max-w-[12ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("heroTitle")}</h1>
              <p className="diploma-enter diploma-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/75 sm:text-[1.125rem]">{t("heroLead")}</p>
              <a href="#readiness" className="diploma-motion group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#66e5c1] px-6 py-3 font-semibold text-[#09251f] hover:bg-[#a5f2dc]">{t("heroCta")}<ArrowDown size={19} weight="bold" className="transition-transform group-hover:translate-y-1" aria-hidden="true" /></a>
            </div>
            <InfopackSourceVisual
              src="/photos/infopacki/dyplomowanie-cover.jpg"
              href={diplomaInfopack}
              openLabel={t("status.title")}
              sourceLabel={t("status.label")}
              sourceTitle={t("status.title")}
              details={[
                { label: t("status.primary"), value: t("status.primaryValue") },
                { label: t("status.final"), value: "30.09.2026" },
                { label: t("status.checked"), value: "13.08.2026" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section id="readiness" className="section-padding scroll-mt-20" aria-labelledby="readiness-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.48fr)] lg:items-end lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("readiness.label")}</p><h2 id="readiness-heading" className="mt-4 max-w-[15ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("readiness.heading")}</h2><p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("readiness.lead")}</p></div><p className="border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("readiness.privacy")}</p></div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(300px,0.54fr)] lg:gap-14">
            <div className="border-y border-border-medium" data-testid="diploma-gates">
              {gateKeys.map((key, index) => (
                <label key={key} className="diploma-gate group grid cursor-pointer grid-cols-[44px_minmax(0,1fr)] gap-4 border-b border-border-subtle px-1 py-5 last:border-b-0 sm:px-5">
                  <input type="checkbox" checked={gates[key]} onChange={() => setGates((current) => ({ ...current, [key]: !current[key] }))} className="peer sr-only" />
                  <span className="diploma-check flex h-11 w-11 items-center justify-center rounded-full border border-border-medium bg-bg-surface text-transparent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-checked:border-[#14795f] peer-checked:bg-[#14795f] peer-checked:text-white"><Check size={20} weight="bold" aria-hidden="true" /></span>
                  <span><span className="flex items-start justify-between gap-4"><span className="text-[0.9375rem] font-semibold leading-[1.5] text-ink-primary">{t(`readiness.gates.${key}.title`)}</span><span className="font-mono text-[0.625rem] text-ink-tertiary">0{index + 1}</span></span><span className="mt-2 block max-w-[70ch] text-[0.75rem] leading-[1.6] text-ink-secondary">{t(`readiness.gates.${key}.body`)}</span></span>
                </label>
              ))}
            </div>

            <aside className="sticky top-24 self-start bg-[#0e332c] p-6 text-white sm:p-8" aria-live="polite">
              <div className="flex items-center justify-between gap-4"><p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#8ff0d4]"><Gauge size={20} weight="duotone" aria-hidden="true" />{t("readiness.resultLabel")}</p><span className="font-display text-[2rem] font-semibold tabular-nums" data-testid="readiness-progress">{progress}%</span></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15" aria-hidden="true"><motion.span className="block h-full rounded-full bg-[#66e5c1]" animate={{ width: `${progress}%` }} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} /></div>
              <p className="mt-3 font-mono text-[0.6875rem] text-white/55">{t("readiness.count", { completed, total: gateKeys.length })}</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={nextGate ?? "complete"} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={reduce ? { duration: 0 } : { duration: 0.2 }} className="mt-8 border-t border-white/20 pt-6" data-testid="next-gate">
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-white/50">{nextGate ? t("readiness.next") : t("readiness.completeLabel")}</p>
                  <h3 className="mt-3 text-[1.05rem] font-semibold">{nextGate ? t(`readiness.gates.${nextGate}.title`) : t("readiness.completeTitle")}</h3>
                  <p className="mt-3 text-[0.75rem] leading-[1.65] text-white/68">{nextGate ? t(`readiness.gates.${nextGate}.action`) : t("readiness.completeBody")}</p>
                </motion.div>
              </AnimatePresence>
              <button type="button" onClick={() => setGates({ grades: false, promoter: false, finance: false, apd: false, jsa: false, reviews: false })} className="diploma-motion mt-7 min-h-11 text-[0.75rem] font-semibold text-[#8ff0d4] hover:text-white">{t("readiness.reset")}</button>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-border-medium bg-[#e9f6f2] py-12 dark:bg-[#102d28]" aria-labelledby="definition-heading"><div className="mx-auto max-w-[1200px] px-6"><div className="grid gap-8 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:items-center lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#14795f] dark:text-[#8ff0d4]">{t("definition.label")}</p><h2 id="definition-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-ink-primary">{t("definition.heading")}</h2></div><div className="grid gap-px bg-[#8db9ad] sm:grid-cols-2"><article className="bg-bg-surface p-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f6ed] text-[#14795f]"><CheckCircle size={21} weight="duotone" aria-hidden="true" /></span><h3 className="mt-4 text-[0.9375rem] font-semibold text-ink-primary">{t("definition.approval.title")}</h3><p className="mt-3 text-[0.75rem] leading-[1.6] text-ink-secondary">{t("definition.approval.body")}</p></article><article className="bg-bg-surface p-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f6ed] text-[#14795f]"><CheckCircle size={21} weight="duotone" aria-hidden="true" /></span><h3 className="mt-4 text-[0.9375rem] font-semibold text-ink-primary">{t("definition.grades.title")}</h3><p className="mt-3 text-[0.75rem] leading-[1.6] text-ink-secondary">{t("definition.grades.body")}</p></article></div></div></div></section>

      <section className="section-padding" aria-labelledby="timeline-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.48fr)] lg:items-end lg:gap-20">
            <div>
              <h2 id="timeline-heading" className="max-w-[16ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("timeline.heading")}</h2>
              <p className="mt-5 max-w-[67ch] text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("timeline.lead")}</p>
            </div>
            <p className="border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("timeline.mapNote")}</p>
          </div>

          <div className="diploma-process-map mt-10 scroll-mt-24 overflow-hidden border border-[#285b4f] bg-[#0e332c] text-white" data-testid="diploma-process-map">
            <div className="grid lg:grid-cols-[minmax(250px,0.56fr)_minmax(0,1.44fr)]">
              <nav className="border-b border-white/15 bg-[#0a2924] lg:border-b-0 lg:border-r" aria-label={t("timeline.navigatorLabel")}>
                <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
                  <p className="text-[0.75rem] font-semibold text-[#8ff0d4]">{t("timeline.label")}</p>
                  <span className="font-mono text-[0.6875rem] text-white/50">{activeStageIndex + 1}/{stageKeys.length}</span>
                </div>
                <ol className="diploma-stage-rail flex overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8ff0d4] lg:grid lg:grid-cols-1 lg:overflow-visible" tabIndex={0} aria-label={t("timeline.navigatorLabel")}>
                  {stageKeys.map((stage, index) => {
                    const Icon = stageIcons[index];
                    const isActive = stage === activeStage;
                    const isPast = index < activeStageIndex;
                    return (
                      <li key={stage} className="min-w-[190px] flex-none border-r border-white/10 last:border-r-0 lg:min-w-0 lg:border-b lg:border-r-0 lg:last:border-b-0">
                        <button
                          type="button"
                          aria-current={isActive ? "step" : undefined}
                          onClick={() => setActiveStage(stage)}
                          className="diploma-stage-button grid min-h-[76px] w-full grid-cols-[34px_minmax(0,1fr)_24px] items-center gap-3 px-4 py-3 text-left"
                        >
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-[#66e5c1] text-[#09251f]" : isPast ? "bg-white/15 text-[#8ff0d4]" : "bg-white/7 text-white/55"}`}>
                            <Icon size={17} weight={isActive ? "fill" : "duotone"} aria-hidden="true" />
                          </span>
                          <span className={`text-[0.75rem] font-semibold leading-[1.4] ${isActive ? "text-white" : "text-white/68"}`}>{t(`timeline.stages.${stage}.title`)}</span>
                          <span className="font-mono text-[0.625rem] text-white/70">0{index + 1}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="min-w-0 p-5 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
                  <p className="font-mono text-[0.6875rem] text-white/55">APD / {t("timeline.fileLabel")}</p>
                  <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold text-[#8ff0d4]"><span className="h-2 w-2 rounded-full bg-[#66e5c1]" aria-hidden="true" />{t("timeline.statusLabel")}</span>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.article
                    key={activeStage}
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? undefined : { opacity: 0, x: -8 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.24, ease: EASE }}
                    className="grid gap-8 py-8 md:grid-cols-[minmax(190px,0.72fr)_minmax(0,1.28fr)] md:items-center md:gap-12"
                    aria-live="polite"
                    data-testid="diploma-stage-detail"
                  >
                    <div className="diploma-file-sheet mx-auto flex aspect-[0.74] w-full max-w-[250px] flex-col bg-white p-6 text-[#0e332c] sm:p-7" aria-hidden="true">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-display text-[1.45rem] font-semibold tracking-[-0.03em]">APD</span>
                        <span className="font-mono text-[0.625rem]">0{activeStageIndex + 1}</span>
                      </div>
                      <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#dff7f0] text-[#14795f]"><ActiveStageIcon size={28} weight="duotone" /></span>
                      <div className="mt-7 space-y-3">
                        <span className="block h-1.5 w-full bg-[#c8d9d4]" />
                        <span className="block h-1.5 w-[82%] bg-[#c8d9d4]" />
                        <span className="block h-1.5 w-[58%] bg-[#c8d9d4]" />
                      </div>
                      <span className="diploma-file-stamp mt-auto border-2 border-[#14795f] px-3 py-2 text-center text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#14795f]">{t(`timeline.stages.${activeStage}.stamp`)}</span>
                    </div>

                    <div>
                      <p className="text-[0.6875rem] font-semibold text-[#8ff0d4]">{t("timeline.ownerLabel")}: {t(`timeline.stages.${activeStage}.owner`)}</p>
                      <h3 className="mt-4 max-w-[18ch] text-balance font-display text-[clamp(1.8rem,3.5vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.03em]">{t(`timeline.stages.${activeStage}.title`)}</h3>
                      <p className="mt-5 max-w-[58ch] text-pretty text-[0.875rem] leading-[1.75] text-white/72">{t(`timeline.stages.${activeStage}.body`)}</p>
                      <div className="mt-7 border-y border-white/15 py-5">
                        <p className="text-[0.6875rem] font-semibold text-white/50">{t("timeline.proofLabel")}</p>
                        <p className="mt-2 text-[0.8125rem] font-semibold leading-[1.55] text-white/90">{t(`timeline.stages.${activeStage}.proof`)}</p>
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>

                <div className="h-1 overflow-hidden bg-white/10" aria-hidden="true">
                  <motion.span className="block h-full bg-[#66e5c1]" animate={{ width: `${((activeStageIndex + 1) / stageKeys.length) * 100}%` }} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-y border-border-medium bg-bg-elevated" aria-labelledby="deadlines-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("deadlines.label")}</p><h2 id="deadlines-heading" className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("deadlines.heading")}</h2><p className="mt-5 text-[0.875rem] leading-[1.7] text-ink-secondary">{t("deadlines.lead")}</p></div><div><fieldset><legend className="text-[0.8125rem] font-semibold text-ink-primary">{t("deadlines.legend")}</legend><div className="mt-4 flex flex-wrap gap-2">{deadlineKeys.map((key) => <button key={key} type="button" aria-pressed={deadline === key} onClick={() => setDeadline(key)} className="diploma-choice min-h-11 border border-border-medium bg-bg-surface px-4 py-2 text-left text-[0.75rem] font-semibold text-ink-secondary">{t(`deadlines.profiles.${key}.label`)}</button>)}</div></fieldset><div className="mt-6 grid gap-px bg-border-medium sm:grid-cols-2" aria-live="polite"><div className="bg-bg-surface p-6"><p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-tertiary">{t("deadlines.primary")}</p><p className="mt-3 font-display text-[2rem] font-semibold text-ink-primary tabular-nums" data-testid="primary-date">{t(`deadlines.profiles.${deadline}.primary`)}</p><p className="mt-2 text-[0.75rem] text-[#9b4b19] dark:text-[#ffb787]">{t("deadlines.passed")}</p></div><div className="bg-[#0e332c] p-6 text-white"><p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-white/55">{t("deadlines.final")}</p><p className="mt-3 font-display text-[2rem] font-semibold tabular-nums">{t(`deadlines.profiles.${deadline}.final`)}</p><p className="mt-2 text-[0.75rem] text-[#8ff0d4]">{t(`deadlines.profiles.${deadline}.state`)}</p></div></div><p className="mt-5 flex gap-3 text-[0.75rem] leading-[1.6] text-ink-secondary"><WarningDiamond size={19} weight="duotone" className="mt-0.5 shrink-0 text-[#a4591d]" aria-hidden="true" />{t("deadlines.warning")}</p></div></div></div></section>

      <section className="section-padding" aria-labelledby="jsa-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("jsa.label")}</p><h2 id="jsa-heading" className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("jsa.heading")}</h2><p className="mt-5 text-[0.875rem] leading-[1.7] text-ink-secondary">{t("jsa.lead")}</p></div><div><div className="grid grid-cols-3 gap-px bg-border-medium" role="group" aria-label={t("jsa.legend")}>{jsaKeys.map((key) => <button key={key} type="button" aria-pressed={jsa === key} onClick={() => setJsa(key)} className={`diploma-jsa diploma-jsa-${key} min-h-[78px] bg-bg-surface px-3 py-4 text-center`}><span className="block font-display text-[1.2rem] font-semibold text-ink-primary">{t(`jsa.states.${key}.range`)}</span><span className="mt-1 block text-[0.6875rem] font-semibold text-ink-secondary">{t(`jsa.states.${key}.color`)}</span></button>)}</div><motion.article key={jsa} initial={reduce ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { duration: 0.22 }} className="mt-5 border border-[#5ea58f] bg-bg-elevated p-6" aria-live="polite" data-testid="jsa-result"><h3 className="text-[1rem] font-semibold text-ink-primary">{t(`jsa.states.${jsa}.title`)}</h3><p className="mt-3 text-[0.8125rem] leading-[1.65] text-ink-secondary">{t(`jsa.states.${jsa}.body`)}</p></motion.article><p className="mt-5 text-[0.75rem] leading-[1.6] text-ink-tertiary">{t("jsa.rule")}</p></div></div></div></section>

      <section className="section-padding border-y border-border-medium bg-[#101c32] text-white" aria-labelledby="exam-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.48fr)] lg:items-end lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[#9db8ff]">{t("exam.label")}</p><h2 id="exam-heading" className="mt-4 max-w-[14ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">{t("exam.heading")}</h2><p className="mt-5 max-w-[67ch] text-[0.9375rem] leading-[1.75] text-white/75">{t("exam.lead")}</p></div><p className="border-t border-white/20 pt-4 text-[0.8125rem] leading-[1.6] text-white/75">{t("exam.notice")}</p></div><div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-14"><div className="border-y border-white/20">{examKeys.map((key, index) => <button key={key} type="button" aria-pressed={exam === key} onClick={() => setExam(key)} className="diploma-exam-button grid min-h-[88px] w-full grid-cols-[36px_minmax(0,1fr)] items-center gap-4 border-b border-white/15 px-2 text-left last:border-b-0"><span className="font-mono text-[0.6875rem] text-[#9db8ff]">0{index + 1}</span><span><span className="block text-[0.875rem] font-semibold">{t(`exam.questions.${key}.source`)}</span><span className="mt-1 block text-[0.6875rem] text-white/75">{t(`exam.questions.${key}.role`)}</span></span></button>)}</div><motion.article key={exam} initial={reduce ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={reduce ? { duration: 0 } : { duration: 0.24 }} className="bg-white p-7 text-[#101c32] sm:p-9" aria-live="polite" data-testid="exam-card"><p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[#34415f]">{t("exam.cardLabel")}</p><h3 className="mt-4 max-w-[20ch] font-display text-[clamp(1.7rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">{t(`exam.questions.${exam}.title`)}</h3><p className="mt-5 text-[0.8125rem] leading-[1.7] text-[#30394d]">{t(`exam.questions.${exam}.body`)}</p><div className="mt-6 border-t border-[#ccd3e3] pt-5"><p className="text-[0.75rem] font-semibold text-[#26314b]">{t("exam.prepare")}</p><p className="mt-2 text-[0.75rem] leading-[1.6] text-[#384258]">{t(`exam.questions.${exam}.prepare`)}</p></div></motion.article></div></div></section>

      <section className="section-padding" aria-labelledby="calculator-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,1.42fr)] lg:gap-20"><div><p className="flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent"><Calculator size={17} weight="duotone" aria-hidden="true" />{t("calculator.label")}</p><h2 id="calculator-heading" className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("calculator.heading")}</h2><p className="mt-5 text-[0.875rem] leading-[1.7] text-ink-secondary">{t("calculator.lead")}</p><p className="mt-4 font-mono text-[0.75rem] text-accent">60% + 20% + 20%</p></div><div><div className="grid gap-px bg-border-medium sm:grid-cols-2 lg:grid-cols-3">{(["studies", "promoter", "reviewer", "examOne", "examTwo", "examThree"] as GradeKey[]).map((key) => <label key={key} className="bg-bg-surface p-5 text-[0.75rem] font-semibold text-ink-secondary"><span className="block min-h-[38px] leading-[1.5]">{t(`calculator.fields.${key}`)}</span><input aria-label={t(`calculator.fields.${key}`)} type="number" min="2" max="5" step="0.5" value={grades[key]} onChange={(event) => setGrade(key, event.target.value)} className="mt-3 min-h-12 w-full rounded-lg border border-border-medium bg-bg-surface px-4 font-display text-[1.25rem] font-semibold text-ink-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow" /></label>)}</div><div className="mt-5 flex flex-col justify-between gap-5 bg-[#0e332c] p-6 text-white sm:flex-row sm:items-center"><div><p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-white/55">{t("calculator.resultLabel")}</p><p className="mt-2 text-[0.75rem] leading-[1.55] text-white/65">{t("calculator.resultNote")}</p></div><output className="shrink-0 font-display text-[3rem] font-semibold leading-none text-[#8ff0d4] tabular-nums" data-testid="diploma-score">{score.toFixed(2)}</output></div><p className="mt-5 text-[0.75rem] leading-[1.6] text-ink-tertiary">{t("calculator.disclaimer")}</p></div></div></div></section>

      <section className="section-padding border-t border-border-medium bg-bg-elevated" aria-labelledby="diploma-sources-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("sources.label")}</p><h2 id="diploma-sources-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("sources.heading")}</h2><p className="mt-5 text-[0.875rem] leading-[1.7] text-ink-secondary">{t("sources.lead")}</p></div><div className="grid gap-px bg-border-medium sm:grid-cols-2">{(["studyRegulations", "process", "jsa", "apdGuide"] as const).map((source) => <a key={source} href={source === "apdGuide" && locale === "en" ? diplomaSources.apdGuideEn : diplomaSources[source]} target="_blank" rel="noopener noreferrer" className="diploma-motion group flex min-h-[112px] items-start justify-between gap-5 bg-bg-surface p-5 hover:bg-bg-elevated"><span><span className="block text-[0.875rem] font-semibold text-ink-primary">{t(`sources.links.${source}.title`)}</span><span className="mt-2 block text-[0.75rem] leading-[1.5] text-ink-tertiary">{t(`sources.links.${source}.meta`)}</span></span><ArrowSquareOut size={18} weight="bold" className="shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></a>)}</div></div><div className="mt-8 flex flex-wrap gap-3"><a href={diplomaInfopack} target="_blank" rel="noopener noreferrer" className="diploma-motion inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium bg-bg-surface px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">{t("sources.infopack")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a><a href={diplomaSources.deanOffice} target="_blank" rel="noopener noreferrer" className="diploma-motion inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t("sources.deanOffice")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a></div></div></section>
    </>
  );
}
