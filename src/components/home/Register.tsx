"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import styles from "./Register.module.css";

/**
 * Rejestr zakresów działania — druga po hero „scena" strony głównej.
 *
 * DLACZEGO NIE WEBGL, choć był dopuszczony
 *
 * Brakowało GŁĘBI i ruchu, a nie renderowania 3D. Panel leżący w przestrzeni,
 * przechylający się za kursorem, wjeżdżający z głębi, znak wodny przesuwający
 * się względem treści i to wszystko robi CSS
 * z `perspective` plus jedna pętla `requestAnimationFrame`. Silnik 3D dołożyłby
 * ok. 150 KB do każdego wejścia na stronę i wymagałby sprawnej karty
 * graficznej, żeby pokazać dokładnie to samo. Ta droga sprawdziła się już przy
 * sygnecie w hero.
 *
 * CO TU JEST TREŚCIĄ, A CO EFEKTEM
 *
 * Treścią jest instytucja: zakres, organ właściwy i droga do konkretnej
 * sprawy. Efekt ma tę treść WYNIEŚĆ, a nie ją zastąpić.
 */

/**
 * Skrót do konkretnej sprawy w obrębie zakresu.
 *
 * Wcześniej panel pokazywał wielką liczbę z podpisem („8 przewodników po
 * procedurach”), dobijającą licząc. To szablon „hero metric”, typowy dla stron
 * generowanych automatycznie, a student i tak nie robi nic z liczbą. Skróty
 * prowadzą prosto do sprawy, z którą przychodzi — każdy wskazuje istniejącą
 * podstronę albo kotwicę (sprawdzone 17.10.2026).
 */
interface Shortcut {
  key: string;
  href: string;
}

interface Scope {
  key: string;
  href: string;
  shortcuts: Shortcut[];
}

const scopes: Scope[] = [
  {
    key: "studies",
    href: "/dla-studenta",
    shortcuts: [
      { key: "podania", href: "/infopacki/podania" },
      { key: "semestr", href: "/infopacki/zaliczenie-semestru" },
      { key: "usos", href: "/infopacki/usos" },
    ],
  },
  {
    key: "rights",
    href: "/prawa-studenta",
    shortcuts: [
      { key: "prawa", href: "/prawa-studenta" },
      { key: "rzecznik", href: "/rzecznik-praw-studenta" },
      { key: "akty", href: "/prawo-dla-studenta" },
    ],
  },
  {
    key: "aid",
    href: "/stypendia",
    shortcuts: [
      { key: "prog", href: "/stypendia#miernik-progu" },
      { key: "rektora", href: "/stypendia#rektora" },
      { key: "zapomoga", href: "/stypendia#zapomoga" },
    ],
  },
  {
    key: "health",
    href: "/pomoc-psychologiczna",
    shortcuts: [
      { key: "teraz", href: "/pomoc-psychologiczna#pomoc-teraz" },
      { key: "formy", href: "/pomoc-psychologiczna#formy-wsparcia" },
    ],
  },
  {
    key: "initiatives",
    href: "/nasze-projekty",
    shortcuts: [
      { key: "projekty", href: "/nasze-projekty" },
      { key: "rekrutacja", href: "/rekrutacja" },
      { key: "organizacje", href: "/organizacje-studenckie" },
    ],
  },
  {
    key: "representation",
    href: "/transparentnosc",
    shortcuts: [
      { key: "zarzad", href: "/zarzad" },
      { key: "russ", href: "/rada-uczelniana-samorzadu-studentow" },
      { key: "transparentnosc", href: "/transparentnosc" },
    ],
  },
];

/** Co ile milisekund rejestr przechodzi do następnej pozycji sam z siebie. */
const ADVANCE_MS = 6200;
/** O ile stopni panel kładzie się za kursorem. Celowo mało — to nie zabawka. */
const TILT = 7;

