"use client";

import Image from "next/image";
import { ArrowDown, EnvelopeSimple, MapPin } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Breadcrumbs } from "../Breadcrumbs";
import { board } from "@/lib/people";

/**
 * Zamiast opisu „jak działa ta strona” (usunięty 1.11.2026) hero daje konkret:
 * do kogo pisać z pytaniami i gdzie składa się wnioski.
 */
const teaching = board.find((m) => m.roleKey === "teaching");
const TEACHING_EMAIL = "dydaktyka@samorzad.ue.wroc.pl";

export function StypendiaHero() {
  const t = useTranslations("stypendia");
  const tc = useTranslations("common");
  const tb = useTranslations("board");

  return (
    <section
      className="relative overflow-hidden border-b border-border-subtle bg-bg-elevated"
      aria-labelledby="stypendia-title"
    >
      <div className="scholarship-ledger-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-[128px] md:pb-20 md:pt-[140px]">
        <div className="scholarship-hero-enter scholarship-hero-enter-1">
          <Breadcrumbs
            items={[
              { label: tc("home"), href: "/" },
              { label: t("crumbStudent"), href: "/dla-studenta" },
              { label: t("heroTitle") },
            ]}
          />
        </div>

        <div className="mt-10 grid items-end gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] lg:gap-20">
          <div>
            <h1
              id="stypendia-title"
              className="scholarship-hero-enter scholarship-hero-enter-3 mt-6 max-w-[15ch] text-balance font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-ink-primary"
            >
              {t("heroTitle")}
            </h1>
            <p className="scholarship-hero-enter scholarship-hero-enter-4 mt-6 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.75] text-ink-secondary sm:text-[1.125rem]">
              {t("heroLead")}
            </p>
            <a
              href="#przeglad"
              className="scholarship-motion-control scholarship-hero-enter scholarship-hero-enter-5 group mt-8 inline-flex min-h-12 items-center gap-3 rounded-lg bg-accent px-6 py-3 font-semibold text-bg-base transition-[background-color,transform] duration-150 hover:bg-accent-dim active:scale-[0.98]"
            >
              {t("heroCta")}
              <ArrowDown
                size={19}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-y-1"
              />
            </a>
          </div>

          <aside
            className="scholarship-route-enter border-y border-border-medium bg-bg-surface/80 px-6 py-7 backdrop-blur-[2px] sm:px-8"
            aria-labelledby="scholarship-contact-heading"
          >
            <h2 id="scholarship-contact-heading" className="text-[0.875rem] font-semibold text-ink-secondary">
              {t("contact.heading")}
            </h2>
            {teaching ? (
              <div className="mt-5 flex items-center gap-4">
                {teaching.photo ? (
                  <span className="relative h-[90px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-border-subtle">
                    <Image src={teaching.photo} alt={`${teaching.name} - ${tb("roles.teaching")}`} fill sizes="72px" className="object-cover" />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <p className="font-display text-[1.25rem] font-semibold leading-[1.2] text-ink-primary">{teaching.name}</p>
                  <p className="mt-1 text-[0.875rem] leading-[1.45] text-ink-secondary">{tb("roles.teaching")}</p>
                </div>
              </div>
            ) : null}
            <a
              href={`mailto:${TEACHING_EMAIL}`}
              className="mt-4 inline-flex min-h-11 items-center gap-2 break-all text-[0.9375rem] font-semibold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              <EnvelopeSimple size={18} aria-hidden="true" className="shrink-0" />
              {TEACHING_EMAIL}
            </a>
            <p className="mt-5 flex items-start gap-3 border-t border-border-subtle pt-5 text-[0.875rem] leading-[1.6] text-ink-secondary">
              <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              {t("contact.office")}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
