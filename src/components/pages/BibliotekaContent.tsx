"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowRight,
  ArrowSquareOut,
  BookOpenText,
  Books,
  Check,
  Desktop,
  DoorOpen,
  GraduationCap,
  IdentificationCard,
  Info,
  MagnifyingGlass,
  Path,
  Student,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { DURATION, EASE } from "@/lib/motion";
import { libraryInfopack, librarySources } from "@/lib/living-documents";

type TaskKey = "register" | "find" | "borrow" | "return" | "digital" | "study" | "clearance" | "research";
type LocationKey = "magazine" | "floor" | "onsite";
type TimeKey = "open" | "closed";

const tasks: Array<{ key: TaskKey; icon: typeof Books; href: string }> = [
  { key: "register", icon: IdentificationCard, href: librarySources.registration },
  { key: "find", icon: MagnifyingGlass, href: librarySources.catalogue },
  { key: "borrow", icon: BookOpenText, href: librarySources.catalogue },
  { key: "return", icon: ArrowDown, href: librarySources.faq },
  { key: "digital", icon: Desktop, href: librarySources.eResources },
  { key: "study", icon: DoorOpen, href: librarySources.cabins },
  { key: "clearance", icon: GraduationCap, href: librarySources.faq },
  { key: "research", icon: Student, href: librarySources.bibliography },
];

const floors = ["one", "two", "three"] as const;
const facts = ["activation", "pickup", "always", "noshow"] as const;

