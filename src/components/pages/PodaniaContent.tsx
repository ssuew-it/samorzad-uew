"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowRight,
  ArrowSquareOut,
  Check,
  CheckCircle,
  ClipboardText,
  ClockCountdown,
  Copy,
  FileText,
  Info,
  SealWarning,
  WarningCircle,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { DURATION, EASE } from "@/lib/motion";
import {
  applicationsCircularReference,
  applicationsInfopack,
  studyRegulationPage,
  studyRegulationSource,
} from "@/lib/living-documents";

type ApplicationKey =
  | "where"
  | "template"
  | "conditional"
  | "repeat"
  | "ios"
  | "ips"
  | "transfer"
  | "extension"
  | "recognition"
  | "committee"
  | "lateRegistration"
  | "resumption"
  | "leave"
  | "promoter"
  | "appeal"
  | "studentId";

type GroupKey = "start" | "study" | "results" | "return" | "formal";
type Confidence = "regulation" | "mixed" | "infopack";

interface ApplicationType {
  key: ApplicationKey;
  group: GroupKey;
  infopackPage: number;
  section?: string;
  sourcePage?: number;
  confidence: Confidence;
  urgent?: boolean;
}

const applicationTypes: ApplicationType[] = [
  { key: "where", group: "start", infopackPage: 3, section: "§ 14", sourcePage: 13, confidence: "regulation" },
  { key: "template", group: "start", infopackPage: 4, section: "§ 12", sourcePage: 12, confidence: "regulation" },
  { key: "conditional", group: "results", infopackPage: 5, section: "§ 39-40", sourcePage: 28, confidence: "regulation" },
  { key: "repeat", group: "results", infopackPage: 6, section: "§ 39-40", sourcePage: 28, confidence: "regulation" },
  { key: "ios", group: "study", infopackPage: 7, section: "§ 15", sourcePage: 14, confidence: "mixed" },
  { key: "ips", group: "study", infopackPage: 8, section: "§ 16", sourcePage: 14, confidence: "mixed" },
  { key: "transfer", group: "study", infopackPage: 10, section: "§ 17", sourcePage: 15, confidence: "regulation" },
  { key: "extension", group: "results", infopackPage: 11, section: "§ 30 ust. 7", sourcePage: 24, confidence: "regulation", urgent: true },
  { key: "recognition", group: "study", infopackPage: 12, section: "§ 34-35", sourcePage: 26, confidence: "regulation" },
  { key: "committee", group: "results", infopackPage: 13, section: "§ 36-38", sourcePage: 26, confidence: "regulation", urgent: true },
  { key: "lateRegistration", group: "study", infopackPage: 14, section: "§ 24", sourcePage: 20, confidence: "mixed" },
  { key: "resumption", group: "return", infopackPage: 14, section: "§ 22", sourcePage: 18, confidence: "regulation" },
  { key: "leave", group: "study", infopackPage: 15, section: "§ 19-20", sourcePage: 16, confidence: "regulation" },
  { key: "promoter", group: "formal", infopackPage: 16, section: "§ 41 ust. 2", sourcePage: 29, confidence: "mixed" },
  { key: "appeal", group: "formal", infopackPage: 17, section: "§ 13-14", sourcePage: 13, confidence: "regulation", urgent: true },
  { key: "studentId", group: "formal", infopackPage: 18, confidence: "infopack" },
];

const groups: GroupKey[] = ["start", "study", "results", "return", "formal"];

