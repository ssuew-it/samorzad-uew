"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { UsersThree, Megaphone, ArrowSquareOut, FilePdf, type Icon } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { fueChair, fueMembers, orgLogos } from "@/lib/fue";
import { InitialsAvatar } from "../InitialsAvatar";
import { ScrollReveal } from "../ScrollReveal";
import styles from "./FuePsrp.module.css";

/**
 * Zjazd FUE stoi tutaj, a nie na liście projektów (decyzja z 1.11.2026):
 * uczestniczą w nim delegaci samorządów, nie każdy student, a gospodarz
 * zmienia się między miastami. One-pager przekazał Samorząd.
 */
const ZJAZD_PDF = "/dokumenty/projekty/zjazd-fue-one-pager.pdf";

/**
 * Pięć uczelni Forum pokazujemy jako stały rząd, a nie przesuwaną karuzelę:
 * przy pięciu pozycjach wszystkie mieszczą się na ekranie, a ruch bez
 * przycisku pauzy łamałby WCAG 2.2.2.
 */
export function FuePsrpContent() {
  const t = useTranslations("fuePsrp");
  const tc = useTranslations("common");
  const loc = useLocale() === "en" ? "en" : "pl";

  return (
    <>
      {/* Forum Uczelni Ekonomicznych */}
      <section className="section-padding" aria-labelledby="fue-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
              <div>
                <OrgMark logo={orgLogos.fue} icon={UsersThree} alt={t("fueHeading")} size="lg" />
                <h2
                  id="fue-heading"
                  className="mt-6 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
                >
                  {t("fueHeading")}
                </h2>
                <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("fueBody")}</p>
              </div>

              {/* Przewodniczący Forum z naszego Samorządu - wyróżniony osobno. */}
              <aside className={styles.chair} aria-labelledby="fue-chair-name">
                <p className={styles.chairLabel}>{t("chairLabel")}</p>
                <div className="mt-4 flex items-center gap-5">
                  <span className={styles.chairPhoto}>
                    {fueChair.photo ? (
                      <Image src={fueChair.photo} alt={`${fueChair.name} - ${t("chairRole")}`} fill sizes="96px" className="object-cover" />
                    ) : (
                      <InitialsAvatar name={fueChair.name} size={64} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p id="fue-chair-name" className="font-display text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
                      {fueChair.name}
                    </p>
                    <p className="mt-1 text-[0.9375rem] text-ink-secondary">{t("chairRole")}</p>
                  </div>
                </div>
                <p className="mt-5 text-[0.9375rem] leading-[1.65] text-ink-secondary">{t("chairNote")}</p>
              </aside>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Pięć samorządów Forum: budynek miasta w kolorze z pięciokąta FUE
          i białe logo samorządu na granatowym tle. */}
      <section className={styles.band} aria-labelledby="fue-members-heading">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:py-20">
          <h2 id="fue-members-heading" className={styles.bandHeading}>{t("membersHeading")}</h2>
          <ul className={styles.members}>
            {fueMembers.map((m, i) => (
              <li key={m.key} className={styles.member} data-ours={m.ours || undefined} style={{ "--i": i } as React.CSSProperties}>
                {m.building ? (
                  <span className={styles.building} aria-hidden="true">
                    <Image src={m.building} alt="" fill sizes="120px" className="object-contain object-bottom" />
                  </span>
                ) : null}
                <span className={styles.memberLogo}>
                  {m.logo ? (
                    <Image src={m.logo} alt={m.name[loc]} fill sizes="200px" className="object-contain object-left" />
                  ) : (
                    <span className={styles.memberMonogram} aria-hidden="true">
                      {m.city[loc]}
                    </span>
                  )}
                </span>
                <span className={styles.memberName}>{m.name[loc]}</span>
                {/* Bez logo miasto już stoi dużym napisem u góry - nie powtarzamy go. */}
                <span className={styles.memberCity}>
                  {m.logo ? m.city[loc] : null}
                  {m.ours ? <span className={styles.oursTag}>{t("ours")}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Parlament Studentów RP */}
      <section className="section-padding pt-0" aria-labelledby="psrp-heading">
        <ScrollReveal className="mx-auto max-w-[1200px]">
          <article className={styles.psrp}>
            <OrgMark logo={orgLogos.psrp} icon={Megaphone} alt={t("psrpHeading")} size="lg" />
            <div>
              <h2
                id="psrp-heading"
                className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-white"
              >
                {t("psrpHeading")}
              </h2>
              <p className="mt-3 max-w-[70ch] text-[1rem] leading-[1.7] text-white/75">{t("psrpBody")}</p>
              <a
                href="https://psrp.org.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 text-[0.9375rem] font-semibold text-white underline underline-offset-4"
              >
                {t("psrpLink")}
                <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
                <span className="sr-only"> ({tc("newTab")})</span>
              </a>
            </div>
          </article>
        </ScrollReveal>
      </section>

      {/* Zjazd FUE */}
      <section className="section-padding pt-0" aria-labelledby="zjazd-fue-heading">
        <ScrollReveal className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 border-t border-border-medium pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
            <h2
              id="zjazd-fue-heading"
              className="text-balance font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("zjazdHeading")}
            </h2>
            <div>
              <p className="text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("zjazdBody")}</p>
              <p className="mt-4 text-[1.0625rem] leading-[1.75] text-ink-secondary">{t("zjazdTeam")}</p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                <a
                  href={ZJAZD_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-accent transition-colors hover:text-accent-dim"
                >
                  <FilePdf size={20} weight="regular" aria-hidden="true" />
                  {t("zjazdPdf")}
                  <span className="sr-only"> ({tc("newTab")})</span>
                </a>
                <Link
                  href="/rekrutacja"
                  className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-ink-primary underline underline-offset-4 transition-colors hover:text-accent"
                >
                  {t("zjazdRecruitment")}
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}

/** Logo organizacji; bez pliku - ikona w tym samym miejscu. */
function OrgMark({ logo, icon: Glyph, alt, size }: { logo?: string; icon: Icon; alt: string; size?: "lg" }) {
  return logo ? (
    <span className={`relative block shrink-0 ${size === "lg" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-16 w-16"}`}>
      <Image src={logo} alt={alt} fill sizes="112px" className="object-contain object-left" />
    </span>
  ) : (
    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-glow text-accent">
      <Glyph size={26} weight="regular" aria-hidden="true" />
    </span>
  );
}
