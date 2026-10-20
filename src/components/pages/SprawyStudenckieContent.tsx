"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowRight,
  ArrowSquareOut,
  Buildings,
  Certificate,
  ChatCircleDots,
  Check,
  Copy,
  FileText,
  Gavel,
  IdentificationCard,
  Info,
  MagnifyingGlass,
  PaperPlaneTilt,
  Path,
  UsersThree,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { Link } from "@/i18n/navigation";
import { DURATION, EASE } from "@/lib/motion";
import { viceDeans } from "@/lib/people";
import { deanInfopack, deanOfficeSources } from "@/lib/living-documents";

type MatterKey = "information" | "certificate" | "documents" | "application" | "unresolved" | "summons";
type DoorKey = "office" | "application" | "viceDean" | "dean";

interface Matter {
  key: MatterKey;
  door: DoorKey;
  icon: typeof Buildings;
  href?: string;
}

const matters: Matter[] = [
  { key: "information", door: "office", icon: ChatCircleDots },
  { key: "certificate", door: "office", icon: Certificate },
  { key: "documents", door: "office", icon: IdentificationCard },
  { key: "application", door: "application", icon: FileText, href: "/infopacki/podania" },
  { key: "unresolved", door: "viceDean", icon: UsersThree },
  { key: "summons", door: "dean", icon: Gavel },
];

interface ProgrammeOwner {
  key: "turowska" | "werenska" | "bobowski";
  name: string;
  email?: string;
  role: "dean" | "viceDean";
}

