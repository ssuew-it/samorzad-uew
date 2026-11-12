"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { projectLogos, wallFrames, type ProjectLogo as ProjectLogoData } from "@/lib/photos";
import { ProjectLogo } from "../ProjectLogo";
import type { HeroFrame } from "@/lib/hero-frames";
import { HeroTicker } from "./HeroTicker";
import type { Termin } from "@/lib/terminy";
import styles from "./HeroWall.module.css";

/**
 * Hero: ściana kadrów z życia Samorządu, obrócona w przestrzeni.
 *
 * Decyzja zamawiającego, podjęta świadomie po kilku podejściach do hero.
 * Wzorzec pochodzi z sekcji z opiniami klientów - my kładziemy w nim ZDJĘCIA,
 * bo Samorząd nie ma klientów wystawiających gwiazdki, tylko dorobek.
 *
 * RZECZY, KTÓRE ROBIMY INACZEJ NIŻ WZORZEC - i dlaczego:
 *
 * 1. Kolor i motyw. Wzorzec jest fioletowo-indygowy na czerni; my bierzemy
 *    wszystko z tokenów, więc hero zmienia się razem z przełącznikiem motywu
 *    tak samo jak reszta serwisu.
 * 2. TRZY kolumny, nie cztery. Przy czterech każda była tak wąska, że kadr
 *    przestawał cokolwiek pokazywać - zostawał pasek koloru.
 * 2b. KADRY NIE SĄ RÓWNE i tak ma być. Wcześniej każde zdjęcie było przycięte
 *    do pionu 4:5, żeby kafle się zgadzały - a to psuło kompozycję kadru.
 *    Teraz każde zachowuje swoje proporcje, a kolumny są nierówne.
 * 3. Ściana NIE ZATRZYMUJE SIĘ pod kursorem. Wzorzec ją zatrzymuje, ale wtedy
 *    jedno przypadkowe przejechanie myszą po drodze do menu zamraża pierwszy
 *    ekran i wygląda jak zawieszenie strony.
 * 4. Ściana jest DEKORACJĄ dla czytnika ekranu (`aria-hidden`). Kilkadziesiąt
 *    opisów „zdjęcie z życia Samorządu" to nie dostępność, tylko hałas -
 *    znaczenie niesie tekst obok, a zdjęcia niosą je dla oka.
 * 5. Etykieta „Oficjalny serwis" ustąpiła paskowi z danymi, które SAME SIĘ
 *    ZMIENIAJĄ - pod ścianą, nie nad nią. Napis, który wygląda tak samo przy
 *    każdym wejściu, nic nie wnosi po drugim razie.
 */

/** Trzy kolumny; na najwęższych ekranach CSS chowa trzecią. */
const COLUMNS = 3;

/**
 * Wysokość logotypu w rzędzie projektów: równe POLE, nie równa wysokość.
 * Przy równej wysokości kwadratowe znaki (Bal, Mosty) były maleńkie, a szerokie
 * napisy (TEDx, GradUEtion) zajmowały pół rzędu - optycznie nierówno.
 */
function logoHeight(logo: ProjectLogoData) {
  const ratio = logo.light.width / logo.light.height;
  return Math.round(Math.min(32, Math.max(14, Math.sqrt(1600 / ratio))));
}

/** Rozkład kadrów po kolumnach - na zmianę, żeby sąsiednie się nie powtarzały. */
function toColumns(frames: HeroFrame[]): HeroFrame[][] {
  const columns: HeroFrame[][] = Array.from({ length: COLUMNS }, () => []);
  frames.forEach((frame, i) => columns[i % COLUMNS].push(frame));
  return columns;
}

/**
 * „Samorząd Studentów” jako litery, nie zwykły tekst - to pierwsze, co widać
 * na stronie, więc nazwa dostaje własny charakter:
 *
 * - drugie słowo przechodzi kolorem od tuszu do niebieskiego Samorządu
 *   (gradient tożsamości, ale na literach, nie jako poświata w tle);
 * - przy wejściu litery wysuwają się spod linii po kolei (maska, bez
 *   przezroczystości - nagłówek jest od razu „treścią” dla przeglądarki);
 * - litery najbliżej kursora lekko się unoszą i łapią akcent.
 *
 * Czytnik ekranu dostaje pełne słowa z ukrytego tekstu; litery są aria-hidden.
 * Przy ograniczeniu ruchu nic się nie rusza (CSS + warunek w obsłudze kursora).
 */
