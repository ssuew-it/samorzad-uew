"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, EnvelopeSimple, FilePdf, FolderOpen } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "../ScrollReveal";
import { APPLY_EMAIL, openRecruitments, recruiterPhotos, recruitmentDrive, recruitmentGeneralForm, type Recruitment } from "@/lib/recruitment";
import { todayInWarsaw } from "@/lib/russ";
import { projectPhotos, projectPhotosAreAuthentic } from "@/lib/photos";
import { board, viceChairs } from "@/lib/people";
import { ContactCard } from "../ContactCard";
import styles from "./Rekrutacja.module.css";

/**
 * Rekrutacja w dwóch częściach (decyzja z 1.11.2026): nabory do Samorządu
 * i do zespołów projektów. Dane z zakładki „Rekrutacje” w arkuszu Treści
 * strony; nabór po terminie znika sam. Część projektowa jest celowo mniej
 * urzędowa: duża nazwa projektu, zdjęcie z wydarzenia i licznik dni.
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
const projectsLead = viceChairs.find((p) => p.roleKey === "projects");
/** Rekrutacja do Samorządu podlega Członkini Zarządu ds. Human Resources. */
const hrLead = board.find((p) => p.roleKey === "hr");

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);

export function RekrutacjaContent({ items, serverToday }: { items: Recruitment[]; serverToday: string }) {
  const t = useTranslations("rekrutacja");
  const tb = useTranslations("board");
  const tp = useTranslations("przewodniczacy");
  const locale = useLocale();
  const loc = locale === "en" ? "en" : "pl";

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
  const applyHref = (r: Recruitment) =>
    `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(t("applySubject", { title: r.title.pl }))}`;

  const fmt = (d: string) =>
    new Intl.DateTimeFormat(loc === "en" ? "en-GB" : "pl-PL", { day: "numeric", month: "long" }).format(new Date(`${d}T12:00:00`));

  return (
    <>
      {/* ── Samorząd ── */}
      <section id="samorzad" className="section-padding scroll-mt-24" aria-labelledby="rek-samorzad-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className={styles.councilHead}>
              <div>
                <h2 id="rek-samorzad-heading" className={styles.h2}>
                  {t("councilHeading")}
                </h2>
                <p className={styles.lead}>{t("councilLead")}</p>
              </div>
              {hrLead ? (
                <ContactCard
                  label={t("councilContact")}
                  name={hrLead.name}
                  role={tb("roles.hr")}
                  email={hrLead.email}
                  photo={hrLead.photo}
                />
              ) : null}
            </div>
          </ScrollReveal>

          {/* Rekrutacja do komisji: dwie edycje w roku, trzy etapy (decyzja Samorządu, 2.11.2026). */}
          <h3 className={styles.h3}>{t("councilProcessHeading")}</h3>
          <ol className={styles.steps}>
            {(["form", "interview", "case"] as const).map((step, i) => (
              <li key={step} className={styles.step}>
                <span className={styles.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <p className="font-semibold text-ink-primary">{t(`councilProcess.${step}.title`)}</p>
                <p className="mt-1 text-[0.9375rem] leading-[1.6] text-ink-secondary">{t(`councilProcess.${step}.desc`)}</p>
              </li>
            ))}
          </ol>

          {council.length > 0 ? (
            <ul className={styles.councilList}>
              {council.map((r) => (
                <li key={r.title.pl} className={styles.councilItem}>
                  <div className="min-w-0">
                    <h3 className="text-[1.25rem] font-semibold tracking-[-0.01em] text-ink-primary">{r.title[loc]}</h3>
                    {r.desc ? <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-[1.65] text-ink-secondary">{r.desc[loc]}</p> : null}
                    {r.deadline ? (
                      <p className="mt-3 font-mono text-[0.8125rem] text-ink-secondary">
                        {t("deadlineLabel")}: {fmt(r.deadline)}
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
                    </a>
                  </div>
                </li>
              ))}
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
          )}
        </div>
      </section>

      {/* ── Dwie edycje rekrutacji do komisji: zdjęcia rekruterów + krótki opis (bez imion). ── */}
      <section className="section-padding pt-0" aria-labelledby="rek-edycje-heading">
        <div className="mx-auto max-w-[1200px]">
          <h2 id="rek-edycje-heading" className={styles.h2}>
            {t("editionsHeading")}
          </h2>
          <p className={styles.lead}>{t("editionsLead")}</p>
          <div className={styles.editions}>
            {(["autumn", "spring"] as const).map((edition) => (
              <article key={edition} className={styles.edition}>
                {recruiterPhotos[edition].length > 0 ? (
                  <div className={styles.editionPhotos} data-count={Math.min(recruiterPhotos[edition].length, 3)}>
                    {recruiterPhotos[edition].slice(0, 3).map((src) => (
                      <span key={src} className={styles.editionPhoto}>
                        <Image src={src} alt={t("editionPhotoAlt", { edition: t(`editions.${edition}.title`) })} fill sizes="(min-width: 768px) 560px, 100vw" quality={90} className="object-cover" />
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className={styles.editionBody}>
                  <h3 className="font-display text-[1.375rem] font-semibold text-ink-primary">{t(`editions.${edition}.title`)}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-[1.65] text-ink-secondary">{t(`editions.${edition}.desc`)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zespoły projektów ── */}
      <section id="projekty" className={`${styles.projectsSection} scroll-mt-24`} aria-labelledby="rek-projekty-heading">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
          <ScrollReveal>
            <h2 id="rek-projekty-heading" className={styles.h2Inverse}>
              {t("projectsHeading")}
            </h2>
            <p className={styles.leadInverse}>{t("projectsLead")}</p>
          </ScrollReveal>

          {/* Uproszczony proces dotyczy zespołów projektowych: przewodnik → odpowiedzi → mail. */}
          <h3 className={styles.h3Inverse}>{t("howHeading")}</h3>
          <ol className={styles.steps}>
            {(["guide", "answer", "send"] as const).map((step, i) => (
              <li key={step} className={`${styles.step} ${styles.stepInverse}`}>
                <span className={styles.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <p className="font-semibold text-white">{t(`how.${step}.title`)}</p>
                <p className="mt-1 text-[0.9375rem] leading-[1.6] text-white/72">{t(`how.${step}.desc`, { email: APPLY_EMAIL })}</p>
              </li>
            ))}
          </ol>

          {projects.length > 0 ? (
            <ul className={styles.projectGrid}>
              {projects.map((r, i) => {
                const name = r.project ? PROJECT_NAMES[r.project] : undefined;
                const cover = r.project && projectPhotosAreAuthentic(r.project) ? projectPhotos(r.project)[0] : undefined;
                const left = r.deadline ? daysBetween(today, r.deadline) : undefined;
                return (
                  <li key={r.title.pl + i} className={styles.projectCard} style={{ "--i": i } as CSSProperties}>
                    {cover ? (
                      <div className={styles.projectPhoto}>
                        <Image src={cover} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
                      </div>
                    ) : null}
                    <div className={styles.projectBody}>
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
                            <span className="sr-only"> {r.title[loc]} ({t("newTab")})</span>
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
          )}

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 text-[0.9375rem] text-white/80">
            {projectsLead ? (
              <ContactCard
                tone="dark"
                label={t("projectsContact")}
                name={projectsLead.name}
                role={tp("roles.projects")}
                email={projectsLead.email}
                photo={projectsLead.photo}
                className="w-full sm:w-auto"
              />
            ) : null}
            {recruitmentDrive ? (
              <a href={recruitmentDrive} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold text-white">
                <FolderOpen size={18} aria-hidden="true" />
                {t("materialsButton")}
                <span className="sr-only"> ({t("newTab")})</span>
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
