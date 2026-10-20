"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { Termin, TerminKind, ZamianaDnia } from "@/lib/terminy";
import { useTerminFormat } from "./terminy-ui";
import styles from "./KalendarzSiatka.module.css";

/**
 * Siatka miesięcy z terminami roku. Zwykłe dni zajęć zostają bez koloru -
 * cały semestr byłby wtedy jedną plamą. Kolor dostaje to, co odbiega od
 * normy: sesja, poprawka, przerwa, dzień wolny, termin wniosku, zamiana planu.
 *
 * Na szerokim ekranie dwa miesiące obok siebie, na wąskim jeden. Kliknięcie
 * dnia pokazuje pod siatką, co się wtedy dzieje (region aria-live).
 * Klawiatura: strzałki (dzień/tydzień), Home/End (tydzień), PageUp/PageDown
 * (miesiąc), Enter/spacja wybiera dzień.
 */

/** Co malujemy na dniu, gdy nachodzi kilka terminów - od najważniejszego. */
const PRIORITY: TerminKind[] = ["sesja", "poprawka", "wolne", "przerwa"];
const MARKERS: TerminKind[] = ["wniosek", "uroczystosc"];
const WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
/** Ten sam próg co w KalendarzSiatka.module.css (dwa miesiące obok siebie). */
const WIDE = "(min-width: 900px)";

function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function covers(t: Termin, date: string) {
  return t.start <= date && date <= (t.end ?? t.start);
}

function shiftDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Ten sam dzień miesiąca o `n` miesięcy dalej (31 stycznia → 28 lutego). */
function shiftMonths(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  const last = new Date(y, m - 1 + n + 1, 0).getDate();
  const t = new Date(y, m - 1 + n, Math.min(d, last));
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
}

/** Poniedziałek = 0. */
function weekdayIndex(date: string) {
  return (new Date(`${date}T12:00:00`).getDay() + 6) % 7;
}

interface MonthProps {
  year: number;
  month: number;
  terminy: Termin[];
  zamiany: Map<string, ZamianaDnia>;
  today: string | null;
  selected: string | null;
  /** Jedyny dzień w siatce osiągalny Tabem (reszta: strzałki). */
  tabbable: string;
  /** Podpowiedź o klawiszach dla czytników ekranu. */
  hintId: string;
  onSelect: (date: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, date: string) => void;
}

