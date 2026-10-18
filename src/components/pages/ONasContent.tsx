"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { StructureMap } from "./onas/StructureMap";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { chair, viceChairs, board } from "@/lib/people";
import { recruitments } from "@/lib/recruitment";
import styles from "./ONas.module.css";

/**
 * Treść strony „O nas”.
 *
 * Każda sekcja odpowiada na inne pytanie i ma inny układ, żeby strona nie
 * była kolejną siatką jednakowych kafli:
 *  - hero: teza + zdjęcie ludzi (Samorząd to ludzie, nie schemat),
 *  - „Co robimy”: trzy wiersze z czasownikiem, treścią i kadrem,
 *  - „Jak jesteśmy zbudowani”: niebieski pas, w którym każdy organ jest
 *    opisany czasownikiem — co robi, a nie tylko jak się nazywa,
 *  - ludzie obecnej kadencji, dokumenty, zaproszenie do działania.
 *
 * Ton mieszany (decyzja z 18.10.2026): opis Samorządu po ludzku, nazwy
 * organów i ich role formalnie.
 */

const work = [
  {
    key: "represent",
    photo: "/photos/hero/03.webp",
    links: [
      { key: "russ", href: "/rada-uczelniana-samorzadu-studentow" },
      { key: "regulacje", href: "/regulacje-wewnetrzne" },
    ],
  },
  {
    key: "help",
    photo: "/photos/hero/inne_1.webp",
    links: [
      { key: "strefa", href: "/dla-studenta" },
      { key: "rzecznik", href: "/rzecznik-praw-studenta" },
    ],
  },
  {
    key: "create",
    photo: "/photos/projekty/bal/cover.webp",
    links: [
      { key: "projekty", href: "/nasze-projekty" },
      { key: "fue", href: "/fue-i-psrp" },
    ],
  },
] as const;

const docs = [
  { key: "regulacje", href: "/regulacje-wewnetrzne" },
  { key: "zarzadzenia", href: "/zarzadzenia-przewodniczacego" },
  { key: "transparentnosc", href: "/transparentnosc" },
] as const;

