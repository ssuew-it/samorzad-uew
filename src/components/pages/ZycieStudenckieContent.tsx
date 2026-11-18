import { useTranslations } from "next-intl";
import { ArrowDown, ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { Breadcrumbs } from "../Breadcrumbs";
import { InfopackSourceVisual } from "../InfopackCover";
import { studentLifeInfopack, studentLifeSources } from "@/lib/living-documents";
import { paths } from "@/lib/zycie-sciezki";
import { ZycieDopasowanie } from "./ZycieDopasowanie";

const commitmentQuestions = ["hours", "firstTask", "peak", "exit"] as const;

export function ZycieStudenckieContent() {
  const t = useTranslations("studentLifeLive");
  const tc = useTranslations("common");

  return (
    <div className="infopack-rounded">
      <section className="life-hero relative overflow-hidden border-b border-white/10 bg-[#171443] text-white" aria-labelledby="life-title">
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="life-enter life-enter-1 life-breadcrumbs"><Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumbs.infopacks"), href: "/infopacki" }, { label: t("heroTitle") }]} /></div>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.56fr)] lg:gap-20">
            <div><p className="life-enter life-enter-2 inline-flex items-center gap-3 text-[0.8125rem] font-semibold text-[#c9c4ff]">{t("heroLabel")}</p><h1 id="life-title" className="life-enter life-enter-3 mt-6 max-w-[12ch] text-balance font-display text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("heroTitle")}</h1><p className="life-enter life-enter-4 mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-white/76 sm:text-[1.125rem]">{t("heroLead")}</p><a href="#matcher" className="life-motion group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#ffcf58] px-6 py-3 font-semibold text-[#211738] hover:bg-[#ffe39a]">{t("heroCta")}<ArrowDown size={19} weight="bold" className="transition-transform group-hover:translate-y-1" aria-hidden="true" /></a></div>
            <InfopackSourceVisual
              src="/photos/infopacki/zycie-cover.jpg"
              href={studentLifeInfopack}
              openLabel={t("source.title")}
              sourceLabel={t("source.label")}
              sourceTitle={t("source.title")}
              details={[
                { label: t("source.paths"), value: String(paths.length) },
                { label: t("source.questions"), value: "4" },
                { label: t("source.checked"), value: "13.08.2026" },
              ]}
              className="order-first [&>figcaption]:hidden lg:order-none lg:[&>figcaption]:block"
            />
          </div>
        </div>
      </section>

      <section id="matcher" className="section-padding scroll-mt-20" aria-labelledby="matcher-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.5fr)] lg:items-end lg:gap-20"><div><p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">{t("matcher.label")}</p><h2 id="matcher-heading" className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("matcher.heading")}</h2><p className="mt-5 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">{t("matcher.lead")}</p></div><p className="border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-secondary">{t("matcher.note")}</p></div>
        <ZycieDopasowanie />
      </div></section>

      <section className="section-padding border-y border-border-medium bg-[#fff5d7] dark:bg-[#2c2410]" aria-labelledby="commitment-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-20"><div><p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[#7a5610] dark:text-[#ffda79]">{t("commitment.label")}</p><h2 id="commitment-heading" className="mt-4 max-w-[13ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("commitment.heading")}</h2><p className="mt-5 max-w-[52ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("commitment.lead")}</p></div><ol className="border-y border-[#bba66c] dark:border-white/20">{commitmentQuestions.map((question, index) => <li key={question} className="grid gap-4 border-b border-[#d5c48e] py-5 last:border-b-0 dark:border-white/15 sm:grid-cols-[48px_minmax(0,1fr)]"><span className="font-display text-[1.5rem] font-semibold text-[#8a650f] dark:text-[#ffda79]">0{index + 1}</span><div><p className="text-[0.9375rem] font-semibold text-ink-primary">{t(`commitment.questions.${question}.question`)}</p><p className="mt-2 text-[0.75rem] leading-[1.6] text-ink-secondary">{t(`commitment.questions.${question}.why`)}</p></div></li>)}</ol></div></div></section>

      <section className="section-padding" aria-labelledby="start-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-12 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-20"><div><p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">{t("start.label")}</p><h2 id="start-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.8vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("start.heading")}</h2><p className="mt-5 max-w-[48ch] text-pretty text-[0.9375rem] leading-[1.75] text-ink-secondary">{t("start.lead")}</p></div><ol className="grid gap-px bg-border-medium sm:grid-cols-2">{(["observe", "contact", "trial", "decide"] as const).map((step, index) => <li key={step} className="bg-bg-surface p-6"><span className="font-mono text-[0.75rem] font-semibold text-accent">0{index + 1}</span><h3 className="mt-4 text-[1rem] font-semibold text-ink-primary">{t(`start.steps.${step}.title`)}</h3><p className="mt-3 text-[0.75rem] leading-[1.6] text-ink-secondary">{t(`start.steps.${step}.body`)}</p></li>)}</ol></div></div></section>

      <section className="border-y border-border-medium bg-bg-elevated" aria-labelledby="current-heading"><div className="mx-auto max-w-[1200px] px-6 py-12"><div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-20"><div><p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">{t("current.label")}</p><h2 id="current-heading" className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-ink-primary">{t("current.heading")}</h2></div><div className="border-l-2 border-[#ffbf2f] pl-6"><p className="text-[0.9375rem] font-semibold text-ink-primary">{t("current.title")}</p><p className="mt-3 max-w-[70ch] text-[0.8125rem] leading-[1.65] text-ink-secondary">{t("current.body")}</p><a href={studentLifeSources.kafe} target="_blank" rel="noopener noreferrer" className="life-motion mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[0.8125rem] font-semibold text-bg-base hover:bg-accent-dim">{t("current.cta")}<ArrowSquareOut size={16} weight="bold" aria-hidden="true" /></a></div></div></div></section>

      <section className="section-padding" aria-labelledby="life-sources-heading"><div className="mx-auto max-w-[1200px]"><div className="grid gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-20"><div><p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">{t("sources.label")}</p><h2 id="life-sources-heading" className="mt-4 max-w-[12ch] text-balance font-display text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary">{t("sources.heading")}</h2><p className="mt-5 text-[0.875rem] leading-[1.7] text-ink-secondary">{t("sources.lead")}</p></div><div className="grid gap-px bg-border-medium sm:grid-cols-2">{(["organisations", "sport", "career", "dtHub"] as const).map((source) => <a key={source} href={studentLifeSources[source]} target="_blank" rel="noopener noreferrer" className="life-motion group flex min-h-[104px] items-start justify-between gap-5 bg-bg-surface p-5 hover:bg-bg-elevated"><span><span className="block text-[0.875rem] font-semibold text-ink-primary">{t(`sources.links.${source}.title`)}</span><span className="mt-2 block text-[0.75rem] leading-[1.5] text-ink-tertiary">{t(`sources.links.${source}.meta`)}</span></span><ArrowSquareOut size={18} weight="bold" className="shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></a>)}</div></div><a href={studentLifeInfopack} target="_blank" rel="noopener noreferrer" className="life-motion mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-medium px-5 py-3 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-elevated">{t("sources.infopack")}<ArrowSquareOut size={18} weight="bold" aria-hidden="true" /></a></div></section>
    </div>
  );
}
