"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowRight,
  ArrowSquareOut,
  CalendarDots,
  CheckCircle,
  ClockCountdown,
  Exam,
  Info,
  Path,
  Plus,
  Scales,
  SealCheck,
  Trash,
  Warning,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { Link } from "@/i18n/navigation";
import { DURATION, EASE } from "@/lib/motion";
import {
  semesterInfopack,
  semesterSources,
  studyRegulationPage,
} from "@/lib/living-documents";

type SituationKey = "prepare" | "absence" | "missing" | "dispute" | "failed";

interface Situation {
  key: SituationKey;
  section: string;
  page: number;
  infopackPages: string;
  tone: "calm" | "urgent";
  href?: string;
}

const situations: Situation[] = [
  { key: "prepare", section: "§§ 25–31", page: 20, infopackPages: "3–7, 9–10", tone: "calm" },
  { key: "absence", section: "§§ 18, 30", page: 16, infopackPages: "5", tone: "urgent", href: "/infopacki/podania" },
  { key: "missing", section: "§ 31", page: 24, infopackPages: "8", tone: "urgent", href: "/infopacki/usos" },
  { key: "dispute", section: "§§ 36–38", page: 26, infopackPages: "11", tone: "urgent", href: "/infopacki/podania" },
  { key: "failed", section: "§§ 39–40", page: 28, infopackPages: "12–13", tone: "urgent", href: "/infopacki/podania" },
];

const gradeOptions = [2, 3, 3.5, 4, 4.5, 5];

function mappedGrade(average: number, hasNegative: boolean) {
  if (hasNegative) return 2;
  if (average >= 4.75) return 5;
  if (average >= 4.25) return 4.5;
  if (average >= 3.75) return 4;
  if (average >= 3.25) return 3.5;
  return 3;
}

