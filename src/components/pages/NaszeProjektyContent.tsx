"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowSquareOut } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { projectPhotos, projectPhotosAreAuthentic } from "@/lib/photos";

type ProjectType = "start" | "impact" | "community" | "learning" | "ceremony" | "mobility" | "knowledge" | "ideas" | "culture";

interface Project {
  key: string;
  name: string;
  type: ProjectType;
  socials: string[];
}

const projects: Project[] = [
  { key: "adapciak", name: "Adapciak", type: "start", socials: ["Instagram", "Facebook"] },
  { key: "animalia", name: "Animalia", type: "impact", socials: ["Instagram", "Facebook", "TikTok"] },
  { key: "bal", name: "Bal UEW", type: "community", socials: [] },
  { key: "dni", name: "Dni Adaptacyjne", type: "learning", socials: [] },
  { key: "graduetion", name: "GradUEtion", type: "ceremony", socials: [] },
  { key: "mosty", name: "Mosty Ekonomiczne", type: "mobility", socials: ["Instagram", "Facebook", "TikTok"] },
  { key: "test", name: "Test Wiedzy Ekonomicznej", type: "knowledge", socials: ["Facebook"] },
  { key: "tedx", name: "TEDxUEW", type: "ideas", socials: ["Instagram", "Facebook", "LinkedIn", "TikTok"] },
  { key: "party", name: "UE Party", type: "culture", socials: ["Instagram", "Facebook", "TikTok"] },
];

const recruitmentUrl = "https://drive.google.com/drive/folders/1Zrt8yenJUbDs1GcVHJJkbgr-zxNPm2wx?usp=sharing";

