"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react";
import { SectionRail } from "../SectionRail";
import { russMembers as members, russMeetings as meetings } from "@/lib/people";
import { documents as docManifest } from "@/lib/documents";
import { formatBytes } from "@/lib/docMeta";
import styles from "./RUSS.module.css";

/**
 * RUSS jako ORGAN KOLEGIALNY: ława mandatów, rytm obrad i prawa studenta.
 *
 * Dusza strony: Rada to nie piętnaście osobnych osób, tylko jedno ciało, które
 * głosuje. Dlatego skład jest pokazany jak schemat sali obrad - półkole 15
 * miejsc, z numerami odpowiadającymi liście nazwisk. Miejsca zajmują się po
 * kolei przy przewijaniu (CSS, view()), jak sala przed posiedzeniem, a
 * wskazanie nazwiska podświetla jego miejsce.
 *
 * Wszystkie liczby wynikają z danych albo z regulaminu, nie z wyobraźni:
 * - 15 miejsc: Regulamin organizacyjny RUSS, § 2 ust. 1;
 * - obsadzone miejsca: długość listy w people.ts (braki = wakaty);
 * - kworum: większość regulaminowego składu, § 2 ust. 3;
 * - miesiące obrad: „co najmniej raz w miesiącu, poza lipcem, sierpniem i
 *   wrześniem", § 2 ust. 8.
 */

const MANDATES = 15;
const QUORUM = Math.floor(MANDATES / 2) + 1;

/**
 * Dwa rzędy ławy: 7 + 8 = 15. Przy tak małej sali gęste dwa rzędy czytają się
 * jak sala obrad; trzy rzadkie rozsypywały się w przypadkowe kropki.
 * Promienie w jednostkach viewBox.
 */
const ROWS = [
  { seats: 7, radius: 118 },
  { seats: 8, radius: 172 },
];
const SEAT_R = 20;
const CX = 200;
const CY = 196;

interface Seat {
  x: number;
  y: number;
}

/**
 * Pozycje miejsc w półkolu, ponumerowane od lewej do prawej po kącie - tak
 * numeruje się miejsca na schematach parlamentarnych. Liczone deterministycznie,
 * więc serwer i przeglądarka renderują to samo.
 */
const SEATS: Seat[] = ROWS.flatMap(({ seats, radius }) =>
  Array.from({ length: seats }, (_, k) => {
    const angle = Math.PI - (k * Math.PI) / (seats - 1);
    return {
      angle,
      x: Math.round((CX + radius * Math.cos(angle)) * 10) / 10,
      y: Math.round((CY - radius * Math.sin(angle)) * 10) / 10,
    };
  }),
)
  .sort((a, b) => b.angle - a.angle || a.x - b.x)
  .map(({ x, y }) => ({ x, y }));

/** Rok akademicki: od października do września (indeksy miesięcy JS). */
const ACADEMIC_MONTHS = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const BREAK_MONTHS = new Set([6, 7, 8]);

const pad2 = (n: number) => String(n).padStart(2, "0");

