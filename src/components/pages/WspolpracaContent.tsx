"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  Confetti,
  Megaphone,
  Target,
  EnvelopeSimple,
  ArrowRight,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { Tilt } from "../Tilt";
import { MagneticButton } from "../MagneticButton";
import { partnershipContact } from "@/lib/partnership-contact";
import { useLocale } from "next-intl";

interface Kind {
  key: string;
  icon: Icon;
}

const kinds: Kind[] = [
  { key: "events", icon: Confetti },
  { key: "social", icon: Megaphone },
  { key: "campaigns", icon: Target },
];

export function WspolpracaContent() {
  const locale = useLocale();
  const reduce = useReducedMotion();
  const t = useTranslations("wspolpracuj");

  return (
    <>
      {/* Offer */}
      <section className="section-padding" aria-labelledby="oferta-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="oferta-heading"
              className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("offerHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("offerLead")}
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {kinds.map((kind, i) => {
              const Glyph = kind.icon;
              return (
                <motion.div
                  key={kind.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }
                  }
                >
                  <Tilt className="h-full" max={6}>
                    <div className="flex h-full flex-col rounded-xl border border-border-subtle bg-bg-surface p-7">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-glow text-accent">
                        <Glyph size={26} weight="regular" aria-hidden="true" />
                      </span>
                      <h3 className="mt-6 text-[1.25rem] font-semibold tracking-[-0.01em] text-ink-primary">
                        {t(`kinds.${kind.key}.title`)}
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                        {t(`kinds.${kind.key}.desc`)}
                      </p>
                    </div>
                  </Tilt>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact person */}
      <section
        className="section-padding border-t border-border-subtle pt-16"
        aria-labelledby="kontakt-osoba-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="grid items-center gap-10 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:p-10 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
                  {t("contactEyebrow")}
                </p>
                <h2
                  id="kontakt-osoba-heading"
                  className="mt-2 font-display text-[clamp(1.75rem,3vw,2.5rem)] tracking-[-0.01em] text-ink-primary"
                >
                  {partnershipContact.name}
                </h2>
                <p className="mt-1 text-[0.9375rem] text-ink-secondary">
                  {t("contactRole")}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-8">
                  <a
                    href={`mailto:${partnershipContact.email}`}
                    className="flex min-w-0 items-center gap-3 break-all py-1 text-[0.9375rem] text-ink-secondary transition-colors hover:text-ink-primary"
                  >
                    <EnvelopeSimple size={20} weight="regular" aria-hidden="true" className="shrink-0 text-accent" />
                    {partnershipContact.email}
                  </a>
                </div>
              </div>

              <MagneticButton
                href={`/${locale}/partnerzy#kontakt-partnerzy`}
                ariaLabel={t("formAria")}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-colors hover:bg-accent-dim"
              >
                {t("formButton")}
                <ArrowRight size={20} weight="regular" aria-hidden="true" />
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
