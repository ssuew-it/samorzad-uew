"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  CursorClick,
  Info,
  MapTrifold,
  WarningCircle,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { Link } from "@/i18n/navigation";
import { DURATION, EASE } from "@/lib/motion";
import { usosInfopack, usosSources } from "@/lib/living-documents";

type AreaKey = "home" | "news" | "student" | "everyone";
type TaskKey =
  | "surveys"
  | "groups"
  | "news"
  | "redirects"
  | "registration"
  | "mlegitimation"
  | "grades"
  | "applications"
  | "exchange"
  | "rankings"
  | "clearance"
  | "payments"
  | "scholarships"
  | "elections";

interface UsosTask {
  key: TaskKey;
  area: AreaKey;
  infopackPage: number;
  href?: string;
  internal?: boolean;
  warning?: boolean;
}

const tasks: UsosTask[] = [
  { key: "surveys", area: "home", infopackPage: 3 },
  { key: "groups", area: "home", infopackPage: 5 },
  { key: "news", area: "news", infopackPage: 6 },
  { key: "redirects", area: "news", infopackPage: 7 },
  { key: "registration", area: "news", infopackPage: 8, warning: true },
  { key: "mlegitimation", area: "student", infopackPage: 10 },
  { key: "grades", area: "student", infopackPage: 11, warning: true },
  { key: "applications", area: "student", infopackPage: 12, href: "/infopacki/podania", internal: true },
  { key: "exchange", area: "student", infopackPage: 13, href: usosSources.exchangeGuide },
  { key: "rankings", area: "student", infopackPage: 14 },
  { key: "clearance", area: "everyone", infopackPage: 15 },
  { key: "payments", area: "everyone", infopackPage: 15 },
  { key: "scholarships", area: "everyone", infopackPage: 16, href: "/stypendia", internal: true },
  { key: "elections", area: "everyone", infopackPage: 17 },
];

const areas: AreaKey[] = ["home", "news", "student", "everyone"];

