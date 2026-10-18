"use client";
import { ArrowDown } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Breadcrumbs } from "../Breadcrumbs";

export function TransparentnoscHero() {
  const t = useTranslations("transparentnosc");
  const tc = useTranslations("common");
  return (
    <section className="border-b border-border-medium bg-bg-surface px-6 pb-12 pt-28 md:pb-16 md:pt-32" aria-labelledby="transparency-title">
      <div className="mx-auto max-w-[1120px]">
        <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("metaTitle") }]} />
        <h1 id="transparency-title" className="mt-10 break-words font-display text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">{t("heroTitle")}</h1>
        <p className="mt-6 max-w-[65ch] text-pretty text-lg leading-relaxed text-ink-secondary">{t("heroLead")}</p>
        <nav aria-label={t("sectionNav")} className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <a href="#sprawozdanie-finansowe" className="inline-flex min-h-12 items-center gap-3 font-semibold text-accent underline decoration-1 underline-offset-4">{t("heroCta")}<ArrowDown size={18} aria-hidden="true" /></a>
          <a href="#rejestr" className="inline-flex min-h-12 items-center gap-3 text-ink-primary underline decoration-1 underline-offset-4">{t("heroRegistryCta")}<ArrowDown size={18} aria-hidden="true" /></a>
        </nav>
      </div>
    </section>
  );
}
