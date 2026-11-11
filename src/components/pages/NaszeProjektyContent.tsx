import type { CSSProperties } from "react";
import Image from "next/image";
import { ContactCard } from "../ContactCard";
import { useTranslations } from "next-intl";
import { ArrowRight, FilePdf } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@/i18n/navigation";
import { projectCoverSize, projectGalleryPhotos, projectPhotos, projectPhotosAreAuthentic } from "@/lib/photos";
import { PhotoGallery } from "../PhotoGallery";
import { viceChairs } from "@/lib/people";
import styles from "./NaszeProjekty.module.css";

/**
 * Nasze projekty jako OPOWIEŚĆ O STUDIACH, nie katalog wydarzeń.
 *
 * Dusza strony: projekty Samorządu towarzyszą studentowi od obozu przed
 * pierwszym wykładem po rzut biretami. Dlatego kolejność to droga przez
 * studia (cztery etapy), a nie alfabet. Każdy projekt jest „sceną”: nazwa
 * wjeżdża na scenę, a kadr otwiera się z przewijaniem, tak że na ekranie
 * dominuje jedno zdjęcie naraz. Boczna ścieżka (desktop) pokazuje, na którym
 * etapie drogi jesteś. Finał, GradUEtion, wychodzi na całą szerokość ekranu.
 *
 * Miesiące i szczegóły programu pochodzą z one-pagerów projektów (przekazane
 * przez Samorząd 1.11.2026, public/dokumenty/projekty). Przy każdym projekcie
 * jest link do one-pagera - druga strona opisuje piony zespołu, co przydaje
 * się osobom, które myślą o rekrutacji.
 *
 * Komponent serwerowy: cały ruch robi CSS (animation-timeline: view() i
 * nazwane osie przewijania), więc treść jest kompletna w HTML z serwera.
 */

type ActKey = "start" | "people" | "beyond" | "finale";

interface Social {
  label: string;
  /** Adresy kont podane przez Samorząd 1.11.2026 (bez parametrów śledzących). */
  href?: string;
}

interface Project {
  key: string;
  name: string;
  socials: Social[];
  /** One-pager projektu w public/dokumenty/projekty. */
  onePager?: string;
}

const pdf = (key: string) => `/dokumenty/projekty/${key}-one-pager.pdf`;

interface Fact {
  k: string;
  v: string;
}

const acts: { key: ActKey; projects: Project[] }[] = [
  {
    key: "start",
    projects: [
      { key: "adapciak", name: "Adapciak", socials: [{ label: "Instagram", href: "https://www.instagram.com/adapciak.ue/" }, { label: "Facebook", href: "https://www.facebook.com/AdapciakUEW" }], onePager: pdf("adapciak") },
      { key: "dni", name: "Dni Adaptacyjne", socials: [{ label: "dni-adaptacyjne.uew.pl", href: "https://dni-adaptacyjne.uew.pl/pl" }], onePager: pdf("dni") },
    ],
  },
  {
    key: "people",
    projects: [
      { key: "party", name: "UE Party", socials: [{ label: "Instagram", href: "https://www.instagram.com/ue.party/" }, { label: "Facebook", href: "https://www.facebook.com/ueparty" }] },
      { key: "animalia", name: "Animalia", socials: [{ label: "Instagram", href: "https://www.instagram.com/animalia.uewroc/" }, { label: "Facebook", href: "https://www.facebook.com/animaliauewroc" }, { label: "TikTok", href: "https://www.tiktok.com/@animalia.uewroc" }], onePager: pdf("animalia") },
      { key: "bal", name: "Bal UEW", socials: [], onePager: pdf("bal") },
      {
        key: "juwenalia",
        name: "Juwenalia Wrocławskie",
        // Adresy ze strony Samorządu Studentów UWr (samorzadstudentow.uwr.edu.pl/en/juwenalia), 1.11.2026.
        socials: [
          { label: "Instagram", href: "https://www.instagram.com/juwenalia_wroclawskie" },
          { label: "Facebook", href: "https://www.facebook.com/JuwenaliaWroclawskie" },
          { label: "TikTok", href: "https://www.tiktok.com/@juwenaliawroclawskie" },
        ],
      },
    ],
  },
  {
    key: "beyond",
    projects: [
      { key: "mosty", name: "Mosty Ekonomiczne", socials: [{ label: "Instagram", href: "https://www.instagram.com/mosty_ekonomiczne.wro/" }, { label: "Facebook", href: "https://www.facebook.com/MostyEkonomiczneWroclaw" }], onePager: pdf("mosty") },
      { key: "test", name: "Test Wiedzy Ekonomicznej", socials: [{ label: "Facebook", href: "https://www.facebook.com/testwiedzyekonomicznej" }], onePager: pdf("test") },
      { key: "tedx", name: "TEDxUEW", socials: [{ label: "Instagram", href: "https://www.instagram.com/tedxuew/" }, { label: "Facebook", href: "https://www.facebook.com/profile.php?id=100089618902723" }, { label: "TikTok", href: "https://www.tiktok.com/@tedxuew" }], onePager: pdf("tedx") },
    ],
  },
  {
    key: "finale",
    projects: [{ key: "graduetion", name: "GradUEtion", socials: [], onePager: pdf("graduetion") }],
  },
];

