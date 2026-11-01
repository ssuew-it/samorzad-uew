"use client";

import { useTranslations } from "next-intl";
import { UsersThree, Megaphone, ArrowSquareOut, FilePdf, type Icon } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "../ScrollReveal";

interface Body {
  key: "fue" | "psrp";
  icon: Icon;
  href?: string;
}

const blocks: Body[] = [
  { key: "fue", icon: UsersThree },
  { key: "psrp", icon: Megaphone, href: "https://psrp.org.pl" },
];

/**
 * Zjazd FUE stoi tutaj, a nie na liście projektów (decyzja z 1.11.2026):
 * uczestniczą w nim delegaci samorządów, nie każdy student, a gospodarz
 * zmienia się między miastami. One-pager przekazał Samorząd.
 */
const ZJAZD_PDF = "/dokumenty/projekty/zjazd-fue-one-pager.pdf";

export function FuePsrpContent() {
  const t = useTranslations("fuePsrp");
  const tc = useTranslations("common");

  return (
    <>
      <section className="section-padding" aria-label={t("metaTitle")}>
        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-2">
          {blocks.map((b, i) => {
            const Glyph = b.icon;
            return (
              <ScrollReveal key={b.key} delay={i * 0.08}>
                <article className="flex h-full flex-col rounded-2xl border border-border-subtle bg-bg-surface p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-glow text-accent">
                    <Glyph size={26} weight="regular" aria-hidden="true" />
                  </span>
                  <h2 className="mt-6 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">
                    {t(`${b.key}Heading`)}
                  </h2>
                  <p className="mt-3 flex-1 text-[1rem] leading-[1.7] text-ink-secondary">
                    {t(`${b.key}Body`)}
                  </p>
                  {b.href && (
                    <a
                      href={b.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-fit items-center gap-2 py-1 text-[0.9375rem] font-medium text-accent transition-colors hover:text-accent-dim"
                    >
                      {t(`${b.key}Link`)}
                      <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
                      <span className="sr-only"> ({tc("newTab")})</span>
                    </a>
                  )}
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="section-padding pt-0" aria-labelledby="zjazd-fue-heading">
        <ScrollReveal className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 border-t border-border-medium pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
            <h2
              id="zjazd-fue-heading"
              className="text-balance font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("zjazdHeading")}
            </h2>
            <div>
              <p className="text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("zjazdBody")}</p>
              <p className="mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("zjazdTeam")}</p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                <a
                  href={ZJAZD_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-accent transition-colors hover:text-accent-dim"
                >
                  <FilePdf size={20} weight="regular" aria-hidden="true" />
                  {t("zjazdPdf")}
                  <span className="sr-only"> ({tc("newTab")})</span>
                </a>
                <Link
                  href="/rekrutacja"
                  className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-ink-primary underline underline-offset-4 transition-colors hover:text-accent"
                >
                  {t("zjazdRecruitment")}
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