export function UsosContent() {
  const t = useTranslations("usosLive");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"task" | "area">("task");
  const [activeArea, setActiveArea] = useState<AreaKey>("student");
  const [activeKey, setActiveKey] = useState<TaskKey>("applications");

  const visibleTasks = mode === "area" ? tasks.filter((task) => task.area === activeArea) : tasks;
  const active = tasks.find((task) => task.key === activeKey) ?? tasks[0];
  const steps = t.raw(`tasks.${active.key}.steps`) as string[];
  const result = t.raw(`tasks.${active.key}.result`) as string[];

  function selectArea(area: AreaKey) {
    setActiveArea(area);
    setActiveKey(tasks.find((task) => task.area === area)?.key ?? "surveys");
  }

  return (
    <>
      <section className="usos-hero relative overflow-hidden border-b border-white/10 bg-[#071f47] text-white" aria-labelledby="usos-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="usos-enter usos-enter-1 usos-breadcrumbs">
            <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumbs.infopacks"), href: "/infopacki" }, { label: t("heroTitle") }]} />
          </div>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.6fr)] lg:gap-20">
            <div>
              <p className="usos-enter usos-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#84d9ff]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#37c2ff]" aria-hidden="true" />
                {t("heroLabel")}
              </p>
              <h1 id="usos-title" className="usos-enter usos-enter-3 mt-6 max-w-[13ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("heroTitle")}</h1>
              <p className="usos-enter usos-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/76 sm:text-[1.125rem]">{t("heroLead")}</p>
              <div className="usos-enter usos-enter-5 mt-8 flex flex-wrap gap-3">
                <a href="#navigator" className="usos-motion group inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#37c2ff] px-6 py-3 font-semibold text-[#071f47] hover:bg-[#8edfff]">
                  {t("heroCta")}<ArrowDown size={19} weight="bold" className="transition-transform group-hover:translate-y-1" aria-hidden="true" />
                </a>
                <a href={usosSources.system} target="_blank" rel="noopener noreferrer" className="usos-motion inline-flex min-h-12 items-center gap-3 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10">
                  {t("openUsos")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
                </a>
              </div>
            </div>
            <InfopackSourceVisual
              src="/photos/infopacki/usos-cover.jpg"
              href={usosInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.tasks"), value: "14" },
                { label: t("source.areas"), value: "4" },
                { label: t("source.checked"), value: "13.08.2026" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section id="navigator" className="section-padding scroll-mt-20" aria-labelledby="usos-nav-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.54fr)] lg:items-end lg:gap-20">
            <div><h2 id="usos-nav-heading" className="max-w-[17ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("navigator.heading")}</h2><p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("navigator.lead")}</p></div>
            <p className="flex items-start gap-3 border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary"><Info size={19} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />{t("navigator.disclaimer")}</p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-border-medium py-3">
            <div className="flex rounded-lg bg-bg-elevated p-1" role="tablist" aria-label={t("mode.ariaLabel")}>
              {(["task", "area"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => setMode(item)} className={`usos-motion min-h-10 rounded-md px-4 text-[0.8125rem] font-semibold ${mode === item ? "bg-[#174b82] text-white" : "text-ink-secondary"}`}>{t(`mode.${item}`)}</button>)}
            </div>
            {mode === "area" ? <div className="flex max-w-full gap-2 overflow-x-auto" role="group" aria-label={t("areas.ariaLabel")}>{areas.map((area) => <button key={area} type="button" aria-pressed={activeArea === area} onClick={() => selectArea(area)} className={`usos-motion min-h-10 shrink-0 rounded-full px-3 text-[0.75rem] font-semibold ${activeArea === area ? "bg-[#d8f1ff] text-[#0c4668] dark:bg-[#123b55] dark:text-[#9ee3ff]" : "text-ink-secondary hover:bg-bg-elevated"}`}>{t(`areas.${area}`)}</button>)}</div> : null}
          </div>

          <div className="mt-8 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(285px,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
            <div className="min-w-0 border-y border-border-medium" role="tabpanel">
              {visibleTasks.map((task) => {
                const isActive = active.key === task.key;
                return <button key={task.key} type="button" aria-pressed={isActive} onClick={() => setActiveKey(task.key)} className="usos-task-button usos-motion group grid min-h-[72px] w-full grid-cols-[34px_minmax(0,1fr)_22px] items-center gap-3 border-b border-border-subtle px-2 py-3 text-left last:border-b-0 sm:px-4">
                  <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-[#168cc0]" : "bg-border-medium"}`} aria-hidden="true" />
                  <span className="min-w-0"><span className="block text-[0.875rem] font-semibold leading-[1.4] text-ink-primary">{t(`tasks.${task.key}.label`)}</span><span className={`mt-1 block text-[0.6875rem] ${isActive ? "text-ink-secondary" : "text-ink-tertiary"}`}>{t(`areas.${task.area}`)} · {t("navigator.page", { page: task.infopackPage })}</span></span>
                  <ArrowRight size={18} weight="bold" className={`transition-transform ${isActive ? "translate-x-1 text-accent" : "text-ink-tertiary group-hover:translate-x-1"}`} aria-hidden="true" />
                </button>;
              })}
            </div>

            <div className="min-h-[620px] min-w-0" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article key={active.key} initial={false} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduce ? undefined : { opacity: 0, x: -8, filter: "blur(2px)" }} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} className="min-h-[620px] bg-bg-surface">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-medium bg-bg-elevated px-5 py-4 sm:px-7">
                    <p className="font-mono text-[0.6875rem] font-medium text-ink-secondary">{t(`areas.${active.area}`)} · {t("navigator.page", { page: active.infopackPage })}</p>
                    <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold text-[#0f654d] dark:text-[#7fe1ba]"><CheckCircle size={15} weight="fill" aria-hidden="true" />{t("navigator.mapped")}</span>
                  </header>
                  <div className="p-6 sm:p-9">
                    <h3 className="max-w-[19ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink-primary">{t(`tasks.${active.key}.title`)}</h3>
                    <p className="mt-5 max-w-[68ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t(`tasks.${active.key}.summary`)}</p>
                    {active.warning ? <div className="mt-6 flex gap-3 rounded-lg bg-[#fff0e9] p-4 text-[#742b14] dark:bg-[#3c1d14] dark:text-[#ffc2ad]"><WarningCircle size={21} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" /><p className="text-[0.8125rem] font-semibold leading-[1.55]">{t(`tasks.${active.key}.warning`)}</p></div> : null}

                    <div className="usos-system-map mt-8 overflow-hidden border border-[#2c6597] bg-[#0d315e] text-white" aria-label={t("navigator.systemMapAria")} data-testid="usos-system-map">
                      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-[#092b55] px-4 py-3 sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex gap-1.5" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-[#ff8a71]" /><span className="h-2 w-2 rounded-full bg-[#ffd46d]" /><span className="h-2 w-2 rounded-full bg-[#67deb5]" /></span>
                          <span className="truncate rounded bg-white/8 px-3 py-1.5 font-mono text-[0.625rem] text-white/62">usosweb.ue.wroc.pl</span>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold text-[#84d9ff]"><MapTrifold size={17} weight="duotone" aria-hidden="true" />{t("navigator.systemMap")}</span>
                      </header>

                      <div className="grid md:grid-cols-[170px_minmax(0,1fr)]">
                        <nav className="border-b border-white/15 bg-[#0a294f] p-3 md:border-b-0 md:border-r" aria-label={t("areas.ariaLabel")}>
                          <p className="px-2 pb-2 text-[0.625rem] font-semibold text-white/70">{t("navigator.currentArea")}</p>
                          <div className="grid grid-cols-2 gap-1 md:grid-cols-1">
                            {areas.map((area) => {
                              const isActiveArea = area === active.area;
                              return (
                                <button
                                  key={area}
                                  type="button"
                                  aria-pressed={isActiveArea}
                                  onClick={() => selectArea(area)}
                                  className={`usos-map-area min-h-10 px-2.5 py-2 text-left text-[0.6875rem] font-semibold leading-[1.35] ${isActiveArea ? "bg-[#37c2ff] text-[#082447]" : "text-white/58 hover:bg-white/7 hover:text-white"}`}
                                >
                                  {t(`areas.${area}`)}
                                </button>
                              );
                            })}
                          </div>
                        </nav>

                        <div className="min-w-0 p-5 sm:p-7">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-[0.625rem] font-semibold text-white/70">{t("navigator.targetScreen")}</p>
                              <p className="mt-2 max-w-[34ch] text-[0.875rem] font-semibold leading-[1.45] text-white">{t(`tasks.${active.key}.label`)}</p>
                            </div>
                            <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold text-[#8ee2ff]"><CursorClick size={17} weight="duotone" aria-hidden="true" />{t("navigator.routeUpdated")}</span>
                          </div>

                          <p className="mt-7 text-[0.6875rem] font-semibold text-[#84d9ff]">{t("navigator.path")}</p>
                          <ol className="usos-route-path mt-4 flex min-w-0 flex-col gap-0 md:flex-row" aria-label={t("navigator.path")}>
                            {steps.map((step, index) => (
                              <li key={step} className="relative flex min-w-0 flex-1 items-start gap-3 pb-5 last:pb-0 md:pr-6 md:pb-0 md:last:pr-0">
                                <span className="usos-route-node relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#37c2ff] text-[0.6875rem] font-bold text-[#082447]" style={{ animationDelay: `${index * 0.48}s` }}>{index + 1}</span>
                                <span className="pt-1 text-[0.6875rem] font-medium leading-[1.45] text-white/82">{step}</span>
                                {index < steps.length - 1 ? <span className="absolute left-4 top-8 h-[calc(100%-2rem)] w-px bg-white/20 md:left-8 md:top-4 md:h-px md:w-[calc(100%-2rem)]" aria-hidden="true" /> : null}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>

                    <h4 className="mt-8 text-[0.8125rem] font-semibold text-ink-primary">{t("navigator.result")}</h4>
                    <ul className="mt-3 border-y border-border-medium">{result.map((item) => <li key={item} className="flex gap-3 border-b border-border-subtle py-3.5 last:border-b-0"><CheckCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" /><span className="text-[0.8125rem] leading-[1.6] text-ink-secondary">{item}</span></li>)}</ul>

                    <div className="mt-7 flex flex-wrap gap-3">
                      {active.href ? active.internal ? <Link href={active.href} className="usos-motion inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t(`tasks.${active.key}.cta`)}<ArrowRight size={18} weight="bold" aria-hidden="true" /></Link> : <a href={active.href} target="_blank" rel="noopener noreferrer" className="usos-motion inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t(`tasks.${active.key}.cta`)}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a> : null}
                      <a href={usosInfopack} target="_blank" rel="noopener noreferrer" className="usos-motion inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">{t("navigator.openInfopack", { page: active.infopackPage })}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
