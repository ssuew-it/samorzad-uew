"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle,
  Copy,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "../Breadcrumbs";
import { ScrollReveal } from "../ScrollReveal";
import { board } from "@/lib/people";
import styles from "./FiliaContent.module.css";

type AreaKey = "students" | "projects" | "promo" | "partners" | "finance";

/*
 * Kto prowadzi który etap wydarzenia. Przypisania wynikają wprost z opisu
 * obszarów na stronie Filii (archiwum Wix): finanse „planują budżety, pilnują
 * formalności i harmonogramów, rozliczają projekty”, promocja „promuje
 * wydarzenia i dokumentuje działania”, kontakty zewnętrzne „szukają partnerów
 * do projektów”. Nie dopisuj tu powiązań, których nie ma w źródle.
 */
const STAGES: { key: string; areas: AreaKey[] }[] = [
  { key: "idea", areas: ["projects"] },
  { key: "plan", areas: ["finance", "partners"] },
  { key: "formal", areas: ["finance"] },
  { key: "promo", areas: ["promo"] },
  { key: "run", areas: ["projects"] },
  { key: "settle", areas: ["finance", "promo"] },
];

const AREAS: AreaKey[] = ["students", "projects", "promo", "partners", "finance"];

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

const pad = (n: number) => String(n).padStart(2, "0");

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
                { label: t("crumbGov"), href: "/nasza-dzialalnosc" },
                { label: t("heroTitle") },
              ]}
            />
          </div>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-16">
            <div>
              <p
                className={`${styles.enter} flex items-center gap-3 font-mono text-[0.75rem] font-medium uppercase tracking-[0.12em] text-accent`}
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
                  href="#proces"
                  className={`${styles.press} inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-6 py-3 font-semibold text-ink-primary hover:bg-bg-subtle`}
                >
                  {t("ctaProcess")}
                  <ArrowDown size={18} weight="bold" aria-hidden="true" />
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
                <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent">
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

      {/* ── Realny głos ── */}
      <section className="section-padding" aria-labelledby="filia-glos">
        <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <h2
            id="filia-glos"
            className="max-w-[16ch] text-balance font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-ink-primary"
          >
            {t("statement.heading")}
          </h2>
          <ScrollReveal>
            <p className="max-w-[40ch] text-pretty font-display text-[clamp(1.3125rem,2.3vw,1.875rem)] leading-[1.45] tracking-[-0.01em] text-ink-secondary">
              {t.rich("statement.body", {
                hl: (chunks) => <span className={styles.hl}>{chunks}</span>,
              })}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Proces wydarzenia: dusza strony ── */}
      <section
        id="proces"
        className="section-padding scroll-mt-20 border-y border-border-subtle bg-bg-surface"
        aria-labelledby="filia-proces"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-20">
            <h2
              id="filia-proces"
              className="text-balance font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary"
            >
              {t("process.heading")}
            </h2>
            <p className="max-w-[56ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
              {t("process.lead")}
            </p>
          </div>

          <ol className={`${styles.stages} mt-14`}>
            {STAGES.map((stage, i) => (
              <li
                key={stage.key}
                id={`etap-${stage.key}`}
                className={`${styles.stage} scroll-mt-28`}
                style={{ "--i": i } as CSSProperties}
              >
                <span className={styles.node} aria-hidden="true">
                  {pad(i + 1)}
                </span>
                {i < STAGES.length - 1 ? (
                  <span className={styles.link} aria-hidden="true">
                    <span className={styles.linkFill} />
                  </span>
                ) : null}

                <div className="min-w-0">
                  <h3 className="text-balance font-display text-[1.1875rem] font-semibold leading-[1.25] tracking-[-0.015em] text-ink-primary">
                    {t(`process.stages.${stage.key}.title`)}
                  </h3>
                  <p className="mt-2 text-pretty text-[0.9375rem] leading-[1.6] text-ink-secondary">
                    {t(`process.stages.${stage.key}.desc`)}
                  </p>
                  <p className="mt-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-ink-tertiary">
                    {t("process.owner")}
                  </p>
                  <ul className="mt-1">
                    {stage.areas.map((area) => (
                      <li key={area} className="min-h-7 py-1">
                        {/* Odnośnik w toku tekstu: przy zawinięciu strzałka idzie
                            za ostatnim słowem, a nie ucieka na prawą krawędź. */}
                        <a
                          href={`#obszar-${area}`}
                          className="group text-[0.8125rem] font-medium leading-[1.5] text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                        >
                          {t(`areas.items.${area}.title`)}
                          <ArrowDown
                            size={13}
                            weight="bold"
                            aria-hidden="true"
                            className="ml-1 inline-block align-[-2px] transition-transform duration-200 group-hover:translate-y-0.5"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Obszary działania ── */}
      <section className="section-padding" aria-labelledby="filia-obszary">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-20">
            <h2
              id="filia-obszary"
              className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-primary"
            >
              {t("areas.heading")}
            </h2>
            <p className="max-w-[56ch] text-[1rem] leading-[1.75] text-ink-secondary">
              {t("areas.lead")}
            </p>
          </div>

          <ol className="mt-12">
            {AREAS.map((area, i) => {
              const featured = i === 0;
              const points = t.raw(`areas.items.${area}.points`) as string[];
              const stages = STAGES.filter((s) => s.areas.includes(area));
              return (
                <li
                  key={area}
                  id={`obszar-${area}`}
                  className={`${styles.area} grid scroll-mt-28 gap-6 lg:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 ${
                    featured
                      ? "mb-6 rounded-xl bg-bg-elevated px-6 py-10 sm:px-10 lg:py-14"
                      : "border-b border-border-subtle py-10 first-of-type:border-t"
                  }`}
                >
                  <span
                    className="font-mono text-[0.8125rem] font-medium text-accent tabular-nums"
                    aria-hidden="true"
                  >
                    {pad(i + 1)}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className={`text-balance font-display font-semibold tracking-[-0.025em] text-ink-primary ${
                        featured
                          ? "text-[clamp(1.625rem,3vw,2.375rem)] leading-[1.1]"
                          : "text-[clamp(1.375rem,2.2vw,1.75rem)] leading-[1.15]"
                      }`}
                    >
                      {t(`areas.items.${area}.title`)}
                    </h3>
                    <p className="mt-3 max-w-[52ch] text-pretty text-[1rem] leading-[1.7] text-ink-secondary">
                      {t(`areas.items.${area}.intro`)}
                    </p>
                    {stages.length > 0 ? (
                      <div className="mt-5">
                        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-ink-tertiary">
                          {t("areas.stagesLabel")}
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {stages.map((s) => (
                            <li key={s.key}>
                              <a
                                href={`#etap-${s.key}`}
                                className={`${styles.press} inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border-medium px-3 text-[0.8125rem] font-medium text-ink-primary hover:border-accent hover:text-accent`}
                              >
                                <span className="font-mono text-[0.6875rem] text-accent" aria-hidden="true">
                                  {pad(STAGES.indexOf(s) + 1)}
                                </span>
                                {t(`process.stages.${s.key}.title`)}
                                <ArrowUp size={12} weight="bold" aria-hidden="true" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <ul className={`flex flex-col ${featured ? "gap-4" : "gap-3"}`}>
                    {points.map((point) => (
                      <li
                        key={point}
                        className={`flex gap-3 text-pretty leading-[1.6] text-ink-primary ${
                          featured ? "text-[1.0625rem]" : "text-[0.9375rem]"
                        }`}
                      >
                        <span className="mt-[0.8em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
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
        </div>
      </section>

      {/* ── Po co to wszystko? ── */}
      <section
        className={`${styles.why} section-padding bg-[#10276b] text-white dark:bg-[#17275b]`}
        aria-labelledby="filia-po-co"
      >
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <h2
              id="filia-po-co"
              className="text-balance font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
            >
              {t("why.heading")}
            </h2>
            <p className="mt-5 max-w-[44ch] text-pretty text-[1.0625rem] leading-[1.7] text-white/80">
              {t("why.lead")}
            </p>
          </div>

          <div>
            <ul className="border-t border-white/20">
              {(t.raw("why.points") as string[]).map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-4 border-b border-white/15 py-5 text-pretty font-display text-[clamp(1.125rem,1.8vw,1.375rem)] font-medium leading-[1.4] tracking-[-0.01em]"
                >
                  <CheckCircle size={24} weight="fill" aria-hidden="true" className="mt-[2px] shrink-0 text-white/70" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/zarzad"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 py-2 font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
            >
              {t("why.board")}
              <ArrowRight
                size={18}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
