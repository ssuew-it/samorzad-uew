"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import {
  Scales,
  ShieldCheck,
  ChatCircleText,
  Compass,
  EnvelopeSimple,
  MapPin,
  ArrowRight,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { Impulse } from "../Impulse";
import { Tilt } from "../Tilt";
import { ContactForm, type ContactFormField } from "../ContactForm";
import { DURATION } from "@/lib/motion";

const CONTACT_EMAIL = "rps@samorzad.ue.wroc.pl";

interface Duty {
  key: string;
  icon: Icon;
}

const duties: Duty[] = [
  { key: "interpret", icon: Scales },
  { key: "injustice", icon: ShieldCheck },
  { key: "consult", icon: ChatCircleText },
  { key: "direct", icon: Compass },
];

const stepKeys = ["check", "describe", "write", "together"];

export function RzecznikContent({ formsReady }: { formsReady: boolean }) {
  const reduce = useReducedMotion();
  const t = useTranslations("rzecznik");
  const tk = useTranslations("kontakt");

  const fields: ContactFormField[] = [
    {
      key: "name",
      type: "text",
      label: tk("labelName"),
      autoComplete: "name",
      colSpan: 1,
      validate: (v) => (v.trim().length < 2 ? tk("errName") : undefined),
    },
    {
      key: "email",
      type: "email",
      label: tk("labelEmail"),
      autoComplete: "email",
      colSpan: 1,
      validate: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? tk("errEmail") : undefined),
    },
    {
      key: "subject",
      type: "text",
      label: tk("labelSubject"),
      colSpan: 2,
      validate: (v) => (v.trim().length < 2 ? tk("errSubject") : undefined),
    },
    {
      key: "message",
      type: "textarea",
      label: tk("labelMessage"),
      colSpan: 2,
      validate: (v) => (v.trim().length < 10 ? tk("errMessage") : undefined),
    },
  ];

  const labels = {
    submitIdle: tk("submitIdle"),
    submitSending: tk("submitSending"),
    successHeading: tk("successHeading"),
    successBody: tk("successBody"),
    successAgain: tk("successAgain"),
    errServer: tk("errServer"),
    rodoIntro: tk("rodoIntro"),
    rodoLink: tk("rodoLink"),
    notConfiguredIntro: tk("formNotConfiguredIntro"),
  };

  return (
    <>
      {/* Intro + contact */}
      <section className="section-padding" aria-labelledby="rzecznik-intro-heading">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[7fr_5fr]">
          <ScrollReveal>
            <h2
              id="rzecznik-intro-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("introHeading")}
            </h2>
            <blockquote className="mt-6 border-l-2 border-accent py-1 pl-6">
              <p className="prose-constrained font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold leading-[1.35] tracking-[-0.01em] text-ink-primary">
                {t("quote")}
              </p>
            </blockquote>
            <p className="prose-constrained mt-6 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("introBody")}
            </p>
          </ScrollReveal>

          {/* Contact card */}
          <ScrollReveal delay={0.1}>
            <Tilt max={5}>
              <div className="rounded-2xl border border-border-subtle bg-bg-surface p-7">
                <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
                  {t("contactEyebrow")}
                </p>
                <p className="mt-2 font-display text-[1.75rem] tracking-[-0.01em] text-ink-primary">
                  {t("contactName")}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href="mailto:rps@samorzad.ue.wroc.pl"
                    className="flex items-center gap-3 py-1 text-[0.9375rem] text-ink-secondary transition-colors hover:text-ink-primary"
                  >
                    <EnvelopeSimple size={20} weight="regular" aria-hidden="true" className="shrink-0 text-accent" />
                    rps@samorzad.ue.wroc.pl
                  </a>
                  <div className="flex items-start gap-3 text-ink-secondary">
                    <MapPin size={20} weight="regular" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                    <p className="text-[0.9375rem] leading-[1.6]">
                      {t("addr1")}
                      <br />
                      {t("addr2")}
                    </p>
                  </div>
                </div>
                <a
                  href="mailto:rps@samorzad.ue.wroc.pl"
                  className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
                >
                  {t("contactButton")}
                  <ArrowRight size={20} weight="regular" aria-hidden="true" />
                </a>
              </div>
            </Tilt>
          </ScrollReveal>
        </div>
      </section>

      {/* Duties */}
      <section className="section-padding pt-0" aria-labelledby="rzecznik-duties-heading">
        <div className="mx-auto max-w-[1200px]">
          <h2
            id="rzecznik-duties-heading"
            className="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
          >
            {t("dutiesHeading")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {duties.map((duty, i) => {
              const Glyph = duty.icon;
              return (
                <motion.div
                  key={duty.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
                  }
                  className="flex items-start gap-4 rounded-xl border border-border-subtle bg-bg-surface p-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-glow text-accent">
                    <Glyph size={24} weight="regular" aria-hidden="true" />
                  </span>
                  <p className="pt-1.5 text-[0.9375rem] leading-[1.55] text-ink-secondary">
                    {t(`duties.${duty.key}`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stepper */}
      <section className="section-padding pt-0" aria-labelledby="rzecznik-steps-heading">
        <div className="mx-auto max-w-[760px]">
          <h2
            id="rzecznik-steps-heading"
            className="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
          >
            {t("stepsHeading")}
          </h2>

          <div className="relative mt-10">
            {/* Filling progress line */}
            <Impulse
              orientation="vertical"
              amount={0.2}
              duration={DURATION.trace}
              className="absolute left-[19px] top-3 bottom-3 w-px bg-accent/40"
            />
            {/* Kroki bez wejściowego przesunięcia: `initial={{ x: 12 }}` trzymało
                je przesunięte o 12 px w prawo, dopóki nie weszły w pole widzenia
                — a to rozpychało stronę o 4 px w poziomie na telefonie. Ruch tej
                sekcji niesie pionowy Impuls; kroki mają po prostu być na miejscu. */}
            <ol className="flex flex-col gap-8">
              {stepKeys.map((key, i) => (
                <li key={key} className="relative flex gap-5">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent bg-bg-base font-display text-[1.0625rem] text-accent tabular-nums">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
                      {t(`steps.${key}.title`)}
                    </h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                      {t(`steps.${key}.desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="section-padding pt-0" aria-labelledby="rzecznik-form-heading">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[5fr_7fr]">
          <ScrollReveal>
            <h2
              id="rzecznik-form-heading"
              className="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
            >
              {t("formHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("formLead")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <ContactForm
              kind="rzecznik"
              configured={formsReady}
              fields={fields}
              labels={labels}
              contactEmail={CONTACT_EMAIL}
              extraNote={t("formNote")}
              extraHiddenFields={{ source: "rzecznik" }}
            />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
