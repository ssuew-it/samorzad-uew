"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { wallFrames } from "@/lib/photos";
import type { HeroFrame } from "@/lib/hero-frames";
import { HeroTicker } from "./HeroTicker";
import styles from "./HeroWall.module.css";

/**
 * Hero: ściana kadrów z życia Samorządu, obrócona w przestrzeni.
 *
 * Decyzja zamawiającego, podjęta świadomie po kilku podejściach do hero.
 * Wzorzec pochodzi z sekcji z opiniami klientów — my kładziemy w nim ZDJĘCIA,
 * bo Samorząd nie ma klientów wystawiających gwiazdki, tylko dorobek.
 *
 * RZECZY, KTÓRE ROBIMY INACZEJ NIŻ WZORZEC — i dlaczego:
 *
 * 1. Kolor i motyw. Wzorzec jest fioletowo-indygowy na czerni; my bierzemy
 *    wszystko z tokenów, więc hero zmienia się razem z przełącznikiem motywu
 *    tak samo jak reszta serwisu.
 * 2. TRZY kolumny, nie cztery. Przy czterech każda była tak wąska, że kadr
 *    przestawał cokolwiek pokazywać — zostawał pasek koloru.
 * 2b. KADRY NIE SĄ RÓWNE i tak ma być. Wcześniej każde zdjęcie było przycięte
 *    do pionu 4:5, żeby kafle się zgadzały — a to psuło kompozycję kadru.
 *    Teraz każde zachowuje swoje proporcje, a kolumny są nierówne.
 * 3. Ściana NIE ZATRZYMUJE SIĘ pod kursorem. Wzorzec ją zatrzymuje, ale wtedy
 *    jedno przypadkowe przejechanie myszą po drodze do menu zamraża pierwszy
 *    ekran i wygląda jak zawieszenie strony.
 * 4. Ściana jest DEKORACJĄ dla czytnika ekranu (`aria-hidden`). Kilkadziesiąt
 *    opisów „zdjęcie z życia Samorządu" to nie dostępność, tylko hałas —
 *    znaczenie niesie tekst obok, a zdjęcia niosą je dla oka.
 * 5. Etykieta „Oficjalny serwis" ustąpiła paskowi z danymi, które SAME SIĘ
 *    ZMIENIAJĄ — pod ścianą, nie nad nią. Napis, który wygląda tak samo przy
 *    każdym wejściu, nic nie wnosi po drugim razie.
 */

/** Trzy kolumny; na najwęższych ekranach CSS chowa trzecią. */
const COLUMNS = 3;

/** Rozkład kadrów po kolumnach — na zmianę, żeby sąsiednie się nie powtarzały. */
function toColumns(frames: HeroFrame[]): HeroFrame[][] {
  const columns: HeroFrame[][] = Array.from({ length: COLUMNS }, () => []);
  frames.forEach((frame, i) => columns[i % COLUMNS].push(frame));
  return columns;
}

export function HeroWall() {
  const t = useTranslations("heroWall");
  const columns = toColumns(wallFrames);

  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="home-hero-title" className={styles.title}>
            <span>{t("titleStrong")}</span>{" "}
            <span className={styles.titleMuted}>{t("titleMuted")}</span>
          </h1>

          {/* Hasło Samorządu jako podpis pod nazwą — te trzy słowa są jego
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
              <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/*
          Pole animacji nie ma własnego tła, ramki ani zaokrągleń — kadry mają
          unosić się nad tłem sekcji. Wygaszenie brzegów robi maska na treści,
          a nie nałożone prostokąty z gradientem, które zdradzałyby krawędź.
        */}
        <div className={styles.field} aria-hidden="true">
          <div className={styles.stage}>
            {columns.map((column, index) => (
              <div key={index} className={styles.column} data-column={index + 1}>
                <div className={styles.track}>
                  {/* Lista leci dwa razy — to jest cały mechanizm bezszwowej
                      pętli: przesuwamy o połowę wysokości i wracamy. */}
                  {[...column, ...column].map((frame, i) => (
                    <div key={i} className={styles.card}>
                      {/*
                        `width`/`height` z manifestu, nie `fill`. Każdy kadr ma
                        własne proporcje — przy `fill` kontener musiałby je
                        narzucić, czyli znów przycinaliśmy zdjęcie pod siatkę.
                        Podane wymiary pozwalają przeglądarce zarezerwować
                        miejsce, więc ściana nie skacze przy doładowaniu.
                      */}
                      <Image
                        src={frame.src}
                        alt=""
                        width={frame.width}
                        height={frame.height}
                        preload={index < 2 && i === 0}
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

      <HeroTicker />
    </section>
  );
}
