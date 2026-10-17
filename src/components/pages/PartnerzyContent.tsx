"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { partners, type PartnerEntry } from "@/lib/partners";
import { ScrollReveal } from "../ScrollReveal";
import { ContactForm, type ContactFormField } from "../ContactForm";

const CONTACT_EMAIL = "zuzanna.bak@samorzad.ue.wroc.pl";
const benefits = ["reach", "events", "image", "talent"] as const;

function PartnerLogo({ partner }: { partner: PartnerEntry }) {
  const content = partner.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={partner.logo} alt={partner.name} loading="lazy" className="max-h-16 max-w-full object-contain" />
  ) : <span>{partner.name}</span>;
  const className = "flex h-32 items-center justify-center rounded-lg border border-border-subtle bg-white px-6 text-center text-sm text-[#3a4252]";
  return partner.href ? (
    <a href={partner.href} target="_blank" rel="noopener noreferrer" className={`${className} transition-colors hover:border-accent`}>
      {content}
    </a>
  ) : <div className={className}>{content}</div>;
}

export function PartnerzyContent({ formsReady }: { formsReady: boolean }) {
  const t = useTranslations("partnerzy");
  const tk = useTranslations("kontakt");
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
      key: "name",
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

  const strategic = partners.filter((partner) => partner.strategic);
  const other = partners.filter((partner) => !partner.strategic);

  return (
    <>
      <section className="section-padding" aria-labelledby="partnerzy-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2 id="partnerzy-heading" className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
              {partners.length ? t("wallHeadingReal") : t("wallHeading")}
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-ink-secondary">
              {partners.length ? t("modalRealDesc") : t("wallSub")}
            </p>
          </ScrollReveal>
          {strategic.length > 0 && (
            <div className="mt-10 border-y border-border-soft py-8 sm:flex sm:items-center sm:gap-12">
              <h3 className="mb-5 text-lg font-medium text-ink-primary sm:mb-0">{t("strategicLabel")}</h3>
              <ul className="grid flex-1 gap-4 sm:grid-cols-2">
                {strategic.map((partner) => <li key={partner.name}><PartnerLogo partner={partner} /></li>)}
              </ul>
            </div>
          )}
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {other.map((partner) => <li key={partner.name}><PartnerLogo partner={partner} /></li>)}
          </ul>
        </div>
      </section>

      <section className="section-padding border-t border-border-subtle" aria-labelledby="korzysci-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2 id="korzysci-heading" className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">{t("benefitsHeading")}</h2>
          </ScrollReveal>
          <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {benefits.map((key) => (
              <div key={key} className="border-t border-border-soft pt-5">
                <dt className="text-lg font-semibold text-ink-primary">{t(`benefits.${key}.title`)}</dt>
                <dd className="mt-2 max-w-[55ch] text-base leading-relaxed text-ink-secondary">{t(`benefits.${key}.desc`)}</dd>
              </div>
            ))}
          </dl>
          <Link href="/wspolpracuj-z-nami" className="mt-8 inline-flex min-h-11 items-center gap-2 text-base font-medium text-accent underline underline-offset-4">
            {t("offerLink")}<ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="kontakt" className="section-padding border-t border-border-subtle" aria-labelledby="partnerzy-form-heading">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <ScrollReveal>
            <h2 id="partnerzy-form-heading" className="max-w-[24ch] font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">{t("formHeading")}</h2>
            <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-ink-secondary">{t("formLead")}</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-5 inline-flex min-h-11 items-center break-all text-accent underline underline-offset-4">{CONTACT_EMAIL}</a>
          </ScrollReveal>
          <ContactForm kind="partnerzy" configured={formsReady} fields={fields} labels={labels} contactEmail={CONTACT_EMAIL} extraHiddenFields={{ source: "partnerzy" }} />
        </div>
      </section>
    </>
  );
}