export function ONasContent() {
  const t = useTranslations("oNas");
  const tc = useTranslations("common");
  const tPrez = useTranslations("przewodniczacy");
  const tBoard = useTranslations("board");
  const hasOpenRecruitment = recruitments.length > 0;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="onas-title">
        <div className={styles.container}>
          <Breadcrumbs
            items={[
              { label: tc("home"), href: "/" },
              { label: t("crumb") },
            ]}
          />
          <div className={styles.heroGrid}>
            {/* Słowa wysuwają się spod maski jedno po drugim. Czytnik dostaje
                całe zdanie z aria-label, nie sześć osobnych kawałków. */}
            <h1 id="onas-title" className={styles.heroTitle} aria-label={t("heroTitle")}>
              {t("heroTitle")
                .split(" ")
                .map((word, i) => (
                  // Spacja POZA blokiem słowa: wewnątrz inline-blocku jest
                  // ucinana i słowa się zlewały („towszyscy”).
                  <Fragment key={i}>
                    <span className={styles.word} aria-hidden="true">
                      <span style={{ "--w": i } as CSSProperties}>{word}</span>
                    </span>{" "}
                  </Fragment>
                ))}
            </h1>
            <div>
              <p className={styles.heroLead}>{t("heroLead")}</p>
              <ul className={styles.facts}>
                <li>{t("facts.since")}</li>
                <li>{t("facts.campuses")}</li>
                <li>{t("facts.office")}</li>
              </ul>
            </div>
          </div>
        </div>

        <figure className={styles.heroFigure}>
          <div className={styles.heroFrame}>
            <Image
              src="/photos/projekty/dni/cover.webp"
              alt=""
              fill
              preload
              sizes="(max-width: 1440px) 100vw, 1440px"
              className={styles.heroImage}
            />
          </div>
          <figcaption className={styles.caption}>{t("photoCaption")}</figcaption>
        </figure>
      </section>

      {/* ── Co robimy ────────────────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="onas-work">
        <div className={styles.container}>
          <h2 id="onas-work" className={styles.sectionTitle}>
            {t("work.heading")}
          </h2>

          {/*
            Na dużym ekranie: tekst przewija się po lewej, a po prawej stoi
            przyklejona scena, w której zdjęcia przenikają się w rytm tego,
            który wiersz jest właśnie na środku. Każdy wiersz wystawia własną
            oś przewijania (--w-*), scena czyta je przez timeline-scope.
            Bez obsługi osi przewijania zostają zdjęcia w wierszach.
          */}
          <div className={styles.workScroller}>
            <div className={styles.workList}>
              {work.map((item) => (
                <article key={item.key} className={`${styles.workRow} ${styles[`row_${item.key}`]}`}>
                  <h3 className={styles.workVerb}>{t(`work.${item.key}.title`)}</h3>
                  <div className={styles.workBody}>
                    <p>{t(`work.${item.key}.body`)}</p>
                    <ul className={styles.workLinks}>
                      {item.links.map((link) => (
                        <li key={link.key}>
                          <Link href={link.href} className={styles.textLink}>
                            {t(`work.links.${link.key}`)}
                            <ArrowRight size={16} weight="bold" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.workPhoto}>
                    <Image
                      src={item.photo}
                      alt={t(`work.${item.key}.photoAlt`)}
                      fill
                      sizes="(max-width: 1023px) 100vw, 300px"
                      className={styles.cover}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.workStage} aria-hidden="true">
              {work.map((item) => (
                <div key={item.key} className={`${styles.stagePhoto} ${styles[`stage_${item.key}`]}`}>
                  <Image
                    src={item.photo}
                    alt=""
                    fill
                    sizes="(max-width: 1440px) 40vw, 560px"
                    className={styles.cover}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Struktura ────────────────────────────────────────────────── */}
      <section id="struktura" className={styles.organs} aria-labelledby="onas-structure">
        <div className={styles.container}>
          <div className={styles.organsIntro}>
            <h2 id="onas-structure" className={styles.organsTitle}>
              {t("structure.heading")}
            </h2>
            <p className={styles.organsLead}>{t("structure.lead")}</p>
          </div>

          <StructureMap />
        </div>
      </section>

      {/* ── Ludzie ───────────────────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="onas-people">
        <div className={styles.container}>
          <div className={styles.peopleHead}>
            <h2 id="onas-people" className={styles.sectionTitle}>
              {t("people.heading")}
            </h2>
            <p className={styles.term}>{t("people.term")}</p>
          </div>

          <div className={styles.peopleGrid}>
            <div className={styles.chair}>
              <p className={styles.peopleLabel}>{t("people.chairLabel")}</p>
              <p className={styles.chairName}>{chair.name}</p>
              <p className={styles.personRole}>{tPrez("chairRole")}</p>
            </div>

            <div>
              <p className={styles.peopleLabel}>{t("people.viceLabel")}</p>
              <ul className={styles.personList}>
                {viceChairs.map((person) => (
                  <li key={person.name}>
                    <span className={styles.personName}>{person.name}</span>
                    <span className={styles.personRole}>{tPrez(`roles.${person.roleKey}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.boardBlock}>
              <p className={styles.peopleLabel}>{t("people.boardLabel")}</p>
              <ul className={`${styles.personList} ${styles.boardList}`}>
                {board.map((person) => (
                  <li key={person.name}>
                    <span className={styles.personName}>{person.name}</span>
                    <span className={styles.personRole}>{tBoard(`roles.${person.roleKey}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link href="/zarzad" className={`${styles.textLink} ${styles.peopleMore}`}>
            {t("people.all")}
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Dokumenty ────────────────────────────────────────────────── */}
      <section className={styles.docs} aria-labelledby="onas-docs">
        <div className={`${styles.container} ${styles.docsGrid}`}>
          <div>
            <h2 id="onas-docs" className={styles.sectionTitle}>
              {t("docs.heading")}
            </h2>
            <p className={styles.docsLead}>{t("docs.lead")}</p>
          </div>
          <ul className={styles.docList}>
            {docs.map((doc) => (
              <li key={doc.key}>
                <Link href={doc.href} className={styles.docLink}>
                  <span>
                    <span className={styles.docName}>{t(`docs.${doc.key}`)}</span>
                    <span className={styles.docDesc}>{t(`docs.${doc.key}Desc`)}</span>
                  </span>
                  <ArrowUpRight size={20} weight="bold" aria-hidden="true" className={styles.docArrow} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Dołącz ───────────────────────────────────────────────────── */}
      <section className={styles.join} aria-labelledby="onas-join">
        <div className={styles.container}>
          <h2 id="onas-join" className={styles.joinTitle}>
            {t("join.heading")}
          </h2>
          <p className={styles.joinBody}>{t("join.body")}</p>
          <div className={styles.joinActions}>
            {hasOpenRecruitment && (
              <Link href="/rekrutacja" className={styles.button}>
                {t("join.ctaOpen")}
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </Link>
            )}
            <Link
              href="/kontakt"
              className={hasOpenRecruitment ? styles.textLink : styles.button}
            >
              {t("join.cta")}
              <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
