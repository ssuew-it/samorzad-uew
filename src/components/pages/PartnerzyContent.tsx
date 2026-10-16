"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  UsersThree,
  Megaphone,
  Handshake,
  ChartLineUp,
  ArrowRight,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { Tilt } from "../Tilt";
import { Marquee } from "../Marquee";
import { MagneticButton } from "../MagneticButton";
import { PartnerEffect } from "../partners/PartnerEffect";
import type { Partner } from "../partners/partnerEffects";
import { partners, type PartnerEntry } from "@/lib/partners";
import { ContactForm, type ContactFormField } from "../ContactForm";

const CONTACT_EMAIL = "zuzanna.bak@samorzad.ue.wroc.pl";

interface Benefit {
  key: string;
  icon: Icon;
}

const benefits: Benefit[] = [
  { key: "reach", icon: UsersThree },
  { key: "events", icon: Megaphone },
  { key: "image", icon: Handshake },
  { key: "talent", icon: ChartLineUp },
];

// Sloty placeholderowe. category/color = przykłady do podmiany na realnych partnerów.
interface Slot {
  key: string;
  category?: Partner["category"];
  color?: string;
}

const slots: Slot[] = [
  { key: "brand" },
  { key: "partner", category: "aviation", color: "#2C4BFF" },
  { key: "sponsor" },
  { key: "coop" },
  { key: "patron" },
  { key: "mecenas" },
];

