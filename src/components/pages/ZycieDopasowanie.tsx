"use client";

import { useMemo, useState } from "react";
import { m } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  AirplaneTilt,
  ArrowSquareOut,
  Briefcase,
  Flask,
  Lightbulb,
  MicrophoneStage,
  Path,
  SoccerBall,
  Certificate,
  UsersThree,
} from "@phosphor-icons/react";
import { SygnetMark } from "../SygnetMark";
import { DURATION, EASE } from "@/lib/motion";
import { paths, questions, type AnswerKey, type PathKey } from "@/lib/zycie-sciezki";

const ICONS: Record<PathKey, typeof UsersThree> = {
  samorzad: SygnetMark as unknown as typeof UsersThree,
  organisations: UsersThree,
  circles: Flask,
  sport: SoccerBall,
  choir: MicrophoneStage,
  mobility: AirplaneTilt,
  dthub: Lightbulb,
  career: Briefcase,
  kafe: Certificate,
};

/** Dopasowanie ścieżek - jedyna interaktywna część strony Życie studenckie. */
export function ZycieDopasowanie() {
  const t = useTranslations("studentLifeLive");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({ goal: "relationships", pace: "project", mode: "build", start: "zero" });

  const rankedPaths = useMemo(() => paths.map((path, originalIndex) => ({
    ...path,
    icon: ICONS[path.key],
    originalIndex,
    score: Object.values(answers).reduce((sum, answer) => sum + (path.tags.includes(answer) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex), [answers]);

  return (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
          <div className="border-y border-border-medium">{questions.map((question, index) => <fieldset key={question.key} className="border-b border-border-medium py-6 last:border-b-0"><legend className="flex gap-3 text-[0.875rem] font-semibold text-ink-primary"><span className="font-mono text-[0.75rem] text-accent">0{index + 1}</span>{t(`matcher.questions.${question.key}.label`)}</legend><div className="mt-4 flex flex-wrap gap-2">{question.options.map((option) => <button key={option} type="button" aria-pressed={answers[question.key] === option} onClick={() => setAnswers((current) => ({ ...current, [question.key]: option }))} className="life-option life-motion min-h-11 border border-border-medium bg-bg-surface px-4 py-2 text-[0.75rem] font-semibold text-ink-secondary">{t(`matcher.options.${option}`)}</button>)}</div></fieldset>)}</div>
          <div className="min-h-[630px] bg-[#211b55] p-5 text-white sm:p-8" aria-live="polite"><div className="flex items-center justify-between gap-5 border-b border-white/20 pb-5"><p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#ffda79]"><Path size={19} weight="duotone" aria-hidden="true" />{t("matcher.resultLabel")}</p><span className="font-mono text-[0.75rem] text-white/55">{t("matcher.live")}</span></div><div className="mt-6 space-y-3">{rankedPaths.slice(0, 3).map((path, index) => { const Icon = path.icon; return <m.article layout key={path.key} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} className={`life-result ${index === 0 ? "bg-white text-[#171443]" : "border border-white/20 text-white"} p-5`}><div className="flex items-start justify-between gap-4"><div className="flex gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-[#ffcf58] text-[#211738]" : "bg-white/10 text-[#ffda79]"}`}><Icon size={21} weight="duotone" aria-hidden="true" /></span><div><p className={`font-mono text-[0.75rem] uppercase tracking-[0.08em] ${index === 0 ? "text-[#5b527e]" : "text-white/55"}`}>{index === 0 ? t("matcher.best") : t("matcher.alternative", { number: index })}</p><h3 className="mt-2 text-[1.05rem] font-semibold">{t(`paths.${path.key}.title`)}</h3></div></div><span className={`font-display text-[1.6rem] font-semibold ${index === 0 ? "text-[#5645d6]" : "text-[#ffda79]"}`}>{path.score}/4</span></div><p className={`mt-4 text-[0.75rem] leading-[1.6] ${index === 0 ? "text-[#514c68]" : "text-white/70"}`}>{t(`paths.${path.key}.summary`)}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className={`text-[0.75rem] font-medium ${index === 0 ? "text-[#514c68]" : "text-white/60"}`}>{t(`paths.${path.key}.rhythm`)}</span><a href={path.href.startsWith("/") ? `/${locale}${path.href}` : path.href} {...(path.href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })} className={`life-motion inline-flex min-h-10 items-center gap-2 text-[0.75rem] font-semibold ${index === 0 ? "text-[#3c2fc0]" : "text-[#ffda79]"}`}>{t("matcher.open")}<ArrowSquareOut size={15} weight="bold" aria-hidden="true" /></a></div></m.article>; })}</div><p className="mt-6 border-t border-white/20 pt-5 text-[0.75rem] leading-[1.6] text-white/65">{t("matcher.disclaimer")}</p></div>
        </div>
  );
}
