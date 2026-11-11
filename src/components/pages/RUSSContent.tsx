"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, CaretDown, DownloadSimple } from "@phosphor-icons/react";
import { SectionRail } from "../SectionRail";
import Image from "next/image";
import { russMembers as members, russPhotos } from "@/lib/people";
import { InitialsAvatar } from "../InitialsAvatar";
import { todayInWarsaw, type RussMeeting, type RussResolution } from "@/lib/russ";
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

/** Ile uchwał widać od razu; reszta pod „Pokaż wszystkie”. */
const RESOLUTIONS_VISIBLE = 6;

interface RUSSContentProps {
  /** Z zakładki „Posiedzenia RUSS”, od najwcześniejszego. */
  meetings: RussMeeting[];
  /** Z zakładki „Uchwały RUSS”, od najnowszej. */
  resolutions: RussResolution[];
  /** Data z serwera (strefa Polski) - pierwszy podział na najbliższe i minione. */
  serverToday: string;
}

export function RUSSContent({ meetings, resolutions, serverToday }: RUSSContentProps) {
  const t = useTranslations("russ");
  const tc = useTranslations("common");
  const locale = useLocale();
  const lang = locale === "en" ? "en-GB" : "pl-PL";
  const loc = locale === "en" ? "en" : "pl";

  const competencies = t.raw("competencies") as string[];
  const rights = t.raw("rights") as { title: string; body: string; ref: string }[];

  const filled = Math.min(members.length, MANDATES);
  const [hot, setHot] = useState<number | null>(null);

  // Bieżący miesiąc dopiero po stronie przeglądarki: strona jest budowana
  // statycznie, więc data z serwera byłaby datą budowania, nie dzisiejszą.
  const [month, setMonth] = useState<number | null>(null);
  // Strona odświeża się co najwyżej co godzinę, więc data z serwera może być
  // wczorajsza; przeglądarka poprawia ją po załadowaniu.
  const [today, setToday] = useState(serverToday);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMonth(new Date().getMonth());
      setToday(todayInWarsaw());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const monthName = (m: number) =>
    new Intl.DateTimeFormat(lang, { month: "short" }).format(new Date(2026, m, 15)).replace(".", "");
  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(`${d}T12:00:00`),
    );
  // Pasek miesięcy pokazuje tylko bieżący rok akademicki (październik-wrzesień).
  const [ty, tm] = today.split("-").map(Number);
  const yearStart = `${tm >= 10 ? ty : ty - 1}-10-01`;
  const yearEnd = `${tm >= 10 ? ty + 1 : ty}-09-30`;
  const upcoming = meetings.filter((m) => m.date >= today);
  const protocols = meetings.filter((m) => m.date < today && m.protocolHref).reverse();
  const shownResolutions = resolutions.slice(0, RESOLUTIONS_VISIBLE);
  const [showAllResolutions, setShowAllResolutions] = useState(false);
  const resolutionsPanel = useRef<HTMLDivElement>(null);
  // Zwinięcie długiej listy zostawiłoby czytelnika daleko pod panelem -
  // wracamy do jego nagłówka, ale tylko gdy ten zniknął z ekranu.
  const toggleResolutions = () => {
    if (showAllResolutions) {
      const top = resolutionsPanel.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resolutionsPanel.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }
    setShowAllResolutions((v) => !v);
  };
  const moreResolutions = resolutions.slice(RESOLUTIONS_VISIBLE);
  const hasRegister = resolutions.length > 0 || protocols.length > 0;

  const meetingsByMonth = new Map<number, number[]>();
  for (const m of meetings.filter((x) => x.date >= yearStart && x.date <= yearEnd)) {
    const date = new Date(`${m.date}T12:00:00`);
    const list = meetingsByMonth.get(date.getMonth()) ?? [];
    list.push(date.getDate());
    meetingsByMonth.set(date.getMonth(), list);
  }

  const folder = docManifest.russResolutions;
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
                      <span className={styles.memberPhoto} aria-hidden={name ? undefined : "true"}>
                        {name && russPhotos[name] ? (
                          <Image src={russPhotos[name]} alt={name} fill sizes="64px" className="object-cover" />
                        ) : name ? (
                          <InitialsAvatar name={name} size={64} />
                        ) : null}
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
                {upcoming.length === 0 ? <p className={styles.chip}>{t("meetingsStatus")}</p> : null}
              </div>
              {upcoming.length > 0 ? (
                <ul className={styles.meetingList}>
                  {upcoming.map((m) => (
                    <li key={m.date + (m.time ?? "")}>
                      <span className={styles.meetingDate}>
                        <time dateTime={m.time ? `${m.date}T${m.time}` : m.date}>
                          {fmtDate(m.date)}
                          {m.time ? `, ${t("timeAt", { time: m.time })}` : ""}
                        </time>
                        {m.extraordinary ? <span className={styles.tag}>{t("extraordinary")}</span> : null}
                      </span>
                      {m.place ? <span className={styles.meetingNote}>{m.place[loc]}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.panelBody}>{t("meetingsSoon")}</p>
              )}
            </div>

            <div id="uchwaly" ref={resolutionsPanel} className={`${styles.panel} scroll-mt-24`}>
              <div className={styles.panelHead}>
                <h3 className={styles.h3}>{t("resolutionsTitle")}</h3>
                {!hasRegister && !folder?.href ? <p className={styles.chip}>{tc("comingSoon")}</p> : null}
              </div>
              {resolutions.length > 0 ? (
                <>
                  <p className={styles.subhead}>{t("resolutionsLabel")}</p>
                  <ul className={styles.docList}>
                    {shownResolutions.map((r) => (
                      <ResolutionItem key={r.number} r={r} loc={loc} fmtDate={fmtDate} newTab={tc("newTab")} />
                    ))}
                  </ul>
                  {moreResolutions.length > 0 ? (
                    <>
                      {/* Reszta listy rozwija się POD widocznymi uchwałami, a przycisk
                          jedzie na jej koniec i zmienia się w „Zwiń” - jak <details>
                          zostawiał „Pokaż wszystkie” nad rozwiniętą listą, wyglądało
                          to, jakby nic się nie stało. */}
                      <ul id="russ-more-resolutions" className={styles.docList} hidden={!showAllResolutions}>
                        {moreResolutions.map((r) => (
                          <ResolutionItem key={r.number} r={r} loc={loc} fmtDate={fmtDate} newTab={tc("newTab")} />
                        ))}
                      </ul>
                      <button
                        type="button"
                        className={styles.moreToggle}
                        aria-expanded={showAllResolutions}
                        aria-controls="russ-more-resolutions"
                        onClick={toggleResolutions}
                      >
                        {showAllResolutions ? t("showLess") : t("showAll", { count: resolutions.length })}
                        <CaretDown size={16} weight="bold" aria-hidden="true" className={styles.moreCaret} />
                      </button>
                    </>
                  ) : null}
                </>
              ) : null}
              {protocols.length > 0 ? (
                <>
                  <p className={styles.subhead}>{t("protocolsLabel")}</p>
                  <ul className={styles.docList}>
                    {protocols.map((m) => (
                      <li key={m.date + (m.time ?? "")}>
                        <a href={m.protocolHref} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                          <span>{t("protocolItem", { date: fmtDate(m.date) })}</span>
                          <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0" />
                          <span className="sr-only"> ({tc("newTab")})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {folder?.href ? (
                <a
                  href={folder.href}
                  {...(folder.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={styles.panelLink}
                >
                  {t("resolutionsLink")}
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                  {folder.external ? <span className="sr-only"> ({tc("newTab")})</span> : null}
                </a>
              ) : null}
              {!hasRegister && !folder?.href ? <p className={styles.panelBody}>{t("resolutionsSoon")}</p> : null}
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

function ResolutionItem({
  r,
  loc,
  fmtDate,
  newTab,
}: {
  r: RussResolution;
  loc: "pl" | "en";
  fmtDate: (d: string) => string;
  newTab: string;
}) {
  const body = (
    <>
      <span className="min-w-0">
        <span className={styles.docMeta}>
          {r.number} · {fmtDate(r.date)}
        </span>
        <span className={styles.docTitle}>{r.title[loc]}</span>
      </span>
      {r.href ? <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0" /> : null}
    </>
  );
  return (
    <li>
      {r.href ? (
        <a href={r.href} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
          {body}
          <span className="sr-only"> ({newTab})</span>
        </a>
      ) : (
        <div className={styles.docLink} data-static="true">
          {body}
        </div>
      )}
    </li>
  );
}