function PartnerModal({ partner, onClose }: { partner: PartnerEntry; onClose: () => void }) {
  const reduce = useReducedMotion();
  const t = useTranslations("partnerzy");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-modal-title"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 280, damping: 24 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border-soft bg-bg-surface p-8 text-center"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label={t("modalClose")}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-ink-primary"
        >
          <X size={20} weight="regular" aria-hidden="true" />
        </button>

        {/* Animowany efekt partnera */}
        <div className="mx-auto flex h-24 items-center justify-center">
          <PartnerEffect partner={partner} />
        </div>

        {partner.strategic && (
          <p className="mt-6 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.13em] text-accent">
            {t("strategicLabel")}
          </p>
        )}
        <h3
          id="partner-modal-title"
          className={`${partner.strategic ? "mt-2" : "mt-6"} font-display text-[1.5rem] text-ink-primary`}
        >
          {partner.name}
        </h3>
        {/* Prawdziwy partner ma logo; wolne miejsce „Twoja marka" go nie ma. */}
        <p className="mx-auto mt-2 max-w-[34ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">
          {partner.logo ? t("modalRealDesc") : t("modalDesc")}
        </p>
        {partner.href ? (
          <a
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
          >
            {t("modalVisit")}
            <ArrowRight size={20} weight="regular" aria-hidden="true" />
          </a>
        ) : partner.logo ? null : (
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Wsp%C3%B3%C5%82praca%20z%20Samorz%C4%85dem%20UEW`}
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
          >
            {t("modalCta")}
            <ArrowRight size={20} weight="regular" aria-hidden="true" />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

export function PartnerzyContent({ formsReady }: { formsReady: boolean }) {
  const reduce = useReducedMotion();
  const t = useTranslations("partnerzy");
  const tk = useTranslations("kontakt");
  const [selected, setSelected] = useState<PartnerEntry | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const fields: ContactFormField[] = [
    {
      key: "organisation",
      type: "text",
      label: t("labelOrganisation"),
      autoComplete: "organization",
      colSpan: 1,
      validate: (v) => (v.trim().length < 2 ? t("errOrganisation") : undefined),
    },
    {
      key: "contactPerson",
      type: "text",
      label: t("labelContactPerson"),
      autoComplete: "name",
      colSpan: 1,
      validate: (v) => (v.trim().length < 2 ? t("errContactPerson") : undefined),
    },
    {
      key: "email",
      type: "email",
      label: tk("labelEmail"),
      autoComplete: "email",
      colSpan: 2,
      validate: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? tk("errEmail") : undefined),
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

  const open = (partner: PartnerEntry) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setSelected(partner);
  };
  const close = () => {
    setSelected(null);
    triggerRef.current?.focus();
  };

  // Realni partnerzy z src/lib/partners.ts; pusto → teaser „Twoja marka".
  const hasReal = partners.length > 0;
  const wallItems = hasReal
    ? partners.map((p) => ({ key: p.name, label: p.name, logo: p.logo, partner: p }))
    : slots.map((s) => ({
        key: s.key,
        label: t(`slots.${s.key}`),
        logo: undefined as string | undefined,
        partner: { name: t(`slots.${s.key}`), category: s.category, color: s.color } as PartnerEntry,
      }));

  return (
    <>
      {/* Benefits */}
      <section className="section-padding" aria-labelledby="korzysci-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
              {t("benefitsEyebrow")}
            </p>
            <h2
              id="korzysci-heading"
              className="mt-3 max-w-[22ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("benefitsHeading")}
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => {
              const Glyph = benefit.icon;
              return (
                <motion.div
                  key={benefit.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
                  }
                >
                  <Tilt className="h-full" max={6}>
                    <div className="flex h-full flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-glow text-accent">
                        <Glyph size={24} weight="regular" aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink-primary">
                        {t(`benefits.${benefit.key}.title`)}
                      </h3>
                      <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-secondary">
                        {t(`benefits.${benefit.key}.desc`)}
                      </p>
                    </div>
                  </Tilt>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ambient marquee + interactive logo wall */}
      <section
        className="section-padding border-y border-border-subtle bg-bg-surface py-16"
        aria-labelledby="partnerzy-heading"
      >
        <div className="mx-auto mb-10 max-w-[1200px]">
          <h2
            id="partnerzy-heading"
            className="text-center font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary"
          >
            {hasReal ? t("wallHeadingReal") : t("wallHeading")}
          </h2>
          {!hasReal && (
            <p className="mt-2 text-center text-[0.9375rem] text-ink-secondary">
              {t("wallSub")}
            </p>
          )}
        </div>

        <Marquee>
          {wallItems.map((item, i) => (
            <div
              key={`${item.key}-${i}`}
              className={`flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border px-4 text-[0.875rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary ${
                hasReal ? "border-border-subtle bg-white" : "border-dashed border-border-medium"
              }`}
            >
              {item.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.logo} alt={item.label} className="max-h-10 max-w-full object-contain" />
              ) : (
                item.label
              )}
            </div>
          ))}
        </Marquee>

        {/* Interactive wall */}
        <div className="mx-auto mt-8 grid max-w-[1200px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {wallItems.map((item) => (
            <motion.button
              key={item.key}
              type="button"
              onClick={() => open(item.partner)}
              whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className={`flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border px-4 text-[0.8125rem] font-medium uppercase tracking-[0.06em] transition-colors hover:border-accent ${
                item.logo
                  ? // Biały „papier" w obu motywach: część logotypów to JPG na białym tle,
                    // które na ciemnym tle wyglądałyby jak wycięte prostokąty.
                    "border-border-subtle bg-white text-[#3a4252]"
                  : "border-border-subtle bg-bg-base text-ink-tertiary hover:text-accent"
              }`}
            >
              {item.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.logo} alt={item.label} className="max-h-12 max-w-full object-contain" />
              ) : (
                item.label
              )}
              {item.partner.strategic && (
                <span className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] text-[#1f3fd6]">
                  {t("strategicLabel")}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding" aria-labelledby="partner-cta-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="flex flex-col items-start gap-8 rounded-2xl border border-border-subtle bg-bg-surface p-10 md:flex-row md:items-center md:justify-between">
              <div>
                <h2
                  id="partner-cta-heading"
                  className="max-w-[24ch] font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
                >
                  {t("ctaHeading")}
                </h2>
                <p className="mt-3 max-w-[48ch] text-[1rem] leading-[1.6] text-ink-secondary">
                  {t("ctaDesc")}
                </p>
              </div>
              <MagneticButton
                href="/wspolpracuj-z-nami"
                ariaLabel={t("ctaAria")}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-colors hover:bg-accent-dim"
              >
                {t("ctaButton")}
                <ArrowRight size={20} weight="regular" aria-hidden="true" />
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact form */}
      <section className="section-padding pt-0" aria-labelledby="partnerzy-form-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="partnerzy-form-heading"
              className="max-w-[24ch] font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
            >
              {t("formHeading")}
            </h2>
            <p className="prose-constrained mt-3 max-w-[60ch] text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("formLead")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="mt-8 max-w-[720px]">
            <ContactForm
              kind="partnerzy"
              configured={formsReady}
              fields={fields}
              labels={labels}
              contactEmail={CONTACT_EMAIL}
              extraHiddenFields={{ source: "partnerzy" }}
            />
          </ScrollReveal>
        </div>
      </section>

      <AnimatePresence>
        {selected && <PartnerModal partner={selected} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
