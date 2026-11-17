import Image from "next/image";
import { useTranslations } from "next-intl";
import { FolderOpen } from "@phosphor-icons/react/ssr";
import { ScrollReveal } from "../ScrollReveal";
import { APPLY_EMAIL, recruiterPhotos, recruitmentDrive, recruitmentGallery, type Recruitment } from "@/lib/recruitment";
import { board, viceChairs } from "@/lib/people";
import { ContactCard } from "../ContactCard";
import { NaboryDoSamorzadu, NaboryProjektow, PasekNaborow } from "./RekrutacjaNabory";
import styles from "./Rekrutacja.module.css";

/**
 * Rekrutacja w dwóch częściach (decyzja z 1.11.2026): nabory do Samorządu
 * i do zespołów projektów. Dane z zakładki „Rekrutacje” w arkuszu Treści
 * strony; nabór po terminie znika sam. Część projektowa jest celowo mniej
 * urzędowa: duża nazwa projektu, zdjęcie z wydarzenia i licznik dni.
 */
const projectsLead = viceChairs.find((p) => p.roleKey === "projects");
/** Rekrutacja do Samorządu podlega Członkini Zarządu ds. Human Resources. */
const hrLead = board.find((p) => p.roleKey === "hr");

export function RekrutacjaContent({ items, serverToday }: { items: Recruitment[]; serverToday: string }) {
  const t = useTranslations("rekrutacja");
  const tb = useTranslations("board");
  const tp = useTranslations("przewodniczacy");

  return (
    <>
      {/* ── Trwają nabory: pasek tylko wtedy, gdy coś jest otwarte. Każdy nabór
          to skrót do swojej karty - do Samorządu u góry, do projektów niżej. ── */}
      <PasekNaborow items={items} serverToday={serverToday} />

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

          <NaboryDoSamorzadu items={items} serverToday={serverToday} />
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

          {recruitmentGallery.length > 0 ? (
            <>
              <h3 className={`${styles.h3} mt-14`}>{t("galleryHeading")}</h3>
              <div className={styles.gallery}>
                {recruitmentGallery.map((row) => (
                  <ul key={row[0].src} className={styles.galleryRow}>
                    {row.map((g) => (
                      // Szerokość w proporcji do kształtu zdjęcia: cały wiersz ma jedną wysokość.
                      <li key={g.src} className={styles.galleryItem} style={{ flexGrow: g.w / g.h, aspectRatio: `${g.w} / ${g.h}` }}>
                        <Image src={g.src} alt={t(`gallery.${g.key}`)} fill sizes={`(min-width: 768px) ${Math.round((1200 * g.w) / g.h / row.reduce((s, x) => s + x.w / x.h, 0))}px, 100vw`} className="object-cover" />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </>
          ) : null}
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

          <NaboryProjektow items={items} serverToday={serverToday} />

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
