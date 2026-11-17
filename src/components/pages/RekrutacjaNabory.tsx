"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, EnvelopeSimple, FilePdf } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { APPLY_EMAIL, openRecruitments, recruitmentGeneralForm, type Recruitment } from "@/lib/recruitment";
import { todayInWarsaw } from "@/lib/russ";
import { projectPhotos, projectPhotosAreAuthentic } from "@/lib/photos";
import styles from "./Rekrutacja.module.css";

/**
 * Wyspy Rekrutacji - części zależne od dzisiejszej daty (otwarte nabory
 * i liczniki dni). Strona leży w cache, a pierwszy gość po nocy może dostać
 * wersję z wczoraj, więc przeglądarka poprawia datę. Reszta strony (kroki,
 * edycje, galeria, kontakty) renderuje się na serwerze w RekrutacjaContent.
 */
const PROJECT_NAMES: Record<string, string> = {
  adapciak: "Adapciak",
  dni: "Dni Adaptacyjne",
  party: "UE Party",
  animalia: "Animalia",
  bal: "Bal UEW",
  juwenalia: "Juwenalia Wrocławskie",
  mosty: "Mosty Ekonomiczne",
  test: "Test Wiedzy Ekonomicznej",
  tedx: "TEDxUEW",
  graduetion: "GradUEtion",
};

const CONTACT_EMAIL = "kontakt@samorzad.ue.wroc.pl";

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);

interface Props {
  items: Recruitment[];
  serverToday: string;
}

/** Wspólne dla trzech wysp: data (poprawiana w przeglądarce) i opisy naborów. */
function useNabory({ items, serverToday }: Props) {
  const t = useTranslations("rekrutacja");
  const locale = useLocale();
  const loc: "pl" | "en" = locale === "en" ? "en" : "pl";

  // Strona odświeża się co najwyżej co godzinę; przeglądarka poprawia datę.
  const [today, setToday] = useState(serverToday);
  useEffect(() => {
    const id = requestAnimationFrame(() => setToday(todayInWarsaw()));
    return () => cancelAnimationFrame(id);
  }, []);

  const open = openRecruitments(items, today);
  const council = open.filter((r) => r.kind === "samorzad");
  const projects = open.filter((r) => r.kind === "projekt");

  /** Mail na aplikacje@ z nazwą naboru w temacie - zgłoszenia łatwo posortować. */
  const applyHref = (r: Recruitment) => `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(t("applySubject", { title: r.title.pl }))}`;

  /** Kotwica karty naboru - pasek „Trwają nabory” przenosi prosto do niej. */
  const anchor = (r: Recruitment, i: number) => `nabor-${r.kind}-${i}`;

  /** „jeszcze 5 dni” / „ostatni dzień” - ten sam licznik w pasku i na kartach. */
  const leftLabel = (r: Recruitment) => {
    if (!r.deadline) return null;
    const left = daysBetween(today, r.deadline);
    return { left, text: left === 0 ? t("lastDay") : t("daysLeft", { days: left }) };
  };

  const fmt = (d: string) => new Intl.DateTimeFormat(loc === "en" ? "en-GB" : "pl-PL", { day: "numeric", month: "long" }).format(new Date(`${d}T12:00:00`));

  return { t, loc, today, open, council, projects, applyHref, anchor, leftLabel, fmt };
}

