"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  ChartBar,
  CheckCircle,
  Clock,
  Coins,
  DownloadSimple,
  FileText,
  Gavel,
  Info,
  Palette,
  Scroll,
  ShieldCheck,
  Stamp,
  type Icon,
} from "@phosphor-icons/react";
import { documents, type DocSlot } from "@/lib/documents";
import { DURATION, EASE } from "@/lib/motion";

type StageKey = "planned" | "contracted" | "spent" | "settled";

interface Category {
  key: string;
  icon: Icon;
  href?: string;
  doc?: DocSlot;
}

const categories: Category[] = [
  { key: "regulacje", icon: Scroll, href: "/regulacje-wewnetrzne" },
  { key: "zarzadzenia", icon: Stamp, href: "/zarzadzenia-przewodniczacego" },
  { key: "prawo", icon: Gavel, href: "/prawo-dla-studenta" },
  { key: "russRaporty", icon: FileText, doc: documents.russResolutions },
  { key: "sprawozdania", icon: ChartBar, doc: documents.sprawozdania },
  { key: "finansowanie", icon: Coins, doc: documents.finansowanie },
  { key: "ksiega", icon: Palette, doc: documents.ksiega },
];

const stages: StageKey[] = ["planned", "contracted", "spent", "settled"];

export function TransparentnoscContent() {
  const t = useTranslations("transparentnosc");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [activeStage, setActiveStage] = useState<StageKey>("planned");
  const activeIndex = stages.indexOf(activeStage);
  const publishedCount = categories.filter((category) => category.href || category.doc?.href).length;
  const awaitingCount = categories.length - publishedCount;
  const fields = t.raw(`livingBudget.stages.${activeStage}.fields`) as string[];

  return (
    <>
      <section
        id="zywy-budzet"
        className="section-padding scroll-mt-20 border-b border-border-subtle"
        aria-labelledby="living-budget-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.65fr)] lg:items-end lg:gap-20">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-[0.75rem] font-medium uppercase tracking-[0.1em] text-accent">
                <Coins size={18} weight="duotone" aria-hidden="true" />
                {t("livingBudget.eyebrow")}
              </p>
              <h2
                id="living-budget-heading"
                className="mt-5 max-w-[16ch] text-balance font-display text-[clamp(2.35rem,5.2vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink-primary"
              >
                {t("livingBudget.heading")}
              </h2>
              <p className="mt-6 max-w-[66ch] text-pretty text-[1.0625rem] leading-[1.75] text-ink-secondary">
                {t("livingBudget.lead")}
              </p>
            </div>

            <div className="border-l-2 border-accent bg-accent-glow p-5">
              <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-primary">
                <Info size={18} weight="fill" className="text-accent" aria-hidden="true" />
                {t("livingBudget.dataState.title")}
              </p>
              <p className="mt-2 text-[0.8125rem] leading-[1.6] text-ink-secondary">
                {t("livingBudget.dataState.body")}
              </p>
            </div>
          </div>

          <div className="mt-14 overflow-hidden border border-border-medium bg-bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-medium bg-bg-elevated px-5 py-4 sm:px-7">
              <div>
                <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
                  {t("livingBudget.viewer.kicker")}
                </p>
                <p className="mt-1 text-[0.875rem] font-semibold text-ink-primary">
                  {t("livingBudget.viewer.title")}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-medium bg-bg-surface px-3 py-1.5 text-[0.6875rem] font-semibold text-ink-secondary">
                <Clock size={14} weight="fill" className="text-ink-tertiary" aria-hidden="true" />
                {t("livingBudget.viewer.status")}
              </span>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
              <div className="border-b border-border-medium p-5 sm:p-8 lg:border-b-0 lg:border-r">
                <p id="budget-stage-label" className="text-[0.8125rem] font-semibold text-ink-secondary">
                  {t("livingBudget.viewer.instruction")}
                </p>

                <div
                  className="relative mt-8 grid gap-2 sm:grid-cols-4 sm:gap-3"
                  role="group"
                  aria-labelledby="budget-stage-label"
                >
                  <div className="absolute left-[23px] top-[23px] h-[calc(100%-46px)] w-px bg-border-medium sm:left-[12.5%] sm:right-[12.5%] sm:top-[23px] sm:h-px sm:w-auto" aria-hidden="true">
                    <motion.span
                      className="block w-px origin-top bg-accent sm:hidden"
                      animate={{ height: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                      transition={reduce ? { duration: 0 } : { duration: DURATION.draw, ease: EASE }}
                    />
                    <motion.span
                      className="hidden h-px origin-left bg-accent sm:block"
                      animate={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                      transition={reduce ? { duration: 0 } : { duration: DURATION.draw, ease: EASE }}
                    />
                  </div>

                  {stages.map((stage, index) => {
                    const isActive = stage === activeStage;
                    const isPassed = index <= activeIndex;

                    return (
                      <button
                        key={stage}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveStage(stage)}
                        className="transparency-stage transparency-motion-control relative z-10 grid min-h-[74px] grid-cols-[46px_1fr] items-center gap-4 rounded-lg px-1 text-left sm:grid-cols-1 sm:justify-items-center sm:gap-3 sm:px-2 sm:pb-3 sm:pt-0 sm:text-center"
                      >
                        <span
                          className={`flex h-[46px] w-[46px] items-center justify-center rounded-full border font-mono text-[0.6875rem] font-medium tabular-nums transition-colors duration-200 ${
                            isActive
                              ? "border-accent bg-accent text-white"
                              : isPassed
                                ? "border-accent bg-bg-surface text-accent"
                                : "border-border-strong bg-bg-surface text-ink-tertiary"
                          }`}
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={`text-[0.75rem] font-semibold leading-[1.35] ${isActive ? "text-ink-primary" : "text-ink-secondary"}`}>
                          {t(`livingBudget.stages.${stage}.label`)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border-t border-border-subtle pt-6">
                  <div className="flex items-center gap-3 text-[0.8125rem] leading-[1.55] text-ink-secondary">
                    <ShieldCheck size={22} weight="duotone" className="shrink-0 text-accent" aria-hidden="true" />
                    <p>{t("livingBudget.viewer.rule")}</p>
                  </div>
                </div>
              </div>

              <div className="min-h-[390px] bg-[#10276b] p-6 text-white sm:p-8 dark:bg-[#17275b]" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeStage}
                    initial={reduce ? false : { opacity: 0, x: 12, filter: "blur(3px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={reduce ? undefined : { opacity: 0, x: -8, filter: "blur(2px)" }}
                    transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }}
                  >
                    <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-white/60">
                      {t("livingBudget.viewer.recordLabel", { number: activeIndex + 1 })}
                    </p>
                    <h3 className="mt-4 text-balance font-display text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
                      {t(`livingBudget.stages.${activeStage}.title`)}
                    </h3>
                    <p className="mt-4 text-pretty text-[0.9375rem] leading-[1.7] text-white/75">
                      {t(`livingBudget.stages.${activeStage}.desc`)}
                    </p>
                    <dl className="mt-8 border-t border-white/20">
                      {fields.map((field, index) => (
                        <div key={field} className="grid grid-cols-[26px_1fr] gap-3 border-b border-white/15 py-3.5">
                          <dt className="font-mono text-[0.6875rem] text-white/60" aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </dt>
                          <dd className="text-[0.8125rem] font-medium text-white/90">{field}</dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-[76ch] text-[0.75rem] leading-[1.6] text-ink-tertiary">
            {t("livingBudget.disclaimer")}
          </p>
        </div>
      </section>

      <section
        id="rejestr"
        className="section-padding scroll-mt-20 bg-bg-surface"
        aria-labelledby="registry-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)] lg:items-end lg:gap-20">
            <div>
              <p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.1em] text-accent">
                {t("registry.eyebrow")}
              </p>
              <h2
                id="registry-heading"
                className="mt-4 max-w-[17ch] text-balance font-display text-[clamp(2.1rem,4.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink-primary"
              >
                {t("registry.heading")}
              </h2>
              <p className="mt-5 max-w-[66ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
                {t("intro")}
              </p>
            </div>

            <dl className="grid grid-cols-2 border-y border-border-medium">
              <div className="py-5 pr-5">
                <dt className="text-[0.75rem] text-ink-tertiary">{t("registry.available")}</dt>
                <dd className="mt-1 font-mono text-[1.75rem] font-medium text-ink-primary tabular-nums">{publishedCount}</dd>
              </div>
              <div className="border-l border-border-medium py-5 pl-5">
                <dt className="text-[0.75rem] text-ink-tertiary">{t("registry.awaiting")}</dt>
                <dd className="mt-1 font-mono text-[1.75rem] font-medium text-ink-primary tabular-nums">{awaitingCount}</dd>
              </div>
            </dl>
          </div>

          <ol className="mt-12 border-y border-border-medium">
            {categories.map((category, index) => {
              const Glyph = category.icon;
              const docHref = category.doc?.href;
              const available = Boolean(category.href || docHref);
              const title = t(`categories.${category.key}.title`);
              const rowContent = (
                <>
                  <span className="font-mono text-[0.6875rem] font-medium text-ink-tertiary tabular-nums" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-glow text-accent" aria-hidden="true">
                    <Glyph size={20} weight="duotone" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] font-semibold leading-[1.45] text-ink-primary">{title}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-[1.5] text-ink-secondary">
                      {t(`categories.${category.key}.desc`)}
                    </span>
                  </span>
                  <span
                    className={`hidden items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] sm:inline-flex ${
                      available ? "text-accent" : "text-ink-tertiary"
                    }`}
                  >
                    {available ? (
                      <CheckCircle size={16} weight="fill" aria-hidden="true" />
                    ) : (
                      <Clock size={16} weight="fill" aria-hidden="true" />
                    )}
                    {available ? t("registry.published") : tc("comingSoon")}
                  </span>
                  {available ? (
                    category.href ? (
                      <ArrowRight size={20} className="text-accent transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    ) : (
                      <DownloadSimple size={20} className="text-accent transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden="true" />
                    )
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-border-strong" aria-hidden="true" />
                  )}
                </>
              );
              const rowClass =
                "transparency-register-row transparency-motion-control group grid min-h-[104px] grid-cols-[26px_40px_minmax(0,1fr)_20px] items-center gap-4 border-b border-border-subtle px-1 py-5 text-left last:border-b-0 sm:grid-cols-[30px_44px_minmax(0,1fr)_auto_24px] sm:px-5 sm:py-6";

              return (
                <li key={category.key}>
                  {category.href ? (
                    <Link href={category.href} className={`${rowClass} hover:bg-bg-elevated`}>
                      {rowContent}
                    </Link>
                  ) : docHref ? (
                    <a
                      href={docHref}
                      {...(category.doc?.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : { download: true })}
                      className={`${rowClass} hover:bg-bg-elevated`}
                    >
                      {rowContent}
                      {category.doc?.external ? <span className="sr-only">{t("registry.external")}</span> : null}
                    </a>
                  ) : (
                    <div className={rowClass}>{rowContent}</div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex items-start gap-3 border-l-2 border-border-medium pl-4 text-[0.8125rem] leading-[1.6] text-ink-secondary">
            <ArrowUpRight size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            <p>{t("registry.note")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
