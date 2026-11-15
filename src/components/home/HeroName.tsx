"use client";

import { useRef, type CSSProperties } from "react";
import styles from "./HeroWall.module.css";

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
export function HeroName({ text }: { text: string }) {
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