/** Trwają nabory: pasek tylko wtedy, gdy coś jest otwarte. Każdy nabór to skrót do swojej karty. */
export function PasekNaborow(props: Props) {
  const { t, loc, open, council, projects, anchor, leftLabel } = useNabory(props);
  return open.length > 0 ? (
    <section className={styles.openBar} aria-labelledby="rek-otwarte-heading">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:gap-8">
        <h2 id="rek-otwarte-heading" className={styles.openBarHeading}>
          <span className={styles.liveDot} aria-hidden="true" />
          {t("openNowHeading")}
        </h2>
        <ul className={styles.openBarList}>
          {[...council.map((r, i) => [r, anchor(r, i)] as const), ...projects.map((r, i) => [r, anchor(r, i)] as const)].map(([r, id]) => {
            const left = leftLabel(r);
            return (
              <li key={id}>
                <a href={`#${id}`} className={styles.openChip}>
                  <span className={styles.openChipKind}>{r.kind === "samorzad" ? t("kindCouncil") : t("kindProject")}</span>
                  <span className="font-semibold">{r.title[loc]}</span>
                  {left ? (
                    <span className={styles.openChipLeft} data-soon={left.left <= 3 || undefined}>
                      {left.text}
                    </span>
                  ) : null}
                  <ArrowRight size={16} weight="bold" aria-hidden="true" className="shrink-0" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  ) : null;
}

export function NaboryDoSamorzadu(props: Props) {
  const { t, loc, council, applyHref, anchor, leftLabel, fmt } = useNabory(props);
  return council.length > 0 ? (
    <ul className={styles.councilList}>
      {council.map((r, i) => {
        const left = leftLabel(r);
        return (
          <li key={r.title.pl} id={anchor(r, i)} className={`${styles.councilItem} scroll-mt-28`}>
            <div className="min-w-0">
              <p className={styles.openBadge}>
                <span className={styles.liveDot} aria-hidden="true" />
                {t("openBadge")}
              </p>
              <h3 className="mt-3 font-display text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">{r.title[loc]}</h3>
              {r.desc ? <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-[1.65] text-ink-secondary">{r.desc[loc]}</p> : null}
              {left ? (
                <p className={styles.councilCountdown} data-soon={left.left <= 3 || undefined}>
                  {left.text}
                  <span className="font-normal text-ink-secondary">
                    {" "}
                    · {t("deadlineLabel")}: {fmt(r.deadline!)}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {r.guideUrl ? (
                <a href={r.guideUrl} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
                  <FilePdf size={18} aria-hidden="true" />
                  {t("guideButton")}
                  <span className="sr-only"> ({t("newTab")})</span>
                </a>
              ) : null}
              <a href={applyHref(r)} className={styles.primary}>
                <EnvelopeSimple size={18} aria-hidden="true" />
                {t("applyButton")}
                <span className="sr-only"> {r.title[loc]}</span>
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <div className={styles.empty}>
      <p className="font-semibold text-ink-primary">{t("noneHeading")}</p>
      <p className="mt-1 max-w-[60ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("noneBody")}</p>
      <a
        href={recruitmentGeneralForm || `mailto:${CONTACT_EMAIL}`}
        {...(recruitmentGeneralForm ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${styles.secondary} mt-4`}
      >
        <EnvelopeSimple size={18} aria-hidden="true" />
        {recruitmentGeneralForm ? t("interestButton") : t("generalButton")}
      </a>
    </div>
  );
}

export function NaboryProjektow(props: Props) {
  const { t, loc, today, projects, applyHref, anchor, fmt } = useNabory(props);
  return projects.length > 0 ? (
    <ul className={styles.projectGrid}>
      {projects.map((r, i) => {
        const name = r.project ? PROJECT_NAMES[r.project] : undefined;
        const cover = r.project && projectPhotosAreAuthentic(r.project) ? projectPhotos(r.project)[0] : undefined;
        const left = r.deadline ? daysBetween(today, r.deadline) : undefined;
        return (
          <li key={r.title.pl + i} id={anchor(r, i)} className={`${styles.projectCard} scroll-mt-28`} style={{ "--i": i } as CSSProperties}>
            {cover ? (
              <div className={styles.projectPhoto}>
                <Image src={cover} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
                <p className={`${styles.openBadge} ${styles.openBadgeOnPhoto}`}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  {t("openBadge")}
                </p>
              </div>
            ) : null}
            <div className={styles.projectBody}>
              {cover ? null : (
                <p className={`${styles.openBadge} ${styles.openBadgeInverse} mb-3`}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  {t("openBadge")}
                </p>
              )}
              {name ? <p className={styles.projectName}>{name}</p> : null}
              <h3 className={styles.projectTitle}>{r.title[loc]}</h3>
              {r.desc ? <p className={styles.projectDesc}>{r.desc[loc]}</p> : null}
              {left !== undefined ? (
                <p className={styles.countdown} data-soon={left <= 3 || undefined}>
                  {left === 0 ? t("lastDay") : t("daysLeft", { days: left })}
                  <span className={styles.countdownDate}> · {fmt(r.deadline!)}</span>
                </p>
              ) : null}
              <div className={styles.projectActions}>
                <a href={applyHref(r)} className={styles.projectCta}>
                  {t("applyButton")}
                  <ArrowRight size={18} weight="bold" aria-hidden="true" />
                  <span className="sr-only"> {r.title[loc]}</span>
                </a>
                {r.guideUrl ? (
                  <a href={r.guideUrl} target="_blank" rel="noopener noreferrer" className={styles.projectGuide}>
                    <FilePdf size={18} aria-hidden="true" />
                    {t("guideButton")}
                    <span className="sr-only">
                      {" "}
                      {r.title[loc]} ({t("newTab")})
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <div className={styles.emptyInverse}>
      <p className="font-semibold">{t("projectsNoneHeading")}</p>
      <p className="mt-1 max-w-[60ch] text-[0.9375rem] leading-[1.6] text-white/72">{t("projectsNoneBody")}</p>
      <Link href="/nasze-projekty" className={`${styles.secondaryInverse} mt-4`}>
        {t("projectsLink")}
        <ArrowRight size={18} weight="bold" aria-hidden="true" />
      </Link>
    </div>
  );
}
