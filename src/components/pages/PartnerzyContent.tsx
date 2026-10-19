"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { PartnershipPicker } from "../partners/PartnershipPicker";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { partners, type PartnerEntry } from "@/lib/partners";
import { partnershipContact } from "@/lib/partnership-contact";
import { ScrollReveal } from "../ScrollReveal";
import { ContactForm, type ContactFormField } from "../ContactForm";
import styles from "../partners/Partners.module.css";

const CONTACT_EMAIL = partnershipContact.email;
const benefits = ["reach", "events", "image", "talent"] as const;
const pageCopy = {
  pl: { topicLabel: "Wybrany kierunek rozmowy", changeTopic: "Zmień", visit: "Poznaj partnera", nextBrand: "Miejsce na kolejny wspólny pomysł.", join: "Porozmawiajmy o Twojej marce", contact: "Dobry początek? Rozmowa.", contactLead: "Nie potrzebujesz gotowej prezentacji. Opisz, co masz na myśli — to wystarczy, żeby zacząć.", steps: [["Twój pomysł", "Marka, cel i kilka słów o planach."], ["Wspólny kierunek", "Rozmowa o możliwościach i dopasowaniu do studentów."], ["Konkretny plan", "Uzgodnienie zakresu, terminów i kolejnych kroków."]], direct: "Wolisz napisać bezpośrednio?", form: "Opowiedz nam o pomyśle", emailDraft: "Otwórz e-mail z wybranym tematem", emailNote: "Przeniesiemy wybrany kierunek współpracy. Własną treść dopisz w programie pocztowym.", emailSubject: "Współpraca z Samorządem Studentów UEW" },
  en: { topicLabel: "Your chosen direction", changeTopic: "Change", visit: "Meet the partner", nextBrand: "Room for our next shared idea.", join: "Let’s talk about your brand", contact: "A good start? A conversation.", contactLead: "You don’t need a polished presentation. Tell us what you have in mind — that’s enough to get started.", steps: [["Your idea", "Your brand, your goal and a few words about your plans."], ["A shared direction", "A conversation about possibilities and what works for students."], ["A concrete plan", "Agreeing on scope, timing and next steps."]], direct: "Prefer to email us directly?", form: "Tell us about your idea", emailDraft: "Open email with your chosen topic", emailNote: "We’ll include your selected partnership direction. Add your own message in your email app.", emailSubject: "Partnership with the UEW Student Government" },
};

function PartnerLogo({ partner }: { partner: PartnerEntry }) {
  const content = partner.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={partner.logo} alt={partner.name} loading="lazy" className="max-h-16 max-w-full object-contain" />
  ) : <span>{partner.name}</span>;
  const className = `${styles.logoCard}${partner.name === "BNY" ? ` ${styles.logoCardPrimary}` : ""}`;
  return partner.href ? (
    <a href={partner.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
      <span className={styles.logoCaption} aria-hidden="true">{partner.name}<ArrowUpRight size={14} className="shrink-0" /></span>
    </a>
  ) : <div className={className}>{content}</div>;
}

export function PartnerzyContent({ formsReady }: { formsReady: boolean }) {
  const [prefill, setPrefill] = useState<{ message: string }>();
  const [chosenTopic, setChosenTopic] = useState("");
  const c = pageCopy[useLocale() === "en" ? "en" : "pl"];
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
      <section id="marki" className="section-padding scroll-mt-40" aria-labelledby="partnerzy-heading">
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
            <ul className={styles.strategicList}>
              {strategic.map((partner) => <li key={partner.name} className={styles.strategicFeature}>
                <div className={styles.strategicIntro}>
                  <span>{t("strategicLabel")}</span>
                  <h3>{partner.name}</h3>
                  {partner.href && <a href={partner.href} target="_blank" rel="noopener noreferrer">{c.visit}<ArrowUpRight size={20} aria-hidden="true" /><span className="sr-only"> — {partner.name}</span></a>}
                  <span className={styles.featureLines} aria-hidden="true" />
                </div>
                <div className={styles.strategicLogo}>
                  {partner.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={partner.logo} alt={partner.name} loading="lazy" />
                  ) : <span>{partner.name}</span>}
                </div>
              </li>)}
            </ul>
          )}
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {other.map((partner) => <li key={partner.name}><PartnerLogo partner={partner} /></li>)}
            <li><a href="#wspolpraca" className={styles.joinTile}><span aria-hidden="true">+</span><strong>{c.nextBrand}</strong><span>{c.join}<ArrowUpRight size={16} aria-hidden="true" /></span></a></li>
          </ul>
        </div>
      </section>

      <section id="korzysci" className="section-padding scroll-mt-40 border-t border-border-subtle" aria-labelledby="korzysci-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2 id="korzysci-heading" className="max-w-[24ch] font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">{t("benefitsHeading")}</h2>
          </ScrollReveal>
          <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((key, index) => (
              <div key={key} className={styles.benefit}>
                <dt className="text-lg font-semibold text-ink-primary"><span className={styles.benefitNumber} aria-hidden="true">0{index + 1}</span>{t(`benefits.${key}.title`)}</dt>
                <dd className="mt-2 max-w-[55ch] text-base leading-relaxed text-ink-secondary">{t(`benefits.${key}.desc`)}</dd>
              </div>
            ))}
          </dl>
          <Link href="/wspolpracuj-z-nami" className="mt-8 inline-flex min-h-11 items-center gap-2 text-base font-medium text-accent underline underline-offset-4">
            {t("offerLink")}<ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <PartnershipPicker onChoose={(message, topic) => { setPrefill({ message }); setChosenTopic(topic); }} />

      <section id="kontakt-partnerzy" className="section-padding scroll-mt-40 border-t border-border-subtle bg-bg-surface" aria-labelledby="partnerzy-form-heading">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className={styles.contactIntro}>
            <p className={styles.eyebrow}>{t("formHeading")}</p>
            <h2 id="partnerzy-form-heading">{c.contact}</h2>
            <p className={styles.contactLead}>{c.contactLead}</p>
            <ol className={styles.contactSteps}>{c.steps.map(([title, body], i) => <li key={title}><span aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
            <p className={styles.directLabel}>{c.direct}</p>
            <div className={styles.contactPerson}>
              <div className={styles.contactPortrait}>
                {partnershipContact.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partnershipContact.photo} alt="" width={96} height={120} loading="lazy" />
                ) : <span aria-hidden="true">ZB</span>}
              </div>
              <div className="min-w-0"><p className="font-semibold">{partnershipContact.name}</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.directEmail}>{CONTACT_EMAIL}<ArrowUpRight size={18} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
          <div className={styles.formPanel}>
            <h3>{c.form}</h3>
            {chosenTopic && <div className={styles.chosenTopic}><p><span>{c.topicLabel}</span><strong>{chosenTopic}</strong></p><a href="#wspolpraca">{c.changeTopic}<ArrowUpRight size={16} aria-hidden="true" /></a></div>}
            {!formsReady && prefill?.message && <div className={styles.emailDraft}>
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(c.emailSubject)}&body=${encodeURIComponent(prefill.message)}`}>{c.emailDraft}<ArrowUpRight size={20} aria-hidden="true" /></a>
              <p>{c.emailNote}</p>
            </div>}
            <ContactForm kind="partnerzy" configured={formsReady} fields={fields} labels={labels} contactEmail={CONTACT_EMAIL} extraHiddenFields={{ source: "partnerzy" }} prefill={prefill} replaceUneditedPrefill />
          </div>
        </div>
      </section>
    </>
  );
}