export function NaszeProjektyContent() {
  const reduce = useReducedMotion();
  const t = useTranslations("naszeProjekty");
  return (
    <>
      <section className="section-padding pb-16" aria-labelledby="projekty-lista-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 border-b border-border-medium pb-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end lg:gap-20">
            <div>
              <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.13em] text-accent">
                {t("eyebrow")}
              </p>
              <h2
                id="projekty-lista-heading"
                className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2.4rem,5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink-primary"
              >
                {t("heading")}
              </h2>
              <p className="mt-6 max-w-[67ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
                {t("intro")}
              </p>
            </div>
            <div className="border-y border-border-medium py-5">
              <span className="font-display text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-none text-accent tabular-nums">09</span>
              <p className="mt-3 max-w-[25ch] text-[0.75rem] leading-[1.6] text-ink-secondary">{t("countLabel")}</p>
            </div>
          </div>

          <div>
            {projects.map((project, index) => {
              const photos = projectPhotos(project.key);
              // Zastępczy kadr z hero to prawdziwe zdjęcie Samorządu, ale nie
              // z TEGO wydarzenia — wtedy ani opis alternatywny, ani podpis nie
              // mogą twierdzić, że przedstawia jego uczestników.
              const authentic = projectPhotosAreAuthentic(project.key);
              const cover = photos[0];
              const detail = photos[1];
              const reverse = index % 2 === 1;

              return (
                <article
                  id={`projekt-${project.key}`}
                  key={project.key}
                  className="project-story grid scroll-mt-24 gap-9 border-b border-border-medium py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-center lg:gap-16 lg:py-24"
                >
                  <motion.figure
                    whileHover={reduce ? undefined : { y: -4 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`project-media relative min-w-0 ${reverse ? "lg:order-2" : ""}`}
                  >
                    {cover ? (
                      <div className="project-photo-frame relative aspect-[4/3] overflow-hidden bg-bg-elevated">
                        <Image
                          src={cover}
                          alt={
                            authentic
                              ? t("photoAlt", { project: project.name })
                              : t("photoAltGeneric")
                          }
                          fill
                          sizes="(max-width: 1024px) 100vw, 62vw"
                          className={`project-photo project-photo-${project.key} object-cover`}
                        />
                        <span className="project-photo-wash pointer-events-none absolute inset-0" aria-hidden="true" />
                      </div>
                    ) : (
                      <div className={`project-poster project-poster-${(index % 3) + 1} relative flex aspect-[4/3] overflow-hidden p-6 sm:p-9`} aria-hidden="true">
                        <span className="project-poster-index font-mono text-[0.6875rem] font-semibold tracking-[0.14em]">{String(index + 1).padStart(2, "0")} / 09</span>
                        <span
                          className={`project-poster-word mt-auto max-w-[10ch] font-display font-semibold leading-[0.82] tracking-[-0.055em] ${
                            project.key === "mosty" || project.key === "test"
                              ? "project-poster-word-long"
                              : "text-[clamp(2.6rem,7vw,6.5rem)]"
                          }`}
                        >
                          {project.name}
                        </span>
                      </div>
                    )}

                    {detail ? (
                      <div className={`absolute -bottom-8 ${reverse ? "-left-3 sm:-left-7" : "-right-3 sm:-right-7"} h-[44%] w-[34%] overflow-hidden border-[6px] border-bg-base bg-bg-elevated shadow-[0_20px_50px_rgba(20,35,70,0.18)]`}>
                        <Image src={detail} alt="" fill sizes="24vw" className="object-cover" />
                      </div>
                    ) : null}

                    <figcaption className="mt-3 flex items-center justify-between gap-4 font-mono text-[0.625rem] uppercase tracking-[0.11em] text-ink-tertiary">
                      <span>{authentic ? t("visualLabel") : t("visualLabelGeneric")}</span>
                      <span>{cover ? t("realPhoto") : t("photoReady")}</span>
                    </figcaption>
                  </motion.figure>

                  <div className={`${reverse ? "lg:order-1" : ""}`}>
                    <div className="flex items-center justify-between gap-6 border-b border-border-medium pb-4">
                      <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent">{t(`types.${project.type}`)}</p>
                      <span className="font-mono text-[0.6875rem] text-ink-tertiary tabular-nums">{String(index + 1).padStart(2, "0")} / 09</span>
                    </div>
                    <h3 className="mt-7 max-w-[11ch] text-balance font-display text-[clamp(2.35rem,4.6vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-ink-primary">{project.name}</h3>
                    <p className="mt-6 max-w-[58ch] text-pretty text-[0.9375rem] leading-[1.78] text-ink-secondary">{t(`projects.${project.key}.desc`)}</p>
                    <p className="mt-6 border-l-2 border-accent pl-5 text-[0.8125rem] font-medium leading-[1.65] text-ink-primary">{t(`projects.${project.key}.signature`)}</p>
                    {project.socials.length > 0 ? (
                      <p className="mt-7 text-[0.6875rem] leading-[1.6] text-ink-tertiary">
                        <span className="font-semibold text-ink-secondary">{t("channels")}: </span>
                        {project.socials.join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b1735] text-white" aria-labelledby="projects-join-heading">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-20 lg:py-20">
          <div>
            <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.13em] text-[#9eb1ff]">{t("joinEyebrow")}</p>
            <h2 id="projects-join-heading" className="mt-4 max-w-[17ch] text-balance font-display text-[clamp(2.2rem,4.8vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.04em]">{t("joinHeading")}</h2>
            <p className="mt-5 max-w-[62ch] text-[0.9375rem] leading-[1.75] text-white/72">{t("joinLead")}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <a href={recruitmentUrl} target="_blank" rel="noopener noreferrer" className="project-cta group inline-flex min-h-12 items-center justify-between gap-6 bg-white px-5 py-3 text-[0.8125rem] font-semibold text-[#0b1735]">
              {t("recruitmentCta")}<ArrowSquareOut size={18} weight="bold" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <Link href="/wspolpracuj-z-nami" className="project-cta group inline-flex min-h-12 items-center justify-between gap-6 border border-white/30 px-5 py-3 text-[0.8125rem] font-semibold text-white hover:bg-white/8">
              {t("partnerCta")}<ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