export function PodaniaContent() {
  const t = useTranslations("applicationsLive");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [activeGroup, setActiveGroup] = useState<GroupKey>("results");
  const [activeKey, setActiveKey] = useState<ApplicationKey>("committee");
  const [copied, setCopied] = useState(false);

  const filtered = applicationTypes.filter((item) => item.group === activeGroup);
  const active = applicationTypes.find((item) => item.key === activeKey) ?? applicationTypes[0];
  const checklist = t.raw(`cases.${active.key}.checklist`) as string[];
  const steps = t.raw(`cases.${active.key}.steps`) as string[];

  function selectGroup(group: GroupKey) {
    setActiveGroup(group);
    setActiveKey(applicationTypes.find((item) => item.group === group)?.key ?? "where");
    setCopied(false);
  }

  async function copyTemplate() {
    await navigator.clipboard.writeText(t(`cases.${active.key}.template`));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  const confidenceLabel = t(`confidence.${active.confidence}`);

  return (
    <>
      <section className="applications-hero relative overflow-hidden border-b border-white/10 bg-[#10294f] text-white" aria-labelledby="applications-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="applications-enter applications-enter-1 applications-breadcrumbs">
            <Breadcrumbs
              items={[
                { label: tc("home"), href: "/" },
                { label: t("breadcrumbs.infopacks"), href: "/infopacki" },
                { label: t("heroTitle") },
              ]}
            />
          </div>

          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.62fr)] lg:gap-20">
            <div>
              <p className="applications-enter applications-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#ffd46c]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffc23d]" aria-hidden="true" />
                {t("heroLabel")}
              </p>
              <h1 id="applications-title" className="applications-enter applications-enter-3 mt-6 max-w-[13ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">
                {t("heroTitle")}
              </h1>
              <p className="applications-enter applications-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/78 sm:text-[1.125rem]">
                {t("heroLead")}
              </p>
              <a href="#kompas" className="applications-motion applications-enter applications-enter-5 group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#ffc23d] px-6 py-3 font-semibold text-[#182033] transition-[background-color,transform] duration-150 hover:bg-[#ffd977] active:scale-[0.98]">
                {t("heroCta")}
                <ArrowDown size={19} weight="bold" className="transition-transform duration-200 group-hover:translate-y-1" aria-hidden="true" />
              </a>
            </div>

            <InfopackSourceVisual
              src="/photos/infopacki/podania-cover.jpg"
              href={applicationsInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.casesLabel"), value: "16" },
                { label: t("source.checkedLabel"), value: "13.08.2026" },
                { label: t("source.channelLabel"), value: "USOS" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section id="kompas" className="section-padding scroll-mt-20" aria-labelledby="compass-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.54fr)] lg:items-end lg:gap-20">
            <div>
              <h2 id="compass-heading" className="max-w-[17ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">
                {t("compass.heading")}
              </h2>
              <p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("compass.lead")}</p>
            </div>
            <p className="flex items-start gap-3 border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary">
              <Info size={19} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              {t("compass.disclaimer")}
            </p>
          </div>

          <div className="mt-10 flex gap-2 overflow-x-auto border-y border-border-medium py-3" role="tablist" aria-label={t("groups.ariaLabel")}>
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={activeGroup === group}
                onClick={() => selectGroup(group)}
                className={`applications-motion min-h-11 shrink-0 rounded-full px-4 text-[0.8125rem] font-semibold transition-colors ${activeGroup === group ? "bg-[#153f70] text-white" : "bg-bg-elevated text-ink-secondary hover:text-ink-primary"}`}
              >
                {t(`groups.${group}`)}
              </button>
            ))}
          </div>

          <div className="mt-8 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(280px,0.68fr)_minmax(0,1.32fr)] lg:gap-12">
            <div className="min-w-0 border-y border-border-medium" role="tabpanel">
              {filtered.map((item) => {
                const index = applicationTypes.findIndex((candidate) => candidate.key === item.key);
                const isActive = active.key === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => { setActiveKey(item.key); setCopied(false); }}
                    className="application-case-button applications-motion group grid min-h-[76px] w-full grid-cols-[42px_minmax(0,1fr)_22px] items-center gap-3 border-b border-border-subtle px-2 py-3 text-left last:border-b-0 sm:px-4"
                  >
                    <span className={`font-display text-[1rem] font-semibold tabular-nums ${isActive ? "text-[#774900] dark:text-[#ffd46c]" : "text-ink-tertiary"}`} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.875rem] font-semibold leading-[1.4] text-ink-primary">{t(`cases.${item.key}.label`)}</span>
                      <span className={`mt-1 flex flex-wrap gap-x-2 text-[0.6875rem] ${isActive ? "text-ink-secondary" : "text-ink-tertiary"}`}>
                        <span>{t("compass.infopackPage", { page: item.infopackPage })}</span>
                        {item.urgent ? <span className="font-semibold text-[#a64121] dark:text-[#ffad93]">{t("compass.urgent")}</span> : null}
                      </span>
                    </span>
                    <ArrowRight size={18} weight="bold" className={`transition-transform duration-200 ${isActive ? "translate-x-1 text-accent" : "text-ink-tertiary group-hover:translate-x-1"}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <div className="min-h-[690px] min-w-0" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={active.key}
                  initial={reduce ? false : { opacity: 0, x: 14, filter: "blur(3px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={reduce ? undefined : { opacity: 0, x: -8, filter: "blur(2px)" }}
                  transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }}
                  className="min-h-[690px] bg-bg-surface"
                >
                  <header className="border-b border-border-medium bg-bg-elevated px-5 py-4 sm:px-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-mono text-[0.6875rem] font-medium text-ink-secondary">
                        {active.section ?? t("compass.infopackOnly")} · {t("compass.infopackPage", { page: active.infopackPage })}
                      </p>
                      <span className={`inline-flex items-center gap-2 text-[0.6875rem] font-semibold ${active.confidence === "regulation" ? "text-[#17643b] dark:text-[#7ee2a8]" : "text-[#774900] dark:text-[#ffd46c]"}`}>
                        {active.confidence === "regulation" ? <CheckCircle size={15} weight="fill" /> : <SealWarning size={15} weight="fill" />}
                        {confidenceLabel}
                      </span>
                    </div>
                  </header>

                  <div className="p-6 sm:p-9">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <p className="font-display text-[1rem] font-semibold text-[#774900] dark:text-[#ffd46c]">
                          {String(applicationTypes.findIndex((item) => item.key === active.key) + 1).padStart(2, "0")} / 16
                        </p>
                        <h3 className="mt-3 max-w-[19ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink-primary">
                          {t(`cases.${active.key}.title`)}
                        </h3>
                      </div>
                      {active.urgent ? (
                        <div className="flex max-w-[230px] items-start gap-3 rounded-lg bg-[#fff0e9] p-3 text-[#742b14] dark:bg-[#3c1d14] dark:text-[#ffc2ad]">
                          <ClockCountdown size={21} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
                          <span className="text-[0.75rem] font-semibold leading-[1.5]">{t(`cases.${active.key}.deadline`)}</span>
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-5 max-w-[68ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t(`cases.${active.key}.summary`)}</p>

                    <div className="mt-8 grid gap-8 xl:grid-cols-2">
                      <section aria-labelledby={`checklist-${active.key}`}>
                        <h4 id={`checklist-${active.key}`} className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-primary">
                          <ClipboardText size={19} weight="duotone" className="text-accent" aria-hidden="true" />
                          {t("compass.checklist")}
                        </h4>
                        <ul className="mt-3 border-y border-border-medium">
                          {checklist.map((item) => (
                            <li key={item} className="flex gap-3 border-b border-border-subtle py-3.5 last:border-b-0">
                              <Check size={17} weight="bold" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                              <span className="text-[0.8125rem] leading-[1.6] text-ink-secondary">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section aria-labelledby={`steps-${active.key}`}>
                        <h4 id={`steps-${active.key}`} className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-primary">
                          <FileText size={19} weight="duotone" className="text-accent" aria-hidden="true" />
                          {t("compass.steps")}
                        </h4>
                        <ol className="mt-3 border-y border-border-medium">
                          {steps.map((step, index) => (
                            <li key={step} className="grid grid-cols-[26px_1fr] gap-3 border-b border-border-subtle py-3.5 last:border-b-0">
                              <span className="font-display text-[0.75rem] font-semibold text-[#774900] dark:text-[#ffd46c]" aria-hidden="true">{index + 1}</span>
                              <span className="text-[0.8125rem] leading-[1.6] text-ink-secondary">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </section>
                    </div>

                    <div className="mt-8 bg-[#153f70] p-5 text-white sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-[0.8125rem] font-semibold text-[#ffd46c]">{t("compass.template")}</p>
                        <button type="button" onClick={copyTemplate} className="applications-motion inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 py-2 text-[0.75rem] font-semibold text-[#173451] hover:bg-[#edf4ff]">
                          {copied ? <CheckCircle size={17} weight="fill" /> : <Copy size={17} weight="bold" />}
                          {copied ? t("compass.copied") : t("compass.copy")}
                        </button>
                      </div>
                      <p className="mt-4 whitespace-pre-line text-[0.8125rem] leading-[1.7] text-white/82">{t(`cases.${active.key}.template`)}</p>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                      {active.sourcePage && active.section ? (
                        <a href={studyRegulationPage(active.sourcePage)} target="_blank" rel="noopener noreferrer" className="applications-motion group inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">
                          {t("compass.openSource", { section: active.section })}
                          <ArrowSquareOut size={18} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                        </a>
                      ) : null}
                      <a href={applicationsInfopack} target="_blank" rel="noopener noreferrer" className="applications-motion inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">
                        {t("compass.openInfopack", { page: active.infopackPage })}
                        <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-border-subtle bg-bg-surface" aria-labelledby="applications-sources-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
            <div>
              <FileText size={34} weight="duotone" className="text-accent" aria-hidden="true" />
              <h2 id="applications-sources-heading" className="mt-6 max-w-[15ch] text-balance font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink-primary">
                {t("sources.heading")}
              </h2>
              <p className="mt-5 max-w-[58ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("sources.lead")}</p>
            </div>

            <ul className="border-y border-border-medium">
              <li className="border-b border-border-subtle">
                <a href={studyRegulationSource.landingPage} target="_blank" rel="noopener noreferrer" className="applications-motion group flex min-h-[92px] items-center justify-between gap-5 px-2 py-4 hover:bg-bg-elevated sm:px-5">
                  <span><span className="block text-[0.875rem] font-semibold text-ink-primary">{t("sources.regulationTitle")}</span><span className="mt-1 block text-[0.75rem] text-ink-tertiary">{t("sources.regulationDesc")}</span></span>
                  <ArrowSquareOut size={19} weight="bold" className="shrink-0 text-accent" aria-hidden="true" />
                </a>
              </li>
              <li className="border-b border-border-subtle">
                <a href={applicationsInfopack} target="_blank" rel="noopener noreferrer" className="applications-motion group flex min-h-[92px] items-center justify-between gap-5 px-2 py-4 hover:bg-bg-elevated sm:px-5">
                  <span><span className="block text-[0.875rem] font-semibold text-ink-primary">{t("sources.infopackTitle")}</span><span className="mt-1 block text-[0.75rem] text-ink-tertiary">{t("sources.infopackDesc")}</span></span>
                  <ArrowSquareOut size={19} weight="bold" className="shrink-0 text-accent" aria-hidden="true" />
                </a>
              </li>
              <li className="flex min-h-[104px] items-start gap-4 px-2 py-5 sm:px-5">
                <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-[#8b5610] dark:text-[#ffd46c]" aria-hidden="true" />
                <span><span className="block text-[0.875rem] font-semibold text-ink-primary">{applicationsCircularReference.title}</span><span className="mt-1 block text-[0.75rem] leading-[1.6] text-ink-tertiary">{t("sources.circularDesc")}</span></span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