export function SprawyStudenckieContent() {
  const t = useTranslations("studentMattersLive");
  const td = useTranslations("dziekani");
  const tc = useTranslations("common");
  const reduce = useReducedMotion();
  const [activeKey, setActiveKey] = useState<MatterKey>("information");
  const [programmeQuery, setProgrammeQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const active = matters.find((matter) => matter.key === activeKey) ?? matters[0];
  const steps = t.raw(`matters.${active.key}.steps`) as string[];
  const prepare = t.raw(`matters.${active.key}.prepare`) as string[];
  const owners: ProgrammeOwner[] = useMemo(() => [
    ...viceDeans.map((person) => ({ ...person, role: "viceDean" as const })) as ProgrammeOwner[],
  ], []);
  const normalizedQuery = programmeQuery.trim().toLocaleLowerCase();
  const matches = normalizedQuery.length < 2 ? [] : owners.flatMap((owner) => {
    const programmes = td.raw(`kierunki.${owner.key}`) as string[];
    return programmes.filter((programme) => programme.toLocaleLowerCase().includes(normalizedQuery)).map((programme) => ({ ...owner, programme }));
  });
  const mailTemplate = t("message.template");

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(mailTemplate);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <section className="matters-hero relative overflow-hidden border-b border-white/10 bg-[#10223f] text-white" aria-labelledby="matters-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="matters-enter matters-enter-1 matters-breadcrumbs"><Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumbs.infopacks"), href: "/infopacki" }, { label: t("heroTitle") }]} /></div>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.58fr)] lg:gap-20">
            <div><p className="matters-enter matters-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#a8d7ff]"><span className="h-2.5 w-2.5 rounded-full bg-[#62c7ff]" aria-hidden="true" />{t("heroLabel")}</p><h1 id="matters-title" className="matters-enter matters-enter-3 mt-6 max-w-[12ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("heroTitle")}</h1><p className="matters-enter matters-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/76 sm:text-[1.125rem]">{t("heroLead")}</p><a href="#router" className="matters-motion group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#62c7ff] px-6 py-3 font-semibold text-[#08203d] hover:bg-[#a7e2ff]">{t("heroCta")}<ArrowDown size={19} weight="bold" className="transition-transform group-hover:translate-y-1" aria-hidden="true" /></a></div>
            <InfopackSourceVisual
              src="/photos/infopacki/sprawy-cover.jpg"
              href={deanInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.matters"), value: "6" },
                { label: t("source.doors"), value: "4" },
                { label: t("source.checked"), value: "13.08.2026" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section id="router" className="section-padding scroll-mt-20" aria-labelledby="router-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.48fr)] lg:items-end lg:gap-20"><div><h2 id="router-heading" className="max-w-[17ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("router.heading")}</h2><p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("router.lead")}</p></div><p className="flex items-start gap-3 border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary"><Info size={19} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />{t("router.rule")}</p></div>
          <div className="mt-10 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(285px,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
            <div className="border-y border-border-medium" role="group" aria-label={t("router.ariaLabel")}>{matters.map((matter, index) => { const Icon = matter.icon; const isActive = matter.key === active.key; return <button key={matter.key} type="button" aria-pressed={isActive} onClick={() => setActiveKey(matter.key)} className="matter-button matters-motion group grid min-h-[82px] w-full grid-cols-[34px_minmax(0,1fr)_22px] items-center gap-3 border-b border-border-subtle px-2 py-3 text-left last:border-b-0 sm:px-4"><Icon size={20} weight={isActive ? "fill" : "duotone"} className={isActive ? "text-accent" : "text-ink-tertiary"} aria-hidden="true" /><span><span className="block text-[0.875rem] font-semibold leading-[1.4] text-ink-primary">{t(`matters.${matter.key}.label`)}</span><span className={`mt-1 block text-[0.6875rem] ${isActive ? "text-ink-secondary" : "text-ink-tertiary"}`}>{String(index + 1).padStart(2, "0")} · {t(`doors.${matter.door}`)}</span></span><ArrowRight size={18} weight="bold" className={`transition-transform ${isActive ? "translate-x-1 text-accent" : "text-ink-tertiary group-hover:translate-x-1"}`} aria-hidden="true" /></button>; })}</div>
            <div className="min-h-[650px] min-w-0" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.article key={active.key} initial={reduce ? false : { opacity: 0, x: 14, filter: "blur(3px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduce ? undefined : { opacity: 0, x: -8, filter: "blur(2px)" }} transition={reduce ? { duration: 0 } : { duration: DURATION.reveal, ease: EASE }} className="min-h-[650px] bg-bg-surface"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-medium bg-bg-elevated px-5 py-4 sm:px-7"><p className="font-mono text-[0.6875rem] font-medium text-ink-secondary">{t("router.firstDoor")}</p><span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold text-[#0f654d] dark:text-[#7fe1ba]"><Buildings size={16} weight="fill" aria-hidden="true" />{t(`doors.${active.door}`)}</span></header><div className="p-6 sm:p-9"><h3 className="max-w-[20ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink-primary">{t(`matters.${active.key}.title`)}</h3><p className="mt-5 max-w-[68ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t(`matters.${active.key}.summary`)}</p><div className="mt-7 bg-[#102d53] p-5 text-white sm:p-7"><p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#8dd8ff]"><Path size={19} weight="duotone" aria-hidden="true" />{t("router.path")}</p><ol className="mt-5 grid gap-px bg-white/18 sm:grid-cols-3">{steps.map((step, stepIndex) => <li key={step} className="bg-[#102d53] p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#62c7ff] text-[0.6875rem] font-bold text-[#08203d]">{stepIndex + 1}</span><p className="mt-4 text-[0.75rem] font-medium leading-[1.5] text-white/86">{step}</p></li>)}</ol></div><h4 className="mt-8 text-[0.8125rem] font-semibold text-ink-primary">{t("router.prepare")}</h4><ul className="mt-3 border-y border-border-medium">{prepare.map((item) => <li key={item} className="flex gap-3 border-b border-border-subtle py-3.5 last:border-b-0"><Check size={17} weight="bold" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" /><span className="text-[0.8125rem] leading-[1.6] text-ink-secondary">{item}</span></li>)}</ul><div className="mt-7 flex flex-wrap gap-3">{active.href ? <Link href={active.href} className="matters-motion inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t(`matters.${active.key}.cta`)}<ArrowRight size={18} weight="bold" aria-hidden="true" /></Link> : <a href={deanOfficeSources.current} target="_blank" rel="noopener noreferrer" className="matters-motion inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-5 py-3 text-[0.875rem] font-semibold text-white hover:bg-accent-dim">{t("router.openOffice")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a>}<a href={deanInfopack} target="_blank" rel="noopener noreferrer" className="matters-motion inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">{t("router.openInfopack")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a></div></div></motion.article></AnimatePresence></div>
          </div>
        </div>
      </section>

      <section className="section-padding border-y border-border-medium bg-bg-elevated" aria-labelledby="programme-heading">
        <div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("programme.label")}</p><h2 id="programme-heading" className="mt-4 max-w-[14ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("programme.heading")}</h2><p className="mt-5 max-w-[55ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("programme.lead")}</p></div><div><label htmlFor="programme-search" className="text-[0.8125rem] font-semibold text-ink-primary">{t("programme.searchLabel")}</label><div className="mt-3 flex min-h-14 items-center gap-3 border-b-2 border-ink-primary bg-bg-surface px-4"><MagnifyingGlass size={21} className="shrink-0 text-ink-tertiary" aria-hidden="true" /><input id="programme-search" value={programmeQuery} onChange={(event) => setProgrammeQuery(event.target.value)} placeholder={t("programme.placeholder")} className="min-w-0 flex-1 bg-transparent py-4 text-[0.9375rem] text-ink-primary outline-none placeholder:text-ink-tertiary" /></div><div className="mt-5 min-h-[240px]" aria-live="polite">{normalizedQuery.length < 2 ? <p className="border-y border-border-medium py-5 text-[0.8125rem] leading-[1.6] text-ink-tertiary">{t("programme.hint")}</p> : matches.length ? <ul className="border-y border-border-medium">{matches.map((match) => <li key={`${match.key}-${match.programme}`} className="grid gap-4 border-b border-border-subtle py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)]"><div><p className="text-[0.9375rem] font-semibold text-ink-primary">{match.programme}</p><p className="mt-1 text-[0.75rem] text-ink-tertiary">{match.role === "dean" ? t("programme.dean") : t("programme.viceDean")}</p></div><div><p className="text-[0.8125rem] font-semibold text-ink-primary">{match.name}</p>{match.email ? <a href={`mailto:${match.email}`} className="mt-2 inline-block text-[0.75rem] font-medium text-accent hover:text-accent-dim">{match.email}</a> : null}</div></li>)}</ul> : <p className="border-y border-border-medium py-5 text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("programme.noResult")} <a href={deanOfficeSources.current} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">{t("programme.checkSource")}</a></p>}</div></div></div></div>
      </section>

      <section className="section-padding" aria-labelledby="message-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20"><div><p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">{t("message.label")}</p><h2 id="message-heading" className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("message.heading")}</h2><p className="mt-5 max-w-[55ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("message.lead")}</p></div><div className="bg-[#102d53] p-5 text-white sm:p-8"><div className="flex items-center justify-between gap-4 border-b border-white/20 pb-5"><p className="flex items-center gap-3 text-[0.8125rem] font-semibold"><PaperPlaneTilt size={20} weight="duotone" className="text-[#62c7ff]" aria-hidden="true" />{t("message.subject")}</p><button type="button" onClick={copyTemplate} className="matters-motion inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/25 px-3 text-[0.75rem] font-semibold hover:bg-white/10">{copied ? <Check size={16} weight="bold" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{copied ? t("message.copied") : t("message.copy")}</button></div><pre className="mt-6 whitespace-pre-wrap font-sans text-[0.8125rem] leading-[1.75] text-white/82">{mailTemplate}</pre></div></div></div></section>
    </>
  );
}