const allProjects = acts.flatMap((act) => act.projects);
const TOTAL = String(allProjects.length).padStart(2, "0");
const numberOf = (key: string) =>
  String(allProjects.findIndex((p) => p.key === key) + 1).padStart(2, "0");

/** Nazwa osi przewijania sceny; ta sama nazwa steruje punktem na ścieżce. */
const timelineOf = (key: string) => `--p-${key}`;

/** Osoba od projektów w Samorządzie - kontakt w sekcji na dole strony. */
const projectsLead = viceChairs.find((person) => person.roleKey === "projects");

export function NaszeProjektyContent() {
  const t = useTranslations("naszeProjekty");
  const tPrez = useTranslations("przewodniczacy");
  const storyActs = acts.filter((act) => act.key !== "finale");
  const finale = acts.find((act) => act.key === "finale")!;

  // Punkty ścieżki leżą w <nav>, a sceny w treści obok. Żeby punkt mógł
  // słuchać osi przewijania swojej sceny, nazwy osi muszą być widoczne
  // u wspólnego przodka (timeline-scope).
  const scope = { "--scope": allProjects.map((p) => timelineOf(p.key)).join(", ") } as CSSProperties;

  return (
    <>
      <div className={styles.story} style={scope}>
        <div className={styles.layout}>
          <nav className={styles.rail} aria-label={t("railLabel")}>
            <ol className={styles.railActs}>
              {acts.map((act) => (
                <li key={act.key}>
                  <span className={styles.railAct}>{t(`acts.${act.key}.title`)}</span>
                  <ol>
                    {act.projects.map((project) => (
                      <li key={project.key}>
                        <a
                          href={`#projekt-${project.key}`}
                          className={styles.railLink}
                          style={{ "--tl": timelineOf(project.key) } as CSSProperties}
                        >
                          <span className={styles.dot} aria-hidden="true" />
                          {project.name}
                        </a>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </nav>

          <div className={styles.content}>
            <header className={styles.intro}>
              <h2 id="projekty-heading" className={styles.introTitle}>
                {t("heading")}
              </h2>
              <p className={styles.introLead}>{t("intro")}</p>
            </header>

            {storyActs.map((act) => (
              <section key={act.key} className={styles.act} aria-labelledby={`etap-${act.key}`}>
                <ActHead actKey={act.key} />
                {act.projects.map((project) => (
                  <Scene key={project.key} project={project} />
                ))}
              </section>
            ))}
          </div>
        </div>

        <section className={`${styles.act} ${styles.finale}`} aria-labelledby="etap-finale">
          <div className={styles.finaleInner}>
            <ActHead actKey="finale" />
            {finale.projects.map((project) => (
              <Scene key={project.key} project={project} finale />
            ))}
          </div>
        </section>
      </div>

      <section className={`${styles.join} border-y border-white/10 bg-[#0b1735] text-white`} aria-labelledby="projects-join-heading">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-20 lg:py-20">
          <div>
            <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#9eb1ff]">{t("joinEyebrow")}</p>
            <h2 id="projects-join-heading" className="mt-4 max-w-[17ch] text-balance font-display text-[clamp(2.2rem,4.8vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.04em]">{t("joinHeading")}</h2>
            <p className="mt-5 max-w-[62ch] text-[0.9375rem] leading-[1.75] text-white/72">{t("joinLead")}</p>
          </div>
          <div className="flex flex-col gap-6">
            {projectsLead ? (
              <ContactCard
                tone="dark"
                label={t("leadLabel")}
                name={projectsLead.name}
                role={tPrez("roles.projects")}
                email={projectsLead.email}
                photo={projectsLead.photo}
              />
            ) : null}
            <div className="flex flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              <Link href="/rekrutacja#projekty" className={`${styles.cta} group inline-flex min-h-12 items-center justify-between gap-6 rounded-lg bg-white px-5 py-3 text-[0.8125rem] font-semibold text-[#0b1735]`}>
                {t("recruitmentCta")}
                <ArrowRight size={18} weight="bold" className={styles.ctaIconNext} aria-hidden="true" />
              </Link>
              <Link href="/partnerzy#wspolpraca" className={`${styles.cta} group inline-flex min-h-12 items-center justify-between gap-6 rounded-lg border border-white/30 px-5 py-3 text-[0.8125rem] font-semibold text-white hover:bg-white/8`}>
                {t("partnerCta")}
                <ArrowRight size={18} weight="bold" className={styles.ctaIconNext} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ActHead({ actKey }: { actKey: ActKey }) {
  const t = useTranslations("naszeProjekty");
  return (
    <header className={styles.actHead}>
      <span className={styles.actRule} aria-hidden="true" />
      <h2 id={`etap-${actKey}`} className={styles.actTitle}>
        {t(`acts.${actKey}.title`)}
      </h2>
      <p className={styles.actLead}>{t(`acts.${actKey}.lead`)}</p>
    </header>
  );
}

function Scene({ project, finale = false }: { project: Project; finale?: boolean }) {
  const t = useTranslations("naszeProjekty");
  const cover = projectPhotos(project.key)[0];
  const size = projectCoverSize(project.key);
  // Zastępczy kadr z hero to prawdziwe zdjęcie Samorządu, ale nie z TEGO
  // wydarzenia, więc opis alternatywny nie może twierdzić, że przedstawia
  // jego uczestników.
  const authentic = projectPhotosAreAuthentic(project.key);
  const facts = t.raw(`projects.${project.key}.facts`) as Fact[];
  const gallery = projectGalleryPhotos(project.key);
  const nameId = `projekt-${project.key}-nazwa`;

  return (
    <article
      id={`projekt-${project.key}`}
      className={styles.scene}
      aria-labelledby={nameId}
      style={{ "--tl": timelineOf(project.key) } as CSSProperties}
    >
      <header className={styles.sceneHead}>
        <span className={styles.index} aria-hidden="true">
          {numberOf(project.key)}
          <span className={styles.indexTotal}> / {TOTAL}</span>
        </span>
        {/* Długie nazwy dostają mniejszy stopień - inaczej ostatnie litery
            spadały do nowej linii („Wrocławski|e”). */}
        <h3 id={nameId} className={styles.name} data-long={project.name.length > 14 || undefined}>
          {project.name}
        </h3>
        <p className={styles.tagline}>{t(`projects.${project.key}.signature`)}</p>
      </header>

      <div className={styles.media}>
        {cover ? (
          <div
            className={styles.frame}
            style={{ aspectRatio: size ? `${size.width} / ${size.height}` : "3 / 2" }}
          >
            <Image
              src={cover}
              alt={authentic ? t("photoAlt", { project: project.name }) : t("photoAltGeneric")}
              fill
              sizes={finale ? "100vw" : "(min-width: 1024px) calc(100vw - 340px), 100vw"}
              className={styles.photo}
            />
          </div>
        ) : (
          <div className={styles.poster} aria-hidden="true">
            <span>{project.name}</span>
          </div>
        )}
      </div>

      {gallery.length > 0 ? (
        <PhotoGallery
          label={t("galleryLabel", { project: project.name })}
          photos={gallery.map(({ altKey, ...photo }) => ({ ...photo, alt: t(`gallery.${altKey}`) }))}
        />
      ) : null}

      <div className={styles.body}>
        <p className={styles.desc}>{t(`projects.${project.key}.desc`)}</p>
        <div>
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.k} className={styles.fact}>
                <dt>{fact.k}</dt>
                <dd>{fact.v}</dd>
              </div>
            ))}
          </dl>
          {project.socials.length > 0 ? (
            <p className={styles.channels}>
              <span className={styles.channelsLabel}>{t("channels")}: </span>
              {project.socials.map((social, i) => (
                <span key={social.label}>
                  {i > 0 ? " · " : null}
                  {social.href ? (
                    <a href={social.href} target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
                      {social.label}
                      <span className="sr-only"> {project.name} ({t("newTab")})</span>
                    </a>
                  ) : (
                    social.label
                  )}
                </span>
              ))}
            </p>
          ) : null}
          {project.onePager ? (
            <a href={project.onePager} target="_blank" rel="noopener noreferrer" className={styles.onePager}>
              <FilePdf size={20} weight="regular" aria-hidden="true" />
              {t("onePager")}
              <span className="sr-only"> {project.name} ({t("newTab")})</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
