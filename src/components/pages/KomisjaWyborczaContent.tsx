import type { CSSProperties } from "react";
import { TERM } from "@/lib/term";
import { useLocale, useTranslations } from "next-intl";
import { LangBadgeLink } from "../LangBadgeLink";
import { ArrowUpRight, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react/ssr";
import { PersonCard } from "../PersonCard";
import { ScrollReveal } from "../ScrollReveal";
import { electionCommittee as czlonkowie } from "@/lib/people";
import type { SkwResolution } from "@/lib/skw";

export function KomisjaWyborczaContent({ resolutions }: { resolutions: SkwResolution[] }) {
  const locale = useLocale() === "en" ? "en" : "pl";
  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(`${d}T12:00:00`),
    );
  const t = useTranslations("skw");
  const tc = useTranslations("common");
  const zadania = t.raw("zadania") as string[];

  return (
    <section className="section-padding" aria-labelledby="skw-heading">
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <h2
            id="skw-heading"
            className="max-w-[26ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("heading")}
          </h2>
          <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
            {t("intro")}
          </p>
        </ScrollReveal>

        {/* Zadania */}
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {zadania.map((z, i) => (
            <li
              key={i}
              style={{ "--reveal-delay": Math.min(i, 4) * 0.06 } as CSSProperties}
              className="reveal flex gap-3 rounded-xl border border-border-subtle bg-bg-surface p-5"
            >
              <CheckCircle size={22} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <span className="text-[0.9375rem] leading-[1.6] text-ink-secondary">{z}</span>
            </li>
          ))}
        </ul>

        {/* Skład */}
        <h3 className="mt-14 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary">
          {t("skladHeading")}
        </h3>
        {czlonkowie.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {czlonkowie.map((c, i) => (
              <div
                key={c.name}
                style={{ "--reveal-delay": Math.min(i, 4) * 0.08 } as CSSProperties}
                className="reveal h-full"
              >
                <PersonCard name={c.name} role={t(`roles.${c.roleKey}`)} photo={c.photo} className="h-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border-medium bg-bg-surface p-6">
            <span className="rounded-full border border-border-subtle px-2.5 py-0.5 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
              {tc("comingSoon")}
            </span>
            <p className="text-[0.9375rem] text-ink-secondary">{t("skladSoon")}</p>
          </div>
        )}

        {/* CTA */}
        <ScrollReveal>
          <div className="mt-12 flex flex-col flex-wrap gap-4 sm:flex-row">
            <a
              href="mailto:skw@samorzad.ue.wroc.pl"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
            >
              <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
              skw@samorzad.ue.wroc.pl
            </a>
          </div>
        </ScrollReveal>

        {/* Uchwały - z zakładki „Uchwały SKW” w arkuszu Treści strony. */}
        <section id="uchwaly" className="mt-16 scroll-mt-24" aria-labelledby="skw-resolutions-heading">
          <h3
            id="skw-resolutions-heading"
            className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary"
          >
            {t("resolutionsHeading", { term: TERM })}
          </h3>
          <p className="prose-constrained mt-3 text-[0.9375rem] leading-[1.7] text-ink-secondary">{t("resolutionsLead")}</p>
          {resolutions.length > 0 ? (
            <ul className="mt-6 list-none border-t border-border-soft">
              {resolutions.map((r, _i, all) => {
                const body = (
                  <>
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.75rem] tabular-nums text-ink-secondary">
                        {r.number} · {fmtDate(r.date)}
                      </span>
                      <span className="mt-0.5 block">{r.title[locale]}</span>
                    </span>
                    {(locale === "en" && r.hrefEn) || r.href ? <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0" /> : null}
                  </>
                );
                const cls = "flex min-h-14 items-center justify-between gap-4 py-3 text-[0.9375rem] leading-[1.45] text-ink-primary";
                // Na /en główny link prowadzi do wersji angielskiej, jeśli jest.
                const main = (locale === "en" && r.hrefEn) || r.href;
                const other = r.hrefEn && r.href ? (locale === "en" ? r.href : r.hrefEn) : undefined;
                return (
                  <li key={r.number} className="flex items-stretch gap-3 border-b border-border-soft">
                    {main ? (
                      <a href={main} target="_blank" rel="noopener noreferrer" className={`${cls} min-w-0 flex-1 transition-colors hover:text-accent`}>
                        {body}
                        <span className="sr-only"> ({tc("newTab")})</span>
                      </a>
                    ) : (
                      <div className={`${cls} min-w-0 flex-1`}>{body}</div>
                    )}
                    {other ? (
                      <LangBadgeLink
                        href={other}
                        locale={locale}
                        label={`${t(locale === "en" ? "otherLangPl" : "otherLangEn", { number: r.number })} (${tc("newTab")})`}
                      />
                    ) : all.some((x) => x.hrefEn && x.href) ? (
                      // Puste miejsce na plakietkę - strzałki w liście stoją w jednej linii.
                      <span aria-hidden="true" className="min-w-11 shrink-0" />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-border-medium bg-bg-surface p-6 text-[0.9375rem] text-ink-secondary">
              {t("resolutionsEmpty")}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
