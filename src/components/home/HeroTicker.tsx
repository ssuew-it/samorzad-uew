"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { daysUntil, yearPosition } from "@/lib/academic";
import { nextSession, todayMidnight, type Termin } from "@/lib/terminy";
import { formatTemp, type WeatherKind } from "@/lib/weather";
import { WeatherGlyph } from "./WeatherGlyph";
import styles from "./HeroWall.module.css";

/**
 * Pasek pod ścianą kadrów - fakty, które SAME SIĘ ZMIENIAJĄ.
 *
 * Zastępuje etykietę „Oficjalny serwis". Napis, który nigdy się nie zmienia,
 * nic nie wnosi po drugim wejściu na stronę; tydzień roku akademickiego,
 * odliczanie do sesji i do najbliższego wydarzenia zmieniają się codziennie.
 *
 * KAŻDA KOMÓRKA ZNIKA, GDY NIE MA PRAWDZIWYCH DANYCH. Nie ma tu ani jednej
 * daty wpisanej „mniej więcej": odliczanie do sesji bierze daty z harmonogramu
 * (`lib/terminy.ts`),
 * odliczanie do wydarzenia na arkusz z wydarzeniami. Pasek nigdy nie jest
 * pusty, bo tydzień i zegar liczą się same z daty w przeglądarce.
 *
 * Zegar renderuje się dopiero po zamontowaniu - serwer i przeglądarka nigdy
 * nie pokażą tej samej sekundy, więc renderowanie od razu dałoby błąd hydracji.
 */

interface NextEventInfo {
  name: string;
  days: number;
}

interface WeatherInfo {
  temp: number;
  kind: WeatherKind | null;
}

export function HeroTicker({ sesje }: { sesje: Termin[] }) {
  const t = useTranslations("heroWall");
  const [now, setNow] = useState<Date | null>(null);
  const [event, setEvent] = useState<NextEventInfo | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    // Pierwszy odczyt w rAF, nie synchronicznie w efekcie - inaczej React
    // zgłasza kaskadę renderów.
    const first = requestAnimationFrame(() => setNow(new Date()));
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      cancelAnimationFrame(first);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/events", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("events"))))
      .then((data: { events?: { name: string; date: string }[] }) => {
        const stamp = Date.now();
        const soonest = (data.events ?? [])
          .map((e) => ({ name: e.name, days: daysUntil(e.date, stamp) }))
          .filter((e): e is NextEventInfo => e.days !== null)
          .sort((a, b) => a.days - b.days)[0];
        setEvent(soonest ?? null);
      })
      // Bez arkusza komórka po prostu nie istnieje. Wymyślone wydarzenie w
      // liczniku byłoby gorsze niż jego brak.
      .catch(() => setEvent(null));
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    // Zapytanie idzie do NASZEGO endpointu, nie wprost do Open-Meteo - dzięki
    // temu adres IP odwiedzającego nie trafia do zewnętrznej usługi.
    fetch("/api/pogoda", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("pogoda"))))
      .then((d: Partial<WeatherInfo>) =>
        setWeather(typeof d.temp === "number" ? { temp: d.temp, kind: d.kind ?? null } : null),
      )
      .catch(() => setWeather(null));
    return () => ctrl.abort();
  }, []);

  const session = now ? nextSession(sesje, todayMidnight(now)) : null;
  const position = now ? yearPosition(now) : null;

  const time = now
    ? new Intl.DateTimeFormat("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/Warsaw",
      }).format(now)
    : "--:--:--";

  return (
    <dl className={styles.ticker}>
      {/* W trakcie roku: numer tygodnia. W wakacje: odliczanie do 1 października
          - patrz `yearPosition`, martwy numer tygodnia nic nie mówi w sierpniu. */}
      <div>
        <dt>{position?.kind === "toStart" ? t("tickerToStart") : t("tickerWeek")}</dt>
        <dd className={styles.tickerNum}>
          {position === null
            ? "--"
            : position.kind === "week"
              ? position.value
              : t("tickerDays", { days: position.days })}
        </dd>
      </div>

      {session ? (
        <div>
          <dt>{t(`tickerSession.${session.season}`)}</dt>
          <dd className={styles.tickerNum}>{t("tickerDays", { days: session.days })}</dd>
        </div>
      ) : null}

      {event ? (
        <div>
          <dt>{event.name}</dt>
          <dd className={styles.tickerNum}>{t("tickerDays", { days: event.days })}</dd>
        </div>
      ) : null}

      {weather ? (
        <div>
          <dt>{weather.kind ? t(`tickerWeather.${weather.kind}`) : t("tickerWeatherPlain")}</dt>
          <dd className={`${styles.tickerNum} ${styles.tickerWeather}`}>
            <WeatherGlyph kind={weather.kind} />
            {formatTemp(weather.temp)}
          </dd>
        </div>
      ) : null}

      <div>
        <dt>{t("tickerNow")}</dt>
        {/* `tabular-nums` w CSS - bez tego cyfry mają różne szerokości i zegar drga. */}
        <dd className={styles.tickerNum} suppressHydrationWarning>
          {time}
        </dd>
      </div>
    </dl>
  );
}
