"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  EnvelopeSimple,
  NavigationArrow,
  TiktokLogo,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "../ScrollReveal";
import { MapEmbed } from "../MapEmbed";
import { ContactForm, type ContactFormField } from "../ContactForm";
import styles from "./KontaktContent.module.css";

const CONTACT_EMAIL = "kontakt@samorzad.ue.wroc.pl";
const FORM_ANCHOR = "kontakt-formularz";

/**
 * Rozdzielnik spraw. Adresy i strony wyłącznie te, które już działają w
 * serwisie (Rzecznik: rps@, SKW: skw@, ogólne: kontakt@). Tam, gdzie strona
 * ma własny formularz (partnerzy), kierujemy na stronę zamiast na prywatną
 * skrzynkę członka Zarządu.
 */
const routes: { key: string; href: string; email?: string }[] = [
  { key: "rights", href: "/rzecznik-praw-studenta", email: "rps@samorzad.ue.wroc.pl" },
  { key: "elections", href: "/studencka-komisja-wyborcza", email: "skw@samorzad.ue.wroc.pl" },
  { key: "partners", href: "/partnerzy" },
  { key: "join", href: "/rekrutacja" },
  { key: "support", href: "/pomoc-psychologiczna" },
  { key: "other", href: `#${FORM_ANCHOR}`, email: CONTACT_EMAIL },
];

const socials = [
  { icon: TiktokLogo, label: "TikTok", href: "https://www.tiktok.com/@samorzaduew" },
  { icon: FacebookLogo, label: "Facebook", href: "https://www.facebook.com/samorzad.ue" },
  { icon: InstagramLogo, label: "Instagram", href: "https://www.instagram.com/samorzad.ue" },
  {
    icon: LinkedinLogo,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/samorząd-studentów-uniwersytetu-ekonomicznego-we-wrocławiu/",
  },
];

const OFFICE_QUERY = "ul. Kamienna 44, 53-307 Wrocław";
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_QUERY)}&output=embed`;
const ROUTE_HREF = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(OFFICE_QUERY)}`;