export function BibliotekaContent() {
  const t = useTranslations("libraryLive");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [activeTask, setActiveTask] = useState<TaskKey>("find");
  const [location, setLocation] = useState<LocationKey>("magazine");
  const [time, setTime] = useState<TimeKey>("open");

  const selectedTask = tasks.find((task) => task.key === activeTask) ?? tasks[1];
  const taskSteps = t.raw(`tasks.${activeTask}.steps`) as string[];
  const routeKey = location === "floor" ? `${location}.${time}` : location;
  const routeSteps = t.raw(`copyRouter.routes.${routeKey}.steps`) as string[];

  return (
    <>
      <section className="library-hero relative overflow-hidden border-b border-white/10 bg-[#082c28] text-white" aria-labelledby="library-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="library-enter library-enter-1 library-breadcrumbs"><Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumbs.infopacks"), href: "/infopacki" }, { label: t("heroTitle") }]} /></div>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.56fr)] lg:gap-20">
            <div>
              <p className="library-enter library-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#a9e7bc]"><span className="h-2.5 w-2.5 rounded-full bg-[#7be39c]" aria-hidden="true" />{t("heroLabel")}</p>
              <h1 id="library-title" className="library-enter library-enter-3 mt-6 max-w-[11ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("heroTitle")}</h1>
              <p className="library-enter library-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/76 sm:text-[1.125rem]">{t("heroLead")}</p>
              <a href="#library-task" className="library-motion group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#7be39c] px-6 py-3 font-semibold text-[#06251f] hover:bg-[#b8f2c9]">{t("heroCta")}<ArrowDown size={19} weight="bold" className="transition-transform group-hover:translate-y-1" aria-hidden="true" /></a>
            </div>
            <InfopackSourceVisual
              src="/photos/infopacki/biblioteka-cover.jpg"
              href={libraryInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.tasks"), value: "8" },
                { label: t("source.floors"), value: "3" },
                { label: t("source.checked"), value: "13.08.2026" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section id="library-task" className="section-padding scroll-mt-20" aria-labelledby="task-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.5fr)] lg:items-end lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("task.label")}</p><h2 id="task-heading" className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("task.heading")}</h2><p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("task.lead")}</p></div><p className="flex items-start gap-3 border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary"><Info size={19} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />{t("task.rule")}</p></div>
          <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-[minmax(285px,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
            <div className="border-y border-border-medium" role="group" aria-label={t("task.ariaLabel")}>
              {tasks.map((task, index) => { const Icon = task.icon; const active = activeTask === task.key; return <button key={task.key} type="button" aria-pressed={active} onClick={() => setActiveTask(task.key)} className="library-task-button library-motion group grid min-h-[76px] w-full grid-cols-[34px_minmax(0,1fr)_22px] items-center gap-3 border-b border-border-subtle px-2 py-3 text-left last:border-b-0 sm:px-4"><Icon size={20} weight={active ? "fill" : "duotone"} className={active ? "text-accent" : "text-ink-tertiary"} aria-hidden="true" /><span><span className="block text-[0.875rem] font-semibold leading-[1.4] text-ink-primary">{t(`tasks.${task.key}.label`)}</span><span className={`mt-1 block font-mono text-[0.6875rem] ${active ? "text-ink-secondary" : "text-ink-tertiary"}`}>{String(index + 1).padStart(2, "0")}</span></span><ArrowRight size={18} weight="bold" className={`transition-transform ${active ? "translate-x-1 text-accent" : "text-ink-tertiary group-hover:translate-x-1"}`} aria-hidden="true" /></button>; })}
            </div>
            <div className="min-h-[570px] min-w-0" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.article key={activeTask} initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduce ? undefined : { opacity: 0, y: -8, filter: "blur(2px)" }} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} className="min-h-[570px] bg-bg-elevated p-6 sm:p-9">
              <p className="flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-accent"><Path size={17} weight="duotone" aria-hidden="true" />{t("task.path")}</p>
              <h3 className="mt-5 max-w-[18ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink-primary">{t(`tasks.${activeTask}.title`)}</h3>
              <p className="mt-5 max-w-[68ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t(`tasks.${activeTask}.summary`)}</p>
              <ol className="mt-8 grid gap-px bg-border-medium sm:grid-cols-3">{taskSteps.map((step, index) => <li key={step} className="bg-bg-surface p-5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d6f5df] text-[0.6875rem] font-bold text-[#07503b] dark:bg-[#114b37] dark:text-[#9af0bb]">{index + 1}</span><p className="mt-4 text-[0.8125rem] font-medium leading-[1.6] text-ink-secondary">{step}</p></li>)}</ol>
              <p className="mt-7 flex items-start gap-3 border-y border-border-medium py-4 text-[0.8125rem] leading-[1.6] text-ink-secondary"><Info size={18} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />{t(`tasks.${activeTask}.note`)}</p>
              <a href={selectedTask.href} target="_blank" rel="noopener noreferrer" className="library-motion mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t(`tasks.${activeTask}.cta`)}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a>
            </motion.article></AnimatePresence></div>
          </div>
        </div>
      </section>

      <section className="section-padding border-y border-border-medium bg-[#eaf4e9] dark:bg-[#092c27]" aria-labelledby="copy-router-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-20">
            <div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-[#08704f] dark:text-[#8ae9b3]">{t("copyRouter.label")}</p><h2 id="copy-router-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("copyRouter.heading")}</h2><p className="mt-5 max-w-[52ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("copyRouter.lead")}</p></div>
            <div className="min-w-0 bg-bg-surface p-5 sm:p-8">
              <fieldset><legend className="text-[0.8125rem] font-semibold text-ink-primary">{t("copyRouter.locationLegend")}</legend><div className="mt-3 grid gap-px bg-border-medium sm:grid-cols-3">{(["magazine", "floor", "onsite"] as LocationKey[]).map((key) => <button key={key} type="button" aria-pressed={location === key} onClick={() => setLocation(key)} className="library-choice library-motion min-h-14 bg-bg-surface px-4 py-3 text-left text-[0.8125rem] font-semibold text-ink-primary">{t(`copyRouter.locations.${key}`)}</button>)}</div></fieldset>
              {location === "floor" ? <fieldset className="mt-6"><legend className="text-[0.8125rem] font-semibold text-ink-primary">{t("copyRouter.timeLegend")}</legend><div className="mt-3 inline-grid grid-cols-2 gap-px bg-border-medium">{(["open", "closed"] as TimeKey[]).map((key) => <button key={key} type="button" aria-pressed={time === key} onClick={() => setTime(key)} className="library-choice library-motion min-h-12 bg-bg-surface px-5 text-[0.8125rem] font-semibold text-ink-primary">{t(`copyRouter.times.${key}`)}</button>)}</div></fieldset> : null}
              <div className="mt-7 border-t-2 border-[#187859] pt-6" aria-live="polite"><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[#08704f] dark:text-[#8ae9b3]">{t("copyRouter.routeLabel")}</p><AnimatePresence mode="wait" initial={false}><motion.div key={routeKey} initial={reduce ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -6 }} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }}><h3 className="mt-3 text-balance font-display text-[clamp(1.55rem,2.5vw,2.2rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-ink-primary">{t(`copyRouter.routes.${routeKey}.title`)}</h3><ol className="mt-5 border-y border-border-medium">{routeSteps.map((step, index) => <li key={step} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-border-subtle py-3.5 last:border-b-0"><span className="font-mono text-[0.6875rem] font-semibold text-[#08704f] dark:text-[#8ae9b3]">0{index + 1}</span><span className="text-[0.8125rem] leading-[1.6] text-ink-secondary">{step}</span></li>)}</ol><p className="mt-5 flex items-start gap-3 text-[0.8125rem] font-medium leading-[1.6] text-ink-primary"><Check size={18} weight="bold" className="mt-0.5 shrink-0 text-[#08704f] dark:text-[#8ae9b3]" aria-hidden="true" />{t(`copyRouter.routes.${routeKey}.result`)}</p></motion.div></AnimatePresence></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" aria-labelledby="floor-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("floors.label")}</p><h2 id="floor-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("floors.heading")}</h2><p className="mt-5 max-w-[48ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("floors.lead")}</p></div><ol className="border-y border-border-medium">{floors.map((floor, index) => { const topics = t.raw(`floors.items.${floor}.topics`) as string[]; return <li key={floor} className="grid gap-5 border-b border-border-medium py-6 last:border-b-0 sm:grid-cols-[78px_minmax(160px,0.5fr)_minmax(0,1fr)] sm:items-start"><span className={`library-floor-number library-floor-${index + 1} flex h-14 w-14 items-center justify-center rounded-full font-display text-xl font-semibold text-[#082c28]`}>{index + 1}</span><div><p className="text-[1rem] font-semibold text-ink-primary">{t(`floors.items.${floor}.title`)}</p><p className="mt-2 text-[0.75rem] leading-[1.5] text-ink-tertiary">{t(`floors.items.${floor}.mood`)}</p></div><div className="flex flex-wrap gap-2">{topics.map((topic) => <span key={topic} className="border border-border-medium bg-bg-elevated px-3 py-2 text-[0.75rem] text-ink-secondary">{topic}</span>)}</div></li>; })}</ol></div></div></section>

      <section className="border-y border-border-medium bg-bg-elevated" aria-labelledby="facts-heading"><div className="mx-auto max-w-[1200px] px-6 py-12"><h2 id="facts-heading" className="sr-only">{t("facts.heading")}</h2><dl className="grid gap-px bg-border-medium sm:grid-cols-2 lg:grid-cols-4">{facts.map((fact) => <div key={fact} className="bg-bg-surface p-5"><dt className="font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] text-ink-primary">{t(`facts.${fact}.value`)}</dt><dd className="mt-3 text-[0.75rem] leading-[1.55] text-ink-secondary">{t(`facts.${fact}.label`)}</dd></div>)}</dl></div></section>

      <section className="section-padding" aria-labelledby="sources-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("sources.label")}</p><h2 id="sources-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("sources.heading")}</h2><p className="mt-5 text-[0.875rem] leading-[1.7] text-ink-secondary">{t("sources.lead")}</p></div><div className="grid gap-px bg-border-medium sm:grid-cols-2">{(["home", "enrollment", "faq", "proxy"] as const).map((source) => <a key={source} href={librarySources[source]} target="_blank" rel="noopener noreferrer" className="library-motion group flex min-h-[104px] items-start justify-between gap-5 bg-bg-surface p-5 hover:bg-bg-elevated"><span><span className="block text-[0.875rem] font-semibold text-ink-primary">{t(`sources.links.${source}.title`)}</span><span className="mt-2 block text-[0.75rem] leading-[1.5] text-ink-tertiary">{t(`sources.links.${source}.meta`)}</span></span><ArrowSquareOut size={18} weight="bold" className="shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></a>)}</div></div><div className="mt-8 flex flex-wrap gap-3"><a href={libraryInfopack} target="_blank" rel="noopener noreferrer" className="library-motion inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">{t("sources.infopack")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a><a href={librarySources.catalogue} target="_blank" rel="noopener noreferrer" className="library-motion inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t("sources.catalogue")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a></div></div></section>
    </>
  );
}