export function Register() {
  const t = useTranslations("register");
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const current = scopes[active];

  /**
   * Rejestr przewija się sam, żeby sekcja żyła, zanim ktokolwiek jej dotknie.
   * Dwa warunki, bez których byłoby to wrogie:
   * - przy `prefers-reduced-motion` nie rusza wcale;
   * - PIERWSZE kliknięcie zatrzymuje go NA STAŁE. Spis, który przeskakuje pod
   *   palcem czytającego, jest gorszy od statycznego.
   */
  const [taken, setTaken] = useState(false);
  useEffect(() => {
    if (taken || reduce) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % scopes.length), ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [taken, reduce]);

  /** Pochylenie panelu za kursorem — tylko przy precyzyjnym wskaźniku. */
  const [pointer, setPointer] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setPointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 110, damping: 20, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 110, damping: 20, mass: 0.4 });
  const rotateY = useTransform(sx, [-1, 1], [-TILT, TILT]);
  const rotateX = useTransform(sy, [-1, 1], [TILT, -TILT]);

  useEffect(() => {
    if (!pointer || reduce) return;
    const host = stageRef.current;
    if (!host) return;

    const onMove = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      // Normalizujemy względem środka PANELU, nie okna: panel ma reagować na
      // to, gdzie kursor jest w stosunku do niego.
      px.set(Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / (box.width / 2))));
      py.set(Math.max(-1, Math.min(1, (event.clientY - (box.top + box.height / 2)) / (box.height / 2))));
    };
    const reset = () => {
      px.set(0);
      py.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
    };
  }, [pointer, reduce, px, py]);

  return (
    <section id="zakresy" className={styles.register} aria-labelledby="register-title">
      <span className={styles.aura} aria-hidden="true" />

      <div className={styles.head}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 id="register-title" className={styles.heading}>
          {t("heading")}
        </h2>
        <p className={styles.lead}>{t("lead")}</p>
      </div>

      <div className={styles.body}>
        {/* Spis. Pozycje są przyciskami, nie odnośnikami: przełączają widok,
            a do podstrony prowadzi jeden odnośnik w panelu — pełnowymiarowy
            i opisany, zamiast sześciu drobnych celów. */}
        <ol className={styles.index}>
          {scopes.map((scope, i) => (
            <li key={scope.key}>
              <button
                type="button"
                aria-pressed={i === active}
                aria-controls="register-detail"
                className={styles.row}
                data-active={i === active ? "true" : undefined}
                onClick={() => {
                  setTaken(true);
                  setActive(i);
                }}
              >
                <span className={styles.rowNumber}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.rowName}>{t(`scopes.${scope.key}.name`)}</span>
                <span className={styles.rowOrgan}>{t(`scopes.${scope.key}.organ`)}</span>
                <span className={styles.rowRule} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>

        {/* Scena: perspektywa żyje TUTAJ, żeby panel mógł się w niej położyć. */}
        <div ref={stageRef} className={styles.stage}>
          <motion.div
            className={styles.panel}
            style={pointer && !reduce ? { rotateX, rotateY } : undefined}
          >
            {/* Numer zakresu jako znak wodny — leży GŁĘBIEJ niż treść panelu,
                więc przy pochyleniu przesuwa się względem niej. To jest cała
                sztuczka głębi: dwie warstwy na różnym `translateZ`. */}
            <span key={`mark-${current.key}`} className={styles.watermark} aria-hidden="true">
              {String(active + 1).padStart(2, "0")}
            </span>

            <div id="register-detail" className={styles.panelContent} aria-live="polite">
              {/* `key` wymusza ponowne odtworzenie wejścia przy zmianie zakresu —
                  panel wjeżdża z głębi, zamiast podmienić tekst na miejscu. */}
              <div key={current.key} className={styles.panelInner}>
                <p className={styles.panelOrgan}>{t(`scopes.${current.key}.organ`)}</p>
                <h3 className={styles.panelName}>{t(`scopes.${current.key}.name`)}</h3>

                <p className={styles.panelBody}>{t(`scopes.${current.key}.body`)}</p>

                {/* Skróty: od zakresu prosto do sprawy, z którą student przychodzi. */}
                <ul className={styles.shortcuts} aria-label={t("shortcutsLabel")}>
                  {current.shortcuts.map((shortcut, i) => (
                    <li key={shortcut.key} style={{ animationDelay: `${120 + i * 50}ms` }}>
                      <Link href={shortcut.href} className={styles.shortcut}>
                        <span>{t(`scopes.${current.key}.shortcuts.${shortcut.key}`)}</span>
                        <ArrowRight size={16} weight="bold" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link href={current.href} className={styles.panelLink}>
                  {t(`scopes.${current.key}.cta`)}
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
