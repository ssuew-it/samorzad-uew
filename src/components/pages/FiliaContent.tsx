"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowSquareOut,
  ArrowRight,
  Check,
  Copy,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "../Breadcrumbs";
import { board } from "@/lib/people";
import styles from "./FiliaContent.module.css";

/** Bieżące działania Samorząd Filii publikuje na Facebooku (decyzja z 1.11.2026). */
const FACEBOOK = "https://www.facebook.com/SamorzadStudentowFiliiUEWwJeleniejGorze";

const JOIN = ["problem", "project", "idea", "support"] as const;

// Osoba od Filii pochodzi z jednego źródła składów (people.ts).
const contact = board.find((m) => m.roleKey === "branch");
const EMAIL = contact?.email ?? "kontakt@samorzad.ue.wroc.pl";

// Zdjęcie ze strony Filii na starym serwisie. Przypięte do osoby: przy zmianie
// składu podmień plik razem z wpisem w people.ts.
const PHOTO = "/photos/filia/szymon-wozniak.webp";

/**
 * Adres e-mail z miejscem na złamanie wiersza zaraz po „@”.
 *
 * Na wąskim ekranie adres nie mieści się w jednej linii. Przy samym
 * `break-all` łamał się w środku domeny („…ue.wr” / „oc.pl”), co wygląda
 * na błąd i utrudnia przepisanie. Tu naturalnym miejscem złamania jest „@”;
 * łamanie w dowolnym miejscu zostaje tylko jako ostateczność.
 */
function EmailText({ email }: { email: string }) {
  const [local, domain] = email.split("@");
  if (!domain) return <>{email}</>;
  return (
    <span className="[overflow-wrap:anywhere]">
      {local}@<wbr />
      {domain}
    </span>
  );
}