function Month({ year, month, terminy, zamiany, today, selected, tabbable, hintId, onSelect, onKeyDown }: MonthProps) {
  const t = useTranslations("kalendarz.terminy");
  const { fmt, locale } = useTerminFormat();
  const days = new Date(year, month + 1, 0).getDate();
  // Poniedziałek = 0 (getDay: niedziela = 0).
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const monthLabel = fmt(iso(year, month, 1), { month: "long", year: "numeric" });

  return (
    <table className={styles.month} aria-describedby={hintId}>
      <caption className={styles.caption}>{monthLabel}</caption>
      <thead>
        <tr>
          {WEEK.map((w, i) => (
            <th key={w} scope="col" abbr={fmt(iso(2026, 10, 2 + i), { weekday: "long" })}>
              {t(`weekdayShort.${w}`)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((d, di) => {
              if (d === null) return <td key={di} />;
              const date = iso(year, month, d);
              const on = terminy.filter((tm) => covers(tm, date));
              const kind = PRIORITY.find((k) => on.some((tm) => tm.kind === k));
              const marker = on.some((tm) => MARKERS.includes(tm.kind));
              const swap = zamiany.get(date);
              const weekend = di >= 5;
              const label = [
                fmt(date, { weekday: "long", day: "numeric", month: "long" }),
                ...on.filter((tm) => tm.kind !== "zajecia").map((tm) => tm.title[locale]),
                ...(swap ? [t("swapShort", { day: t(`weekday.${swap.weekday}`) })] : []),
              ].join(", ");
              return (
                <td key={di}>
                  <button
                    type="button"
                    className={styles.day}
                    data-kind={kind}
                    data-weekend={weekend || undefined}
                    data-today={date === today || undefined}
                    data-selected={date === selected || undefined}
                    aria-pressed={date === selected}
                    aria-label={label}
                    data-date={date}
                    tabIndex={date === tabbable ? 0 : -1}
                    onClick={() => onSelect(date)}
                    onKeyDown={(e) => onKeyDown(e, date)}
                  >
                    <span>{d}</span>
                    {marker && <i className={styles.dot} aria-hidden="true" />}
                    {swap && (
                      <i className={styles.swap} aria-hidden="true">
                        {t(`weekdayShort.${swap.weekday}`)}
                      </i>
                    )}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function KalendarzSiatka({
  terminy,
  zamiany,
  year,
  today,
}: {
  terminy: Termin[];
  zamiany: ZamianaDnia[];
  /** Rok akademicki (październik roku `year` - lipiec następnego). */
  year: number;
  today: number | null;
}) {
  const t = useTranslations("kalendarz.terminy");
  const { locale, fmt, range } = useTerminFormat();
  const todayIso = today === null ? null : isoLocal(today);

  // Indeks miesiąca w roku akademickim: 0 = październik, 9 = lipiec.
  const startIndex = (() => {
    if (today === null) return 0;
    const d = new Date(today);
    const idx = (d.getFullYear() - year) * 12 + d.getMonth() - 9;
    return Math.min(Math.max(idx, 0), 9);
  })();
  // Na szerokim ekranie widać dwa miesiące, więc ostatni krok to czerwiec-lipiec.
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => true);
  const last = wide ? 8 : 9;
  const [index, setIndex] = useState<number | null>(null);
  const current = Math.min(index ?? startIndex, last);
  const [selected, setSelected] = useState<string | null>(null);
  const swapMap = new Map(zamiany.map((z) => [z.date, z]));

  const monthAt = (i: number) => {
    const d = new Date(year, 9 + i, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  };
  const a = monthAt(current);
  const b = monthAt(Math.min(current + 1, 9));

  // Klawiatura (wzorzec APG „date picker”): do siatki prowadzi jeden Tab,
  // a po dniach chodzi się strzałkami - bez tego miesiąc to ~30 przystanków.
  const [focus, setFocus] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const moveFocus = useRef(false);
  const first = iso(year, 9, 1);
  const lastDay = iso(year + 1, 6, 31);
  const monthIndexOf = (date: string) => (Number(date.slice(0, 4)) - year) * 12 + Number(date.slice(5, 7)) - 1 - 9;
  const inView = (date: string | null): date is string => {
    if (date === null) return false;
    const i = monthIndexOf(date);
    return i === current || (wide && i === current + 1);
  };
  const tabbable = inView(focus) ? focus : inView(selected) ? selected : inView(todayIso) ? todayIso : iso(a.y, a.m, 1);

  useEffect(() => {
    if (!moveFocus.current || focus === null) return;
    moveFocus.current = false;
    // Na wąskim ekranie drugi miesiąc jest w DOM, ale ukryty - bierzemy widoczny.
    const target = [...(wrapRef.current?.querySelectorAll<HTMLButtonElement>(`button[data-date="${focus}"]`) ?? [])].find(
      (el) => el.offsetParent !== null,
    );
    target?.focus();
  }, [focus, current]);

  const onDayKey = (e: React.KeyboardEvent<HTMLButtonElement>, date: string) => {
    const wd = weekdayIndex(date);
    const next = (() => {
      switch (e.key) {
        case "ArrowLeft": return shiftDays(date, -1);
        case "ArrowRight": return shiftDays(date, 1);
        case "ArrowUp": return shiftDays(date, -7);
        case "ArrowDown": return shiftDays(date, 7);
        case "Home": return shiftDays(date, -wd);
        case "End": return shiftDays(date, 6 - wd);
        case "PageUp": return shiftMonths(date, -1);
        case "PageDown": return shiftMonths(date, 1);
        default: return null;
      }
    })();
    if (next === null) return;
    e.preventDefault();
    const target = next < first ? first : next > lastDay ? lastDay : next;
    const i = monthIndexOf(target);
    if (i < current) setIndex(i);
    else if (i > current + (wide ? 1 : 0)) setIndex(Math.min(wide ? i - 1 : i, last));
    moveFocus.current = true;
    setFocus(target);
  };

  const onSelectDay = (date: string) => {
    setSelected(date);
    setFocus(date);
  };

  const dayTerms = selected ? terminy.filter((tm) => covers(tm, selected)) : [];
  const daySwap = selected ? swapMap.get(selected) : undefined;
  // „Zajęcia według planu” tylko w dzień roboczy w trakcie semestru. Weekend
  // i dni poza semestrem bez terminu dostają neutralny opis (zjazdy
  // niestacjonarnych są w weekend, więc nie piszemy „bez zajęć”).
  const isClassDay =
    selected !== null &&
    weekdayIndex(selected) < 5 &&
    dayTerms.some((tm) => tm.kind === "zajecia" && !tm.audience);
  const dayOther = dayTerms.filter((tm) => !(tm.kind === "zajecia" && !tm.audience && tm.end));

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setIndex(Math.max(current - 1, 0))}
          disabled={current === 0}
          aria-label={t("prevMonth")}
        >
          <CaretLeft size={18} weight="bold" aria-hidden="true" />
        </button>
        <p className={styles.navLabel} aria-live="polite">
          <span className={styles.navSingle}>{fmt(iso(a.y, a.m, 1), { month: "long", year: "numeric" })}</span>
          <span className={styles.navDouble}>
            {fmt(iso(a.y, a.m, 1), { month: "long" })} - {fmt(iso(b.y, b.m, 1), { month: "long", year: "numeric" })}
          </span>
        </p>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setIndex(Math.min(current + 1, last))}
          disabled={current >= last}
          aria-label={t("nextMonth")}
        >
          <CaretRight size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className={styles.months}>
        {[a, b].map((mo, i) => {
          const month = (
            <Month
              key={`${mo.y}-${mo.m}`}
              year={mo.y}
              month={mo.m}
              terminy={terminy}
              zamiany={swapMap}
              today={todayIso}
              selected={selected}
              tabbable={tabbable}
              hintId={hintId}
              onSelect={onSelectDay}
              onKeyDown={onDayKey}
            />
          );
          return i === 0 ? month : (
            <div key="second" className={styles.secondMonth}>
              {month}
            </div>
          );
        })}
      </div>

      <p id={hintId} className="sr-only">
        {t("gridKeys")}
      </p>

      <ul className={styles.legend}>
        {(["sesja", "poprawka", "przerwa", "wolne"] as const).map((k) => (
          <li key={k}>
            <span className={styles.swatch} data-kind={k} />
            {t(`kinds.${k}`)}
          </li>
        ))}
        <li>
          <span className={styles.legendDot} />
          {t("kinds.wniosek")}
        </li>
        <li>
          <span className={styles.legendSwap}>{t("weekdayShort.mon")}</span>
          {t("kinds.zamiana")}
        </li>
      </ul>

      <div className={styles.detail} aria-live="polite">
        {selected ? (
          <>
            <p className={styles.detailDate}>{fmt(selected, { weekday: "long", day: "numeric", month: "long" })}</p>
            {dayOther.length === 0 && !daySwap ? (
              <p className={styles.detailEmpty}>{isClassDay ? t("dayNothing") : t("dayQuiet")}</p>
            ) : (
              <ul>
                {daySwap && (
                  <li>
                    {daySwap.week
                      ? t("swapAs", { day: t(`weekday.${daySwap.weekday}`), week: daySwap.week })
                      : t("swapAsNoWeek", { day: t(`weekday.${daySwap.weekday}`) })}
                  </li>
                )}
                {dayOther.map((tm) => (
                  <li key={tm.id}>
                    <strong>{tm.title[locale]}</strong>
                    {tm.audience && <span> ({tm.audience[locale]})</span>}
                    <span className={styles.detailRange}> {range(tm)}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className={styles.detailEmpty}>{t("dayHint")}</p>
        )}
      </div>
    </div>
  );
}

function isoLocal(ms: number) {
  const d = new Date(ms);
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
}
