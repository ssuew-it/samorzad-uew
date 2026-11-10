"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowSquareOut } from "@phosphor-icons/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "../ScrollReveal";
import { Duty, EmailLink, PhoneLink, Portrait, useNow } from "../people/OfficeHours";
import {
  chair,
  rector,
  universityOfficers,
  viceRectors,
  UNIVERSITY_AUTHORITIES_URL,
  UNIVERSITY_COUNCIL_URL,
  type Member,
} from "@/lib/people";
import type { Dyzur } from "@/lib/dyzury";

const EASE = [0.16, 1, 0.3, 1] as const;

export function WladzeRektorskieContent({ dyzury }: { dyzury: Dyzur[] }) {
  const reduce = useReducedMotion();
  const t = useTranslations("wladze");
  const tc = useTranslations("common");
  const now = useNow();
  const reveal = (i = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: reduce ? { duration: 0 } : { duration: 0.5, delay: Math.min(i, 4) * 0.08, ease: EASE },
  });

  const groups = (["admin", "faculties", "units"] as const).map((group) => ({
    group,
    units: universityOfficers.filter((u) => u.group === group),
  }));

  return (
    <>
      <section className="section-padding" aria-labelledby="wladze-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-accent">{t("eyebrow")}</p>
            <h2
              id="wladze-heading"
              className="mt-3 max-w-[22ch] text-balance font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("heading")}
            </h2>
          </ScrollReveal>

          {/* Rektor */}
          <motion.article
            {...reveal()}
            className="mt-12 flex flex-col gap-6 rounded-2xl border border-accent/40 bg-bg-surface p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
          >
            <Portrait photo={rector.photo} name={rector.name} role={t("rektorRole")} className="w-[148px] sm:w-[176px]" sizes="176px" />
            <div className="min-w-0">
              <h3 className="text-balance font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
                {rector.name}
              </h3>
              <p className="mt-2 text-[0.9375rem] font-medium text-accent">{t("rektorRole")}</p>
              <Contacts person={rector} />
            </div>
          </motion.article>

          {/* Prorektor ds. Studenckich i Kształcenia - szeroko, z dyżurem; pozostali w rzędzie. */}
          {viceRectors
            .filter((p) => p.dutyKey)
            .map((p) => {
              const role = t(`roles.${p.roleKey}`);
              return (
                <motion.article
                  key={p.name}
                  {...reveal()}
                  className="mt-6 grid gap-6 rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-10"
                >
                  <div className="flex items-start gap-5">
                    <Portrait photo={p.photo} name={p.name} role={role} className="w-[96px] sm:w-[112px]" sizes="112px" />
                    <div className="min-w-0 pt-1">
                      <h3 className="text-balance font-display text-[1.1875rem] font-semibold leading-[1.25] tracking-[-0.01em] text-ink-primary">{p.name}</h3>
                      <p className="mt-1 text-[0.875rem] leading-[1.5] text-ink-secondary">{role}</p>
                      <Contacts person={p} small />
                    </div>
                  </div>
                  <div className="[&>div]:mt-0">
                    <Duty slots={dyzury.filter((d) => d.person === p.dutyKey)} now={now} compact />
                  </div>
                  <aside className="border-t border-border-subtle pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <h4 className="text-[0.9375rem] font-semibold text-ink-primary">{t("when.heading")}</h4>
                    <p className="mt-2 text-pretty text-[0.875rem] leading-[1.6] text-ink-secondary">{t("when.body")}</p>
                    <ul className="mt-3 flex flex-col gap-1">
                      <li><ArrowLink href="/dziekan-i-prodziekani">{t("when.deans")}</ArrowLink></li>
                      <li><ArrowLink href="/infopacki/sprawy-studenckie">{t("when.matters")}</ArrowLink></li>
                    </ul>
                  </aside>
                </motion.article>
              );
            })}

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {viceRectors
              .filter((p) => !p.dutyKey)
              .map((p, i) => {
                const role = t(`roles.${p.roleKey}`);
                return (
                  <motion.article key={p.name} {...reveal(i + 1)} className="flex h-full flex-col rounded-2xl border border-border-subtle bg-bg-surface p-5">
                    <Portrait photo={p.photo} name={p.name} role={role} className="w-[96px]" sizes="96px" />
                    <h3 className="mt-4 text-balance font-display text-[1.0625rem] font-semibold leading-[1.3] tracking-[-0.01em] text-ink-primary">{p.name}</h3>
                    <p className="mt-1 text-[0.875rem] leading-[1.5] text-ink-secondary">{role}</p>
                    <Contacts person={p} small />
                  </motion.article>
                );
              })}
          </div>
        </div>
      </section>

      {/* Pozostałe Władze Uczelni - zwięźle, bez zdjęć. */}
      <section className="section-padding border-t border-border-medium bg-bg-elevated" aria-labelledby="wladze-others-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="wladze-others-heading"
              className="font-display text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
            >
              {t("othersHeading")}
            </h2>
            <p className="mt-3 max-w-[60ch] text-pretty text-[1rem] leading-[1.7] text-ink-secondary">{t("othersLead")}</p>
          </ScrollReveal>

          <div className="mt-12 grid gap-12">
            {groups.map(({ group, units }) => (
              <div key={group}>
                <h3 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-tertiary">{t(`groups.${group}`)}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {units.map((u, i) => (
                    <motion.div key={u.unitKey ?? `${group}-${i}`} {...reveal(i)} className={`rounded-xl border border-border-subtle bg-bg-surface p-5 ${group === "admin" ? "md:col-span-2 lg:col-span-3" : ""}`}>
                      {u.unitKey && <p className="text-[0.9375rem] font-semibold text-ink-primary">{t(`units.${u.unitKey}`)}</p>}
                      <ul className={`grid gap-4 ${u.unitKey ? "mt-4" : ""} ${group === "admin" ? "sm:grid-cols-2" : ""}`}>
                        {u.people.map((m) => (
                          <li key={m.name} className="min-w-0">
                            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-accent">{t(`roles.${m.roleKey}`)}</p>
                            <p className="mt-1 text-[0.9375rem] font-medium leading-[1.4] text-ink-primary">{m.name}</p>
                            {(m.email || m.phone) && <Contacts person={m} small />}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                  {group === "units" && (
                    <motion.div {...reveal(units.length)} className="flex flex-col gap-3 rounded-xl border border-accent/40 bg-bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:col-span-2 lg:col-span-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-accent">{t("studentDeans.label")}</p>
                        <p className="mt-1 text-[0.9375rem] font-semibold text-ink-primary">{t("studentDeans.title")}</p>
                        <p className="mt-1 text-pretty text-[0.875rem] leading-[1.6] text-ink-secondary">{t("studentDeans.body")}</p>
                      </div>
                      <div className="shrink-0">
                        <ArrowLink href="/dziekan-i-prodziekani">{t("studentDeans.link")}</ArrowLink>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Samorząd w Radzie Uczelni */}
          <motion.aside
            {...reveal()}
            aria-labelledby="wladze-council"
            className="mt-14 flex flex-col gap-5 rounded-2xl border border-border-subtle bg-bg-surface p-6 sm:flex-row sm:items-center sm:gap-6"
          >
            {chair.photo && (
              <div className="relative aspect-[4/5] w-[88px] shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated">
                <Image src={chair.photo} alt="" fill sizes="88px" className="object-cover object-top" />
              </div>
            )}
            <div className="min-w-0">
              <p id="wladze-council" className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-accent">{t("council.label")}</p>
              <p className="mt-2 max-w-[62ch] text-pretty text-[1rem] leading-[1.65] text-ink-primary">{t("council.body", { name: chair.name })}</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                <a
                  href={UNIVERSITY_COUNCIL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-1.5 text-[0.875rem] font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                >
                  {t("council.link")}
                  <ArrowSquareOut size={14} aria-hidden="true" />
                  <span className="sr-only">({tc("newTab")})</span>
                </a>
                <ArrowLink href="/zarzad">{t("council.chairLink")}</ArrowLink>
              </div>
            </div>
          </motion.aside>

          <p className="mt-10 text-pretty text-[0.8125rem] leading-[1.6] text-ink-tertiary">
            {t("source")}{" "}
            <a
              href={UNIVERSITY_AUTHORITIES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-6 items-center gap-1 font-medium text-accent underline underline-offset-4 hover:text-accent-dim"
            >
              {t("sourceLink")}
              <ArrowSquareOut size={13} aria-hidden="true" />
              <span className="sr-only">({tc("newTab")})</span>
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

function Contacts({ person, small }: { person: Member; small?: boolean }) {
  return (
    <div className="mt-1 flex flex-col items-start">
      {person.email && <EmailLink email={person.email} small={small} />}
      {person.phone && <PhoneLink phone={person.phone} small={small} />}
    </div>
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group/arrow inline-flex min-h-10 items-center gap-1.5 text-[0.875rem] font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
    >
      {children}
      <ArrowRight size={14} weight="bold" aria-hidden="true" className="transition-transform duration-200 ease-out group-hover/arrow:translate-x-0.5 motion-reduce:transform-none" />
    </Link>
  );
}
