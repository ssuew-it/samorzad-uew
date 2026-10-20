"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  ArrowUpRight,
  Buildings,
  ChatCircleDots,
  Check,
  Copy,
  EnvelopeSimple,
  FilePdf,
  Heart,
  MapPin,
  Phone,
  type Icon,
} from "@phosphor-icons/react";
import { UEW_SUPPORT } from "@/lib/pomoc-uew";
import { Breadcrumbs } from "../Breadcrumbs";
import styles from "./PomocPsychologiczna.module.css";

interface Item {
  key: string;
  icon: Icon;
}

const contains: Item[] = [
  { key: "places", icon: Buildings },
  { key: "institutions", icon: MapPin },
  { key: "contacts", icon: ChatCircleDots },
];

const helplines = [
  { number: "116 123", tel: "116123", descKey: "adults", metaKey: "adultsMeta" },
  { number: "800 70 2222", tel: "800702222", descKey: "crisis", metaKey: "crisisMeta" },
  { number: "116 111", tel: "116111", descKey: "youth", metaKey: "youthMeta" },
];

const INFOPACK =
  "https://drive.google.com/file/d/1qn2UQmuCBG1VYPP46opdvh6vMqQnBTAW/view?usp=sharing";
const CHAT = "https://116sos.pl/";
const HEALTH_MINISTRY =
  "https://www.gov.pl/web/zdrowie/gdzie-uzyskac-pomoc-psychologiczna-i-psychiatryczna";

