"use client";

import { useTranslations } from "next-intl";
import { UsersThree, Megaphone, ArrowSquareOut, type Icon } from "@phosphor-icons/react";
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

export function FuePsrpContent() {
  const t = useTranslations("fuePsrp");

  return (
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
                  </a>
                )}
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