export function RUSSContent() {
  const t = useTranslations("russ");
  const tc = useTranslations("common");
  const locale = useLocale();
  const lang = locale === "en" ? "en-GB" : "pl-PL";

  const competencies = t.raw("competencies") as string[];
  const rights = t.raw("rights") as { title: string; body: string; ref: string }[];

  const filled = Math.min(members.length, MANDATES);
  const [hot, setHot] = useState<number | null>(null);

  // Bieżący miesiąc dopiero po stronie przeglądarki: strona jest budowana
  // statycznie, więc data z serwera byłaby datą budowania, nie dzisiejszą.
  const [month, setMonth] = useState<number | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMonth(new Date().getMonth()));
    return () => cancelAnimationFrame(id);
  }, []);

  const monthName = (m: number) =>
    new Intl.DateTimeFormat(lang, { month: "short" }).format(new Date(2026, m, 15)).replace(".", "");
  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(`${d}T12:00:00`),
    );
  const meetingsByMonth = new Map<number, number[]>();
  for (const m of meetings) {
    const date = new Date(`${m.date}T12:00:00`);
    const list = meetingsByMonth.get(date.getMonth()) ?? [];
    list.push(date.getDate());
    meetingsByMonth.set(date.getMonth(), list);
  }

  const resolutions = docManifest.russResolutions;
  const regulation = docManifest.regulacje.russ;

  return (
    <>
      <SectionRail ids={["kompetencje", "sklad", "obrady"]} label={t("railLabel")} />

      {/* Kompetencje */}
      <section
        id="kompetencje"
        className="section-padding scroll-mt-20"
        aria-labelledby="russ-intro-heading"
      >
        <div className={`mx-auto max-w-[1200px] ${styles.intro}`}>
          <div>
            <h2 id="russ-intro-heading" className={styles.h2}>
              {t("introHeading")}
            </h2>
            <p className={styles.introBody}>{t("introBody")}</p>
          </div>
          <div>
            <p className={styles.listLabel}>{t("competenciesLabel")}</p>
            <ol className={styles.competencies}>
              {competencies.map((c, i) => (
                <li key={c}>
                  <span className={styles.compNo} aria-hidden="true">
                    {pad2(i + 1)}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Skład - ława */}
      <section
        id="sklad"
        className={`section-padding scroll-mt-20 ${styles.chamberSection}`}
        aria-labelledby="russ-members-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className={styles.chamberHead}>
            <h2 id="russ-members-heading" className={styles.h2}>
              {t("membersHeading")}
            </h2>
            <p className={styles.term}>{t("termEyebrow")}</p>
          </div>

          <div className={styles.chamberGrid}>
            <figure className={styles.chamber}>
              <svg
                viewBox="0 0 400 222"
                className={styles.chamberSvg}
                role="img"
                aria-label={t("chamberAlt", { total: MANDATES, filled })}
                onMouseLeave={() => setHot(null)}
              >
                {SEATS.map((seat, i) => {
                  const vacant = i >= filled;
                  return (
                    <g
                      key={i}
                      className={styles.seat}
                      data-vacant={vacant ? "true" : undefined}
                      data-hot={hot === i ? "true" : undefined}
                      style={{ "--i": i } as CSSProperties}
                      onMouseEnter={() => setHot(vacant ? null : i)}
                    >
                      <circle cx={seat.x} cy={seat.y} r={SEAT_R} />
                      <text x={seat.x} y={seat.y} dy="0.35em" textAnchor="middle">
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
                <text x={CX} y={CY - 6} textAnchor="middle" className={styles.chamberCount}>
                  {t("seatsFilled", { filled, total: MANDATES })}
                </text>
              </svg>
              <figcaption className={styles.chamberCaption}>
                <span className={styles.captionMain}>{t("seatsLabel")}</span>
                <span className={styles.captionQuorum}>{t("quorum", { quorum: QUORUM })}</span>
                <span className={styles.captionNote}>{t("quorumNote")}</span>
              </figcaption>
            </figure>

            <div>
              <ol className={styles.roster} onMouseLeave={() => setHot(null)}>
                {Array.from({ length: MANDATES }, (_, i) => {
                  const name = members[i];
                  return (
                    <li
                      key={i}
                      className={styles.member}
                      data-hot={hot === i ? "true" : undefined}
                      data-vacant={name ? undefined : "true"}
                      onMouseEnter={() => setHot(name ? i : null)}
                    >
                      <span className={styles.memberNo}>
                        <span className="sr-only">{t("seat", { n: i + 1 })}: </span>
                        <span aria-hidden="true">{pad2(i + 1)}</span>
                      </span>
                      <span className={styles.memberName}>{name ?? t("vacant")}</span>
                    </li>
                  );
                })}
              </ol>
              <p className={styles.footnote}>{t("footnote")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Obrady */}
      <section
        id="obrady"
        className="section-padding scroll-mt-20"
        aria-labelledby="russ-sessions-heading"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2 id="russ-sessions-heading" className={styles.h2}>
            {t("sessionsHeading")}
          </h2>

          <div className={styles.rhythm}>
            <div className={styles.rhythmHead}>
              <h3 className={styles.h3}>{t("rhythmTitle")}</h3>
              <p className={styles.rhythmBody}>{t("rhythmBody")}</p>
            </div>
            <ol className={styles.months}>
              {ACADEMIC_MONTHS.map((m, i) => {
                const off = BREAK_MONTHS.has(m);
                const days = meetingsByMonth.get(m);
                return (
                  <li
                    key={m}
                    className={styles.month}
                    data-break={off ? "true" : undefined}
                    data-now={month === m ? "true" : undefined}
                    style={{ "--i": i } as CSSProperties}
                  >
                    <span className={styles.monthName}>{monthName(m)}</span>
                    <span className={styles.monthBar} aria-hidden="true" />
                    <span className={styles.monthState}>
                      {off ? t("monthBreak") : t("monthSession")}
                      {month === m ? <span className={styles.nowTag}>{t("now")}</span> : null}
                    </span>
                    {days?.length ? (
                      <span className={styles.monthDays}>{days.sort((a, b) => a - b).join(", ")}</span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className={styles.sessionsGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3 className={styles.h3}>{t("meetingsHeading")}</h3>
                {meetings.length === 0 ? <p className={styles.chip}>{t("meetingsStatus")}</p> : null}
              </div>
              {meetings.length > 0 ? (
                <ul className={styles.meetingList}>
                  {meetings.map((m, i) => (
                    <li key={m.date + i}>
                      <span className={styles.meetingDate}>{fmtDate(m.date)}</span>
                      {m.note ? <span className={styles.meetingNote}>{m.note}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.panelBody}>{t("meetingsSoon")}</p>
              )}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3 className={styles.h3}>{t("resolutionsTitle")}</h3>
                {!resolutions?.href ? <p className={styles.chip}>{tc("comingSoon")}</p> : null}
              </div>
              {resolutions?.href ? (
                <a
                  href={resolutions.href}
                  {...(resolutions.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={styles.panelLink}
                >
                  {t("resolutionsLink")}
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                  {resolutions.external ? <span className="sr-only"> ({tc("newTab")})</span> : null}
                </a>
              ) : (
                <p className={styles.panelBody}>{t("resolutionsSoon")}</p>
              )}
              {regulation?.href ? (
                <a href={regulation.href} download className={styles.regLink}>
                  <DownloadSimple size={18} weight="regular" aria-hidden="true" />
                  {t("regulationLink")}
                  <span className={styles.regMeta}>
                    PDF{regulation.bytes ? ` · ${formatBytes(regulation.bytes, locale)}` : ""}
                  </span>
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.rights}>
            <h3 className={styles.h3}>{t("rightsHeading")}</h3>
            <ul className={styles.rightsList}>
              {rights.map((r) => (
                <li key={r.title}>
                  <p className={styles.rightTitle}>{r.title}</p>
                  <p className={styles.rightBody}>{r.body}</p>
                  <p className={styles.rightRef}>{r.ref}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