export function PomocPsychologicznaContent() {
  const t = useTranslations("pomoc");
  const tc = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function copyOpeningSentence() {
    const sentence = t("openingSentence");

    try {
      await navigator.clipboard.writeText(sentence);
      setCopied(true);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = sentence;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      const didCopy = document.execCommand("copy");
      fallback.remove();
      setCopied(didCopy);
    }
  }

  return (
    <>
      <section
        className="relative overflow-hidden border-b border-border-subtle bg-bg-elevated"
        aria-labelledby="pomoc-title"
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block" aria-hidden="true">
          <span className="psychology-calm-ring absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20" />
          <span className="psychology-calm-ring psychology-calm-ring-delayed absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/15" />
          <span className="psychology-calm-ring psychology-calm-ring-late absolute left-1/2 top-1/2 h-[510px] w-[510px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10" />
          <Heart
            size={70}
            weight="duotone"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent/20"
          />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pb-14 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className="psychology-enter psychology-enter-1">
            <Breadcrumbs
              items={[
                { label: tc("home"), href: "/" },
                { label: t("crumbStudent"), href: "/dla-studenta" },
                { label: t("heroTitle") },
              ]}
            />
          </div>

          <div className="mt-9 grid items-end gap-10 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:gap-16">
            <div>
              <h1
                id="pomoc-title"
                className="psychology-enter psychology-enter-3 max-w-[14ch] text-balance font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-ink-primary"
              >
                {t("heroTitle")}
              </h1>
              <p className="psychology-enter psychology-enter-4 mt-6 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-ink-secondary sm:text-[1.125rem]">
                {t("heroLead")}
              </p>
              <div className="psychology-enter psychology-enter-5 mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#pomoc-teraz"
                  className="psychology-motion-control group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg-base transition-[background-color,transform] duration-150 hover:bg-accent-dim active:scale-[0.98]"
                >
                  {t("needHelpNow")}
                  <ArrowRight
                    size={19}
                    weight="bold"
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </a>
                <a
                  href="#formy-wsparcia"
                  className="psychology-motion-control inline-flex min-h-12 items-center justify-center rounded-lg border border-border-strong bg-bg-surface px-6 py-3 text-center font-semibold text-ink-primary transition-[background-color,transform] duration-150 hover:bg-bg-subtle active:scale-[0.98]"
                >
                  {t("browseSupport")}
                </a>
              </div>
            </div>

            <aside className="psychology-emergency-enter relative overflow-hidden rounded-2xl bg-[var(--alarm-bg)] p-6 text-white sm:p-8" aria-labelledby="emergency-heading">
              <span className="psychology-emergency-signal absolute inset-x-0 top-0 h-px origin-left bg-white/60" aria-hidden="true" />
              <p className="text-[0.875rem] font-semibold text-white/80">{t("emergencyLabel")}</p>
              <h2 id="emergency-heading" className="mt-3 text-balance font-display text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.02em]">
                {t("emergencyHeading")}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-[1.65] text-white/85">
                {t("emergencyBody")}
              </p>
              <a
                href="tel:112"
                className="psychology-emergency-call psychology-motion-control mt-6 inline-flex min-h-12 w-full items-center justify-between rounded-lg bg-white px-5 py-3 font-semibold text-[var(--alarm-ink)] transition-[background-color,transform] duration-150 hover:bg-white/90 active:scale-[0.985]"
                aria-label={t("callEmergencyAria")}
              >
                <span className="flex items-center gap-3">
                  <Phone size={20} weight="fill" aria-hidden="true" />
                  {t("callEmergency")}
                </span>
                <span className="font-display text-[1.5rem] tabular-nums">112</span>
              </a>
            </aside>
          </div>
        </div>
      </section>

      <section
        id="pomoc-teraz"
        className="section-padding scroll-mt-24"
        aria-labelledby="telefony-heading"
      >
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
          <div>
            <h2
              id="telefony-heading"
              className="text-balance font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink-primary"
            >
              {t("helpHeading")}
            </h2>
            <p className="mt-5 max-w-[42ch] text-pretty text-[1rem] leading-[1.7] text-ink-secondary">
              {t("helpLead")}
            </p>
            <a
              href={CHAT}
              target="_blank"
              rel="noopener noreferrer"
              className="psychology-motion-control group mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg border border-border-strong px-5 py-3 font-semibold text-ink-primary transition-[background-color,transform] duration-150 hover:bg-bg-elevated active:scale-[0.98]"
            >
              <ChatCircleDots size={21} weight="fill" className="text-accent transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105" aria-hidden="true" />
              {t("openChat")}
            </a>
            <p className="mt-3 text-[0.8125rem] leading-[1.55] text-ink-tertiary">
              {t("chatNote")}
            </p>
          </div>

          <div>
            <div className="border-y border-border-medium">
              {helplines.map((line) => (
                <a
                  key={line.descKey}
                  href={`tel:${line.tel}`}
                  className="psychology-help-row group flex min-h-[132px] flex-col justify-between gap-5 border-b border-border-subtle py-6 transition-colors last:border-b-0 hover:bg-bg-elevated sm:flex-row sm:items-center sm:px-5"
                  aria-label={`${line.number}: ${t(`helplines.${line.descKey}`)}`}
                >
                  <p className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.03em] text-ink-primary tabular-nums">
                    {line.number}
                  </p>
                  <div className="max-w-[340px] sm:text-right">
                    <p className="text-[0.9375rem] font-medium leading-[1.5] text-ink-primary">
                      {t(`helplines.${line.descKey}`)}
                    </p>
                    <p className="mt-2 text-[0.8125rem] leading-[1.45] text-ink-tertiary">
                      {t(`helplines.${line.metaKey}`)}
                    </p>
                  </div>
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg-base" aria-hidden="true">
                    <span className="psychology-call-ring absolute inset-0 rounded-full border border-accent" />
                    <Phone size={20} weight="fill" className="relative z-10 transition-transform duration-200 group-hover:scale-105" />
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-10 rounded-xl bg-bg-elevated p-6 sm:p-8">
              <h3 className="font-display text-[1.25rem] font-semibold leading-[1.3] tracking-[-0.015em] text-ink-primary">
                {t("openingHeading")}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-[1.65] text-ink-secondary">
                {t("openingBody")}
              </p>
              <blockquote className={`psychology-opening-quote mt-5 border-y border-border-medium py-5 text-pretty text-[1.0625rem] font-medium leading-[1.65] text-ink-primary ${copied ? "is-copied" : ""}`}>
                “{t("openingSentence")}”
              </blockquote>
              <button
                type="button"
                onClick={copyOpeningSentence}
                className="psychology-motion-control mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-4 py-2.5 text-[0.875rem] font-semibold text-ink-primary transition-[background-color,border-color,color,transform] duration-150 hover:bg-bg-subtle active:scale-[0.98]"
              >
                {copied ? <Check size={18} weight="bold" aria-hidden="true" className="psychology-copy-icon text-accent" /> : <Copy size={18} aria-hidden="true" />}
                <span aria-live="polite">{copied ? t("copied") : t("copySentence")}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Na UEW: konkretne miejsca na uczelni, zamiast samej obietnicy
          „na uczelni” odesłanej do infopacku. Dane w src/lib/pomoc-uew.ts. */}
      <section
        id="na-uew"
        className="section-padding scroll-mt-24 border-t border-border-subtle"
        aria-labelledby="uew-heading"
      >
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
          <div>
            <p className="font-mono text-[0.75rem] tracking-[0.04em] text-accent">{t("uew.eyebrow")}</p>
            <h2
              id="uew-heading"
              className="mt-3 text-balance font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink-primary"
            >
              {t("uew.heading")}
            </h2>
            <p className="mt-5 max-w-[46ch] text-pretty text-[1rem] leading-[1.7] text-ink-secondary">
              {t("uew.lead")}
            </p>
            <p className="mt-5 max-w-[46ch] text-[0.8125rem] leading-[1.55] text-ink-tertiary">{t("uew.source")}</p>
          </div>

          <ul className={styles.places}>
            {UEW_SUPPORT.map((place) => (
              <li key={place.key} className={styles.place}>
                <p className={styles.placeFree}>{t("uew.free")}</p>
                <h3 className={styles.placeName}>{t(`uew.${place.key}.name`)}</h3>
                <p className={styles.placeDesc}>{t(`uew.${place.key}.desc`)}</p>
                <ul className={styles.placeMeta}>
                  <li>
                    <MapPin size={18} aria-hidden="true" />
                    {t(`uew.${place.key}.place`)}
                  </li>
                  {place.email && (
                    <li>
                      <EnvelopeSimple size={18} aria-hidden="true" />
                      <a href={`mailto:${place.email}`} className={styles.metaLink}>
                        {place.email}
                      </a>
                    </li>
                  )}
                  {place.phone && (
                    <li>
                      <Phone size={18} aria-hidden="true" />
                      <a href={`tel:${place.phone.tel}`} className={styles.metaLink}>
                        {place.phone.label}
                      </a>
                    </li>
                  )}
                </ul>
                <div className={styles.placeActions}>
                  <a href={place.formUrl} target="_blank" rel="noopener noreferrer" className={styles.formBtn}>
                    {t("uew.form")}
                    <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                    <span className="sr-only">{tc("newTab")}</span>
                  </a>
                  <a href={place.pageUrl} target="_blank" rel="noopener noreferrer" className={styles.pageLink}>
                    {place.pageNeedsLogin ? t("uew.pageLogin") : t("uew.page")}
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                    <span className="sr-only">{tc("newTab")}</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="formy-wsparcia"
        className="section-padding scroll-mt-24 border-t border-border-subtle bg-bg-surface"
        aria-labelledby="formy-heading"
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          {/* Szklane kamienie w równowadze (Higgsfield), z tej samej serii co
              reszta strony; obiekt-symbol, bez ludzi. */}
          <div className={styles.art} aria-hidden="true">
            <Image
              src="/photos/pomoc/kamienie.webp"
              alt=""
              width={900}
              height={1125}
              sizes="(max-width: 1023px) 300px, 380px"
              className={styles.artImg}
            />
          </div>

          <div>
            <h2
              id="formy-heading"
              className="max-w-[18ch] text-balance font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink-primary"
            >
              {t("reassureHeading")}
            </h2>
            <p className="mt-5 max-w-[62ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
              {t("reassureBody")}
            </p>
            <a
              href={INFOPACK}
              target="_blank"
              rel="noopener noreferrer"
              className="psychology-motion-control mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-bg-base transition-[background-color,transform] duration-150 hover:bg-accent-dim active:scale-[0.98]"
            >
              <FilePdf size={20} aria-hidden="true" />
              {t("openInfopack")}
            </a>

            <div className="mt-10 border-y border-border-medium">
              {contains.map((item) => {
                const Glyph = item.icon;
                return (
                  <div key={item.key} className="psychology-option-row flex min-h-[84px] items-center gap-5 border-b border-border-subtle py-4 last:border-b-0">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-glow text-accent">
                      <Glyph size={22} aria-hidden="true" />
                    </span>
                    <p className="text-[0.9375rem] font-medium leading-[1.6] text-ink-primary">
                      {t(`contains.${item.key}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1200px] flex-col gap-2 border-t border-border-subtle pt-5 text-[0.8125rem] leading-[1.55] text-ink-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>{t("verifiedDate")}</p>
          <a
            href={HEALTH_MINISTRY}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink-secondary underline decoration-border-medium underline-offset-4 transition-colors hover:text-accent"
          >
            {t("officialSource")}
          </a>
        </div>
      </section>
    </>
  );
}
