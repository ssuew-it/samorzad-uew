"use client";

import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  Scales,
  ShieldCheck,
  Compass,
  Handshake,
  EnvelopeSimple,
  MapPin,
  ArrowDown,
  ArrowUpRight,
  LinkSimple,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { isRightKey, rightRef } from "@/lib/prawa-studenta";
import { ScrollReveal } from "../ScrollReveal";
import { ContactForm, type ContactFormField } from "../ContactForm";
import { ScrollSteps } from "../ScrollSteps";
import styles from "./Rzecznik.module.css";

const CONTACT_EMAIL = "rps@samorzad.ue.wroc.pl";

const DUTIES: { key: string; icon: Icon }[] = [
  { key: "interpret", icon: Scales },
  { key: "injustice", icon: ShieldCheck },
  { key: "direct", icon: Compass },
  { key: "represent", icon: Handshake },
];

const CHECK_LINKS = [
  { key: "prawa", href: "/prawa-studenta" },
  { key: "infopacki", href: "/infopacki" },
  { key: "prawo", href: "/prawo-dla-studenta" },
] as const;

const PATH = ["check", "describe", "write", "act"] as const;

/**
 * Szklana waga w hero, z tej samej serii co paragraf (Prawa) i monety
 * (Stypendia). Render Higgsfield, obiekt-symbol bez ludzi; jasna i ciemna
 * wersja pod motyw. Wyrównuje się razem z przewijaniem (czyste CSS).
 */
export function RzecznikHeroArt() {
  return (
    <div className={styles.art} aria-hidden="true">
      <Image
        src="/photos/rzecznik/waga-jasna.webp"
        alt=""
        width={900}
        height={1125}
        priority
        sizes="(max-width: 767px) 80vw, 420px"
        className={`${styles.artImg} ${styles.artLight}`}
      />
      <Image
        src="/photos/rzecznik/waga-ciemna.webp"
        alt=""
        width={900}
        height={1125}
        sizes="(max-width: 767px) 80vw, 420px"
        className={`${styles.artImg} ${styles.artDark}`}
      />
    </div>
  );
}

/** Parametr `?sprawa=` z adresu; na serwerze i przy hydratacji pusty. */
function useCaseParam(): string | null {
  const search = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => window.location.search,
    () => "",
  );
  return new URLSearchParams(search).get("sprawa");
}

export function RzecznikContent({ formsReady }: { formsReady: boolean }) {
  const t = useTranslations("rzecznik");
  const tk = useTranslations("kontakt");
  const tp = useTranslations("prawaStudenta");

  // Temat z Praw studenta: przyjmujemy wyłącznie znany klucz, a treść
  // składamy sami z tłumaczeń — nic z adresu nie trafia do formularza wprost.
  const caseParam = useCaseParam();
  const topic = useMemo(() => {
    if (!isRightKey(caseParam)) return null;
    const vars = { ref: rightRef(caseParam), title: tp(`rights.${caseParam}.title`) };
    return { note: t("topicFrom", vars), subject: t("topicSubject", vars) };
  }, [caseParam, t, tp]);
  const prefill = useMemo(() => (topic ? { subject: topic.subject } : undefined), [topic]);

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
      {/* Wstęp + jedyna karta kontaktu. Jej przycisk prowadzi do formularza
          na dole, więc kontakt jest w jednym miejscu, a nie w trzech. */}
      <section className="section-padding" aria-labelledby="rzecznik-intro-heading">
        <div className={`mx-auto max-w-[1200px] ${styles.introGrid}`}>
          <ScrollReveal>
            <h2
              id="rzecznik-intro-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary [text-wrap:balance]"
            >
              {t("introHeading")}
            </h2>
            <blockquote className={styles.quote}>
              <p className={styles.quoteText}>{t("quote")}</p>
            </blockquote>
            <p className="mt-6 max-w-[60ch] text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("introBody")}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>{t("contactLabel")}</p>
              <p className={styles.cardName}>{t("contactName")}</p>
              <ul className={styles.cardRows}>
                <li className={styles.cardRow}>
                  <EnvelopeSimple size={18} weight="regular" aria-hidden="true" />
                  <a href={`mailto:${CONTACT_EMAIL}`} className={styles.cardMail}>
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li className={styles.cardRow}>
                  <MapPin size={18} weight="regular" aria-hidden="true" />
                  <span>
                    {t("addr1")}
                    <br />
                    {t("addr2")}
                  </span>
                </li>
              </ul>
              <a href="#napisz" className={styles.cardCta}>
                {t("contactButton")}
                <ArrowDown size={18} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Jedna oś zamiast kart „czym się zajmuję” i osobnego steppera:
          od sprawdzenia, przez fakty i wiadomość, po to, co zrobi Rzecznik. */}
      <section className={`section-padding ${styles.path}`} aria-labelledby="rzecznik-path-heading">
        <div className="mx-auto max-w-[860px]">
          <h2
            id="rzecznik-path-heading"
            className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("pathHeading")}
          </h2>
          <p className="mt-3 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("pathLead")}</p>

          <ScrollSteps
            steps={PATH.map((step) => ({
              key: step,
              title: t(`path.${step}.title`),
              desc: t(`path.${step}.desc`),
              extra:
                step === "check" ? (
                  <div className={styles.stepLinks}>
                    {CHECK_LINKS.map((l) => (
                      <Link key={l.key} href={l.href} className={styles.chip}>
                        {t(`links.${l.key}`)}
                        <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ) : step === "write" ? (
                  <div className={styles.stepLinks}>
                    <a href="#napisz" className={styles.chip}>
                      {t("path.write.link")}
                      <ArrowDown size={14} weight="bold" aria-hidden="true" />
                    </a>
                  </div>
                ) : step === "act" ? (
                  <ul className={styles.duties}>
                    {DUTIES.map(({ key, icon: Glyph }) => (
                      <li key={key} className={styles.duty}>
                        <Glyph size={18} weight="regular" aria-hidden="true" />
                        {t(`duties.${key}`)}
                      </li>
                    ))}
                  </ul>
                ) : undefined,
            }))}
          />
        </div>
      </section>

      {/* Formularz: finał ścieżki. */}
      <section
        id="napisz"
        className="section-padding scroll-mt-24 pt-0"
        aria-labelledby="rzecznik-form-heading"
      >
        <div className={`mx-auto max-w-[1200px] ${styles.formGrid}`}>
          <ScrollReveal>
            <h2
              id="rzecznik-form-heading"
              className="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
            >
              {t("formHeading")}
            </h2>
            <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("formLead")}</p>
            {topic && (
              <p className={styles.topic} role="status">
                <LinkSimple size={18} weight="bold" aria-hidden="true" />
                {topic.note}
              </p>
            )}
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
              prefill={prefill}
            />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