function HeroName({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  let index = 0;

  const near = (x: number, y: number) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      ref.current?.querySelectorAll<HTMLElement>("[data-letter]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        el.style.setProperty("--p", Math.max(0, 1 - d / 150).toFixed(3));
      });
    });
  };

  const reset = () => {
    cancelAnimationFrame(frame.current);
    ref.current?.querySelectorAll<HTMLElement>("[data-letter]").forEach((el) => el.style.setProperty("--p", "0"));
  };

  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        ref={ref}
        aria-hidden="true"
        className={styles.name}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          near(e.clientX, e.clientY);
        }}
        onPointerLeave={reset}
      >
        {text.split(" ").map((word, w) => (
          <span key={word} className={styles.word} data-accent={w === 1 || undefined}>
            {[...word].map((ch, i, all) => (
              <span
                key={i}
                data-letter
                className={styles.letter}
                style={{ "--i": index++, "--t": all.length > 1 ? i / (all.length - 1) : 0 } as CSSProperties}
              >
                {ch}
              </span>
            ))}
          </span>
        ))}
      </span>
    </>
  );
}

export function HeroWall({ sesje }: { sesje: Termin[] }) {
  const t = useTranslations("heroWall");
  const columns = toColumns(wallFrames);

  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="home-hero-title" className={styles.title}>
            <HeroName text={t("titleStrong")} />{" "}
            <span className={styles.titleMuted}>{t("titleMuted")}</span>
          </h1>

          {/* Hasło Samorządu jako podpis pod nazwą - te trzy słowa są jego
              własne i mówią o nim więcej niż zdanie opisowe. */}
          <p className={styles.motto}>{t("motto")}</p>
          <p className={styles.lead}>{t("lead")}</p>

          {/* Dwie główne ścieżki: sprawa studenta i poznanie Samorządu. */}
          <div className={styles.actions}>
            <Link href="/dla-studenta" className={styles.ctaPrimary}>
              {t("ctaPrimary")}
              <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </Link>
            <Link href="/o-nas" className={styles.ctaSecondary}>
              {t("ctaSecondary")}
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
          </div>

          {/* Logotypy projektów: co robimy, w jednym spojrzeniu, i skrót do
              każdego projektu. Szare, w kolorze po najechaniu - nie konkurują
              z nagłówkiem. Na telefonie ukryte: tam pod tekstem jest już
              ściana zdjęć, a każdy dodatkowy rząd to dłuższe przewijanie. */}
          <div className={styles.projects}>
            <p id="hero-projects" className={styles.projectsLabel}>
              {t("projectsLabel")}
            </p>
            <ul className={styles.projectsList} aria-labelledby="hero-projects">
              {projectLogos.map((logo) => (
                <li key={logo.key}>
                  <Link href={`/nasze-projekty#projekt-${logo.key}`} className={styles.projectLink}>
                    <ProjectLogo logo={logo} height={36} alt={logo.name} className={styles.projectLogo} style={{ height: logoHeight(logo) }} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*
          Pole animacji nie ma własnego tła, ramki ani zaokrągleń - kadry mają
          unosić się nad tłem sekcji. Wygaszenie brzegów robi maska na treści,
          a nie nałożone prostokąty z gradientem, które zdradzałyby krawędź.
        */}
        <div className={styles.field} aria-hidden="true">
          <div className={styles.stage}>
            {columns.map((column, index) => (
              <div key={index} className={styles.column} data-column={index + 1}>
                <div className={styles.track}>
                  {/* Lista leci dwa razy - to jest cały mechanizm bezszwowej
                      pętli: przesuwamy o połowę wysokości i wracamy. */}
                  {[...column, ...column].map((frame, i) => (
                    <div key={i} className={styles.card}>
                      {/*
                        `width`/`height` z manifestu, nie `fill`. Każdy kadr ma
                        własne proporcje - przy `fill` kontener musiałby je
                        narzucić, czyli znów przycinaliśmy zdjęcie pod siatkę.
                        Podane wymiary pozwalają przeglądarce zarezerwować
                        miejsce, więc ściana nie skacze przy doładowaniu.
                      */}
                      <Image
                        src={frame.src}
                        alt=""
                        width={frame.width}
                        height={frame.height}
                        // Pierwsze kadry dwóch kolumn to LCP. `preload` dawało
                        // pobieranie z niskim priorytetem (Lighthouse), więc
                        // zgodnie z dokumentacją next/image: eager + high.
                        {...(index < 2 && i === 0
                          ? { loading: "eager" as const, fetchPriority: "high" as const }
                          : {})}
                        sizes="(max-width: 700px) 50vw, (max-width: 1000px) 34vw, 340px"
                        className={styles.cardImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HeroTicker sesje={sesje} />
    </section>
  );
}