export function FiliaContent() {
  const t = useTranslations("filia");
  const tc = useTranslations("common");
  const tb = useTranslations("board");
  const [copied, setCopied] = useState(false);

  const role = tb("roles.branch");
  const mailto = (subject?: string) =>
    subject ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}` : `mailto:${EMAIL}`;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      // Starsze przeglądarki i kontekst bez uprawnień do schowka.
      const fallback = document.createElement("textarea");
      fallback.value = EMAIL;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      const ok = document.execCommand("copy");
      fallback.remove();
      setCopied(ok);
    }
  }

  return (
    <div className={styles.root}>
      {/* ── Hero: Filia i jej osoba kontaktowa ── */}
      <section
        className="relative overflow-hidden border-b border-border-subtle bg-bg-elevated"
        aria-labelledby="filia-title"
      >
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
          <div className={styles.enter}>
            <Breadcrumbs
              items={[
                { label: tc("home"), href: "/" },
                { label: t("crumbGov"), href: "/o-nas" },
                { label: t("heroTitle") },
              ]}
            />
          </div>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-16">
            <div>
              <p
                className={`${styles.enter} flex items-center gap-3 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent`}
                style={{ "--d": "60ms" } as CSSProperties}
              >
                <span className="h-px w-8 shrink-0 bg-accent" aria-hidden="true" />
                {t("kicker")}
              </p>
              <h1
                id="filia-title"
                className={`${styles.enter} mt-5 max-w-[15ch] text-balance font-display text-[clamp(2.5rem,5.6vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary`}
                style={{ "--d": "110ms" } as CSSProperties}
              >
                {t("heroTitle")}
              </h1>
              <p
                className={`${styles.enter} mt-6 max-w-[60ch] text-pretty text-[1.0625rem] leading-[1.75] text-ink-secondary sm:text-[1.125rem]`}
                style={{ "--d": "200ms" } as CSSProperties}
              >
                {t("heroLead")}
              </p>
              <div
                className={`${styles.enter} mt-8 flex flex-col gap-3 sm:flex-row`}
                style={{ "--d": "280ms" } as CSSProperties}
              >
                <a
                  href={mailto()}
                  className={`${styles.press} inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-bg-base hover:bg-accent-dim`}
                >
                  <EnvelopeSimple size={20} weight="bold" aria-hidden="true" />
                  {t("ctaWrite")}
                </a>
                <a
                  href={FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.press} inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-6 py-3 font-semibold text-ink-primary hover:bg-bg-subtle`}
                >
                  {t("ctaProcess")}
                  <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
                  <span className="sr-only"> ({t("newTab")})</span>
                </a>
              </div>
            </div>

            <figure className="mx-auto w-full max-w-[440px] lg:mx-0 lg:justify-self-end">
              <div className={`${styles.portrait} relative aspect-[4/3] overflow-hidden rounded-xl bg-bg-subtle sm:aspect-[4/5]`}>
                <Image
                  src={PHOTO}
                  alt={t("photoAlt")}
                  fill
                  preload
                  sizes="(min-width: 1024px) 440px, (min-width: 640px) 440px, 100vw"
                  className="object-cover object-[50%_18%]"
                />
              </div>
              <figcaption
                className={`${styles.plate} relative mx-4 -mt-12 rounded-lg border border-border-soft bg-bg-surface p-5`}
              >
                <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-accent">
                  {t("contactKicker")}
                </p>
                <p className="mt-2 font-display text-[1.375rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink-primary">
                  {contact?.name}
                </p>
                <p className="mt-1 text-[0.875rem] leading-[1.5] text-ink-secondary">{role}</p>
                <a
                  href={mailto()}
                  className="mt-3 inline-flex min-h-6 items-center gap-2 py-1 text-[0.875rem] font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                >
                  <EnvelopeSimple size={16} aria-hidden="true" className="shrink-0" />
                  <EmailText email={EMAIL} />
                </a>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Jak możesz się włączyć: każda droga kończy się mailem do Filii ── */}
      <section
        id="wspolpraca"
        className="section-padding scroll-mt-20 border-t border-border-subtle bg-bg-surface"
        aria-labelledby="filia-dolacz"
      >
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <h2
              id="filia-dolacz"
              className="max-w-[14ch] text-balance font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary"
            >
              {t("join.heading")}
            </h2>
            <p className="mt-5 max-w-[46ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
              {t("join.lead")}
            </p>

            <div className="mt-10 border-t border-border-subtle pt-6">
              <p className="text-[0.875rem] text-ink-secondary">{t("join.direct")}</p>
              <p className="mt-1 font-mono text-[0.9375rem] font-medium text-ink-primary">
                <EmailText email={EMAIL} />
              </p>
              <button
                type="button"
                onClick={copyEmail}
                className={`${styles.press} mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-4 text-[0.875rem] font-semibold text-ink-primary hover:bg-bg-subtle`}
              >
                {copied ? (
                  <Check size={18} weight="bold" aria-hidden="true" className="text-accent" />
                ) : (
                  <Copy size={18} aria-hidden="true" />
                )}
                <span aria-live="polite">{copied ? t("join.copied") : t("join.copy")}</span>
              </button>
            </div>
          </div>

          <ul className="border-y border-border-medium">
            {JOIN.map((key) => (
              <li key={key} className="border-b border-border-subtle last:border-b-0">
                <a
                  href={mailto(t(`join.options.${key}.subject`))}
                  className={`${styles.door} grid min-h-[104px] grid-cols-[minmax(0,1fr)_44px] items-center gap-5 px-1 py-5 hover:bg-bg-elevated sm:px-5`}
                >
                  <span className="min-w-0">
                    <span className="block text-pretty text-[1.0625rem] font-semibold leading-[1.4] text-ink-primary">
                      {t(`join.options.${key}.label`)}
                    </span>
                    <span className="mt-1 block text-[0.875rem] leading-[1.5] text-ink-secondary">
                      {t(`join.options.${key}.hint`)}
                    </span>
                    <span className="sr-only"> ({t("join.opensMail")})</span>
                  </span>
                  <span
                    className={`${styles.doorIcon} flex h-11 w-11 items-center justify-center rounded-full bg-accent-glow text-accent`}
                    aria-hidden="true"
                  >
                    <EnvelopeSimple size={20} weight="bold" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/zarzad"
            className="group mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
          >
            {t("boardLink")}
            <ArrowRight size={18} weight="bold" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