export function KontaktContent({ formsReady }: { formsReady: boolean }) {
  const t = useTranslations("kontakt");
  const tc = useTranslations("common");

  const fields: ContactFormField[] = [
    {
      key: "name",
      type: "text",
      label: t("labelName"),
      autoComplete: "name",
      colSpan: 1,
      validate: (v) => (v.trim().length < 2 ? t("errName") : undefined),
    },
    {
      key: "email",
      type: "email",
      label: t("labelEmail"),
      autoComplete: "email",
      colSpan: 1,
      validate: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t("errEmail") : undefined),
    },
    {
      key: "subject",
      type: "text",
      label: t("labelSubject"),
      colSpan: 2,
      validate: (v) => (v.trim().length < 2 ? t("errSubject") : undefined),
    },
    {
      key: "message",
      type: "textarea",
      label: t("labelMessage"),
      colSpan: 2,
      validate: (v) => (v.trim().length < 10 ? t("errMessage") : undefined),
    },
  ];

  const labels = {
    submitIdle: t("submitIdle"),
    submitSending: t("submitSending"),
    successHeading: t("successHeading"),
    successBody: t("successBody"),
    successAgain: t("successAgain"),
    errServer: t("errServer"),
    rodoIntro: t("rodoIntro"),
    rodoLink: t("rodoLink"),
    notConfiguredIntro: t("formNotConfiguredIntro"),
  };

  return (
    <>
      {/* Do kogo z czym */}
      <section className="section-padding" aria-labelledby="kontakt-routes-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
            <h2
              id="kontakt-routes-heading"
              className="text-balance font-display text-[clamp(2rem,4.2vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink-primary"
            >
              {t("routesHeading")}
            </h2>
            <p className="max-w-[52ch] text-pretty text-[1.0625rem] leading-[1.7] text-ink-secondary">
              {t("routesLead")}
            </p>
          </div>

          <div className="mt-10 hidden grid-cols-[minmax(0,1fr)_clamp(56px,8vw,120px)_minmax(0,1fr)] gap-x-6 px-3 pb-3 font-mono text-[0.75rem] text-ink-secondary md:grid min-[1100px]:grid-cols-[minmax(0,1fr)_clamp(56px,8vw,120px)_minmax(0,1fr)_240px]" aria-hidden="true">
            <span>{t("routesTopicCol")}</span>
            <span />
            <span>{t("routesDestCol")}</span>
            <span />
          </div>
          <ul className={`${styles.board} mt-6 list-none md:mt-0`}>
            {routes.map((route, i) => {
              const who = t(`routes.${route.key}.who`);
              const isAnchor = route.href.startsWith("#");
              const whoInner = (
                <>
                  {who}
                  <ArrowRight size={16} weight="bold" aria-hidden="true" className={styles.arrow} />
                </>
              );
              return (
                <li key={route.key} className={styles.row} style={{ "--i": i } as CSSProperties}>
                  <p className={styles.topic}>{t(`routes.${route.key}.topic`)}</p>
                  <span className={styles.wire} aria-hidden="true">
                    <span className={`${styles.node} ${styles.nodeStart}`} />
                    <span className={styles.pulse} />
                    <span className={`${styles.node} ${styles.nodeEnd}`} />
                  </span>
                  <div className={styles.dest}>
                    {isAnchor ? (
                      <a href={route.href} className={styles.who}>
                        {whoInner}
                      </a>
                    ) : (
                      <Link href={route.href} className={styles.who}>
                        {whoInner}
                      </Link>
                    )}
                    <p className={styles.note}>{t(`routes.${route.key}.note`)}</p>
                  </div>
                  {route.email ? (
                    <a
                      href={`mailto:${route.email}`}
                      className={styles.mail}
                      aria-label={t("routeMailLabel", { who: `${who}, ${route.email}` })}
                    >
                      <EnvelopeSimple size={16} weight="regular" aria-hidden="true" />
                      {route.email}
                    </a>
                  ) : (
                    <span className={styles.mailSpacer} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Wszystko inne: formularz */}
      <section
        id={FORM_ANCHOR}
        className="section-padding scroll-mt-24 pt-0"
        aria-labelledby="kontakt-form-heading"
      >
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[5fr_7fr]">
          <ScrollReveal>
            <h2
              id="kontakt-form-heading"
              className="text-balance font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("detailsHeading")}
            </h2>
            <p className="prose-constrained mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">
              {t("detailsLead")}
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-8 inline-flex min-h-11 items-center gap-3 text-[0.9375rem] font-medium text-ink-primary transition-colors hover:text-accent"
            >
              <EnvelopeSimple size={20} weight="regular" aria-hidden="true" className="shrink-0 text-accent" />
              {CONTACT_EMAIL}
            </a>

            <ul className="mt-4 flex list-none gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} (${tc("newTab")})`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
                  >
                    <s.icon size={22} weight="regular" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <ContactForm
              kind="kontakt"
              configured={formsReady}
              fields={fields}
              labels={labels}
              contactEmail={CONTACT_EMAIL}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Gdzie nas znajdziesz */}
      <section className="section-padding pt-0" aria-labelledby="kontakt-place-heading">
        <ScrollReveal className="mx-auto max-w-[1200px]">
          <div className={styles.place}>
            <div className={styles.placeInfo}>
              <h2
                id="kontakt-place-heading"
                className="font-display text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
              >
                {t("placeHeading")}
              </h2>
              <address className="not-italic">
                <p className="text-[1.0625rem] font-semibold text-ink-primary">{t("addr1")}</p>
                <p className="text-[0.9375rem] text-ink-secondary">{t("addr3")}</p>
              </address>
              <dl className={styles.facts}>
                <div className={styles.fact}>
                  <dt className={styles.factLabel}>{t("placeBuilding")}</dt>
                  <dd className={styles.factValue}>L</dd>
                </div>
                <div className={styles.fact}>
                  <dt className={styles.factLabel}>{t("placeRoom")}</dt>
                  <dd className={styles.factValue}>110</dd>
                </div>
              </dl>
              <a
                href={ROUTE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.routeButton} mt-auto`}
              >
                <NavigationArrow size={18} weight="bold" aria-hidden="true" />
                {t("routeButton")}
                <span className="sr-only"> ({tc("newTab")})</span>
              </a>
            </div>
            <MapEmbed
              src={MAP_SRC}
              title={t("mapTitle")}
              address={`${t("addr1")}, ${t("addr2")}`}
              loadLabel={t("mapLoad")}
              consentNote={t("mapConsent")}
              className="h-[340px] lg:h-full lg:min-h-[420px]"
            />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