export function ZaliczenieSemestruContent() {
  const t = useTranslations("semesterLive");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [activeKey, setActiveKey] = useState<SituationKey>("missing");
  const [hasLecture, setHasLecture] = useState(true);
  const [lectureGrade, setLectureGrade] = useState(5);
  const [otherGrades, setOtherGrades] = useState([5, 3]);

  const active = situations.find((item) => item.key === activeKey) ?? situations[0];
  const actions = t.raw(`situations.${active.key}.actions`) as string[];
  const checks = t.raw(`situations.${active.key}.checks`) as string[];

  const calculation = useMemo(() => {
    const otherAverage = otherGrades.reduce((sum, grade) => sum + grade, 0) / otherGrades.length;
    const raw = hasLecture ? lectureGrade * 0.5 + otherAverage * 0.5 : otherAverage;
    const hasNegative = (hasLecture && lectureGrade === 2) || otherGrades.some((grade) => grade === 2);
    return { raw, final: mappedGrade(raw, hasNegative), hasNegative };
  }, [hasLecture, lectureGrade, otherGrades]);

  function changeOtherGrade(index: number, grade: number) {
    setOtherGrades((current) => current.map((item, itemIndex) => itemIndex === index ? grade : item));
  }

  return (
    <>
      <section className="semester-hero relative overflow-hidden border-b border-white/10 bg-[#081d3b] text-white" aria-labelledby="semester-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="semester-enter semester-enter-1 semester-breadcrumbs">
            <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumbs.infopacks"), href: "/infopacki" }, { label: t("heroTitle") }]} />
          </div>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.58fr)] lg:gap-20">
            <div>
              <p className="semester-enter semester-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#a7dbff]"><span className="h-2.5 w-2.5 rounded-full bg-[#ffc23d]" aria-hidden="true" />{t("heroLabel")}</p>
              <h1 id="semester-title" className="semester-enter semester-enter-3 mt-6 max-w-[12ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("heroTitle")}</h1>
              <p className="semester-enter semester-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/76 sm:text-[1.125rem]">{t("heroLead")}</p>
              <a href="#decision" className="semester-motion group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#ffc23d] px-6 py-3 font-semibold text-[#241900] hover:bg-[#ffdc82]">{t("heroCta")}<ArrowDown size={19} weight="bold" className="transition-transform group-hover:translate-y-1" aria-hidden="true" /></a>
            </div>
            <InfopackSourceVisual
              src="/photos/infopacki/semestr-cover.jpg"
              href={semesterInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.chapters"), value: "11" },
                { label: t("source.states"), value: "5" },
                { label: t("source.checked"), value: "13.08.2026" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border-medium bg-bg-surface" aria-labelledby="deadline-heading">
        <div className="mx-auto max-w-[1200px] px-6 py-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("deadlines.label")}</p><h2 id="deadline-heading" className="mt-2 font-display text-[1.45rem] font-semibold tracking-[-0.02em] text-ink-primary">{t("deadlines.heading")}</h2></div><ol className="grid flex-1 grid-cols-2 gap-px bg-border-medium lg:ml-12 lg:max-w-[760px] lg:grid-cols-4">{(["absence", "committee", "grades", "request"] as const).map((key) => <li key={key} className="bg-bg-surface px-4 py-3"><span className="block font-display text-[1.65rem] font-semibold leading-none text-ink-primary">{t(`deadlines.${key}.number`)}</span><span className="mt-2 block text-[0.6875rem] leading-[1.4] text-ink-secondary">{t(`deadlines.${key}.label`)}</span></li>)}</ol></div>
        </div>
      </section>

      <section id="decision" className="section-padding scroll-mt-20" aria-labelledby="decision-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.48fr)] lg:items-end lg:gap-20"><div><h2 id="decision-heading" className="max-w-[17ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("decision.heading")}</h2><p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("decision.lead")}</p></div><p className="flex items-start gap-3 border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary"><Info size={19} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />{t("decision.disclaimer")}</p></div>

          <div className="mt-10 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(285px,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
            <div className="border-y border-border-medium" role="group" aria-label={t("decision.ariaLabel")}>
              {situations.map((situation, index) => {
                const isActive = active.key === situation.key;
                return <button key={situation.key} type="button" aria-pressed={isActive} onClick={() => setActiveKey(situation.key)} className="semester-situation-button semester-motion group grid min-h-[82px] w-full grid-cols-[32px_minmax(0,1fr)_22px] items-center gap-3 border-b border-border-subtle px-2 py-3 text-left last:border-b-0 sm:px-4"><span className={`font-mono text-[0.6875rem] ${isActive ? "text-accent" : "text-ink-tertiary"}`}>{String(index + 1).padStart(2, "0")}</span><span><span className="block text-[0.875rem] font-semibold leading-[1.4] text-ink-primary">{t(`situations.${situation.key}.label`)}</span><span className={`mt-1 block text-[0.6875rem] ${isActive ? "text-ink-secondary" : "text-ink-tertiary"}`}>{t(`situations.${situation.key}.moment`)}</span></span><ArrowRight size={18} weight="bold" className={`transition-transform ${isActive ? "translate-x-1 text-accent" : "text-ink-tertiary group-hover:translate-x-1"}`} aria-hidden="true" /></button>;
              })}
            </div>

            <div className="min-h-[650px] min-w-0" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article key={active.key} initial={reduce ? false : { opacity: 0, x: 14, filter: "blur(3px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduce ? undefined : { opacity: 0, x: -8, filter: "blur(2px)" }} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} className="min-h-[650px] bg-bg-surface">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-medium bg-bg-elevated px-5 py-4 sm:px-7"><p className="font-mono text-[0.6875rem] font-medium text-ink-secondary">{active.section} · {t("decision.infopackPages", { pages: active.infopackPages })}</p><span className={`inline-flex items-center gap-2 text-[0.6875rem] font-semibold ${active.tone === "urgent" ? "text-[#9a411f] dark:text-[#ffb294]" : "text-[#0f654d] dark:text-[#7fe1ba]"}`}>{active.tone === "urgent" ? <ClockCountdown size={16} weight="fill" aria-hidden="true" /> : <SealCheck size={16} weight="fill" aria-hidden="true" />}{t(`situations.${active.key}.badge`)}</span></header>
                  <div className="p-6 sm:p-9">
                    <h3 className="max-w-[20ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink-primary">{t(`situations.${active.key}.title`)}</h3>
                    <p className="mt-5 max-w-[68ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t(`situations.${active.key}.summary`)}</p>
                    <div className={`mt-6 flex gap-3 rounded-lg p-4 ${active.tone === "urgent" ? "bg-[#fff0e9] text-[#742b14] dark:bg-[#3c1d14] dark:text-[#ffc2ad]" : "bg-[#e9f6f0] text-[#165743] dark:bg-[#12352b] dark:text-[#8ee0c0]"}`}>{active.tone === "urgent" ? <Warning size={21} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" /> : <CheckCircle size={21} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />}<p className="text-[0.8125rem] font-semibold leading-[1.55]">{t(`situations.${active.key}.signal`)}</p></div>

                    <h4 className="mt-8 flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-primary"><Path size={19} weight="duotone" className="text-accent" aria-hidden="true" />{t("decision.next")}</h4>
                    <ol className="mt-4 grid gap-px bg-border-medium sm:grid-cols-3">{actions.map((action, index) => <li key={action} className="bg-bg-surface p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[0.6875rem] font-bold text-white">{index + 1}</span><p className="mt-4 text-[0.8125rem] font-medium leading-[1.55] text-ink-primary">{action}</p></li>)}</ol>

                    <h4 className="mt-8 text-[0.8125rem] font-semibold text-ink-primary">{t("decision.check")}</h4>
                    <ul className="mt-3 border-y border-border-medium">{checks.map((check) => <li key={check} className="flex gap-3 border-b border-border-subtle py-3.5 last:border-b-0"><CheckCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" /><span className="text-[0.8125rem] leading-[1.6] text-ink-secondary">{check}</span></li>)}</ul>

                    <div className="mt-7 flex flex-wrap gap-3">{active.href ? <Link href={active.href} className="semester-motion inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t(`situations.${active.key}.cta`)}<ArrowRight size={18} weight="bold" aria-hidden="true" /></Link> : null}<a href={studyRegulationPage(active.page)} target="_blank" rel="noopener noreferrer" className="semester-motion inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">{t("decision.source", { section: active.section })}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a></div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-y border-border-medium bg-bg-elevated" aria-labelledby="calculator-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
            <div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("calculator.label")}</p><h2 id="calculator-heading" className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("calculator.heading")}</h2><p className="mt-5 max-w-[55ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("calculator.lead")}</p><p className="mt-6 flex gap-3 border-t border-border-medium pt-4 text-[0.75rem] leading-[1.6] text-ink-tertiary"><Info size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />{t("calculator.note")}</p></div>

            <div className="bg-bg-surface p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-medium pb-5"><div className="flex items-center gap-3"><Scales size={24} weight="duotone" className="text-accent" aria-hidden="true" /><p className="text-[0.875rem] font-semibold text-ink-primary">{t("calculator.hasLecture")}</p></div><div className="flex rounded-lg bg-bg-elevated p-1" role="group" aria-label={t("calculator.hasLecture")}><button type="button" aria-pressed={hasLecture} onClick={() => setHasLecture(true)} className={`semester-motion min-h-10 rounded-md px-4 text-[0.8125rem] font-semibold ${hasLecture ? "bg-[#174b82] text-white" : "text-ink-secondary"}`}>{t("calculator.yes")}</button><button type="button" aria-pressed={!hasLecture} onClick={() => setHasLecture(false)} className={`semester-motion min-h-10 rounded-md px-4 text-[0.8125rem] font-semibold ${!hasLecture ? "bg-[#174b82] text-white" : "text-ink-secondary"}`}>{t("calculator.no")}</button></div></div>

              <div className="mt-6 space-y-4">
                {hasLecture ? <label className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_120px]"><span><span className="block text-[0.8125rem] font-semibold text-ink-primary">{t("calculator.lecture")}</span><span className="mt-1 block text-[0.6875rem] text-ink-tertiary">{t("calculator.weightHalf")}</span></span><select value={lectureGrade} onChange={(event) => setLectureGrade(Number(event.target.value))} className="min-h-11 rounded-lg border border-border-medium bg-bg-surface px-3 text-[0.875rem] font-semibold text-ink-primary">{gradeOptions.map((grade) => <option key={grade} value={grade}>{grade.toFixed(1)}</option>)}</select></label> : null}
                {otherGrades.map((grade, index) => <div key={index} className="grid items-center gap-3 border-t border-border-subtle pt-4 sm:grid-cols-[minmax(0,1fr)_120px_44px]"><label htmlFor={`semester-grade-${index}`}><span className="block text-[0.8125rem] font-semibold text-ink-primary">{t("calculator.other", { number: index + 1 })}</span><span className="mt-1 block text-[0.6875rem] text-ink-tertiary">{hasLecture ? t("calculator.sharedHalf", { count: otherGrades.length }) : t("calculator.equalWeight", { count: otherGrades.length })}</span></label><select id={`semester-grade-${index}`} value={grade} onChange={(event) => changeOtherGrade(index, Number(event.target.value))} className="min-h-11 rounded-lg border border-border-medium bg-bg-surface px-3 text-[0.875rem] font-semibold text-ink-primary">{gradeOptions.map((option) => <option key={option} value={option}>{option.toFixed(1)}</option>)}</select><button type="button" disabled={otherGrades.length === 1} onClick={() => setOtherGrades((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="semester-motion flex h-11 w-11 items-center justify-center rounded-lg text-ink-tertiary hover:bg-bg-elevated hover:text-ink-primary disabled:opacity-30" aria-label={t("calculator.remove", { number: index + 1 })}><Trash size={18} aria-hidden="true" /></button></div>)}
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-5 border-t border-border-medium pt-5"><button type="button" disabled={otherGrades.length >= 4} onClick={() => setOtherGrades((current) => [...current, 3])} className="semester-motion inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-medium px-4 text-[0.8125rem] font-semibold text-ink-primary hover:bg-bg-elevated disabled:opacity-40"><Plus size={17} weight="bold" aria-hidden="true" />{t("calculator.add")}</button><div className="text-right"><p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-tertiary">{t("calculator.raw")}: {calculation.raw.toFixed(2)}</p><output aria-label={t("calculator.outputLabel")} className={`mt-1 block font-display text-[3.4rem] font-semibold leading-none ${calculation.hasNegative ? "text-[#ad3f22] dark:text-[#ff9d80]" : "text-accent"}`}>{calculation.final.toFixed(1)}</output><p className="mt-2 text-[0.75rem] font-semibold text-ink-secondary">{calculation.hasNegative ? t("calculator.negative") : t("calculator.final")}</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" aria-labelledby="semester-sources-heading">
        <div className="mx-auto max-w-[1200px]"><div className="flex flex-col gap-5 border-b border-border-medium pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("sources.label")}</p><h2 id="semester-sources-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.75rem)] font-semibold tracking-[-0.03em] text-ink-primary">{t("sources.heading")}</h2></div><p className="max-w-[52ch] text-[0.8125rem] leading-[1.65] text-ink-secondary">{t("sources.lead")}</p></div><div className="grid border-b border-border-medium md:grid-cols-3">{[{ href: studyRegulationPage(20), icon: SealCheck, key: "regulation" }, { href: semesterInfopack, icon: Exam, key: "infopack" }, { href: semesterSources.fees, icon: CalendarDots, key: "fees" }].map(({ href, icon: Icon, key }) => <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="semester-motion group flex min-h-[150px] items-start gap-4 border-t border-border-medium p-5 hover:bg-bg-elevated md:border-r md:first:border-l"><Icon size={24} weight="duotone" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" /><span className="flex min-h-full flex-1 flex-col"><span className="text-[0.875rem] font-semibold text-ink-primary">{t(`sources.${key}.title`)}</span><span className="mt-2 text-[0.75rem] leading-[1.55] text-ink-tertiary">{t(`sources.${key}.desc`)}</span><span className="mt-auto flex items-center gap-2 pt-4 text-[0.75rem] font-semibold text-accent">{t("sources.open")}<ArrowSquareOut size={15} weight="bold" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></span></span></a>)}</div></div>
      </section>
    </>
  );
}
