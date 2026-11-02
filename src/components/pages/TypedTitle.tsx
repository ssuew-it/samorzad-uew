"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Zarzadzenia.module.css";

const SEEN_KEY = "zarzadzenia:typed";

/**
 * Tytuł najnowszego zarządzenia „wpisuje się” do rejestru jak na maszynie,
 * RAZ: gdy wiersz pierwszy raz wjedzie na ekran i tylko dla zarządzenia,
 * którego ta przeglądarka jeszcze nie widziała (numer w localStorage).
 *
 * Pełny tekst jest w DOM od początku (warstwa niewidoczna, ale zajmuje
 * miejsce), więc wiersz nie skacze, a czytnik ekranu i wyszukiwarka czytają
 * całość. Bez JS, przy ograniczonym ruchu albo bez localStorage - po prostu
 * zwykły tekst.
 */
export function TypedTitle({ text, id }: { text: string; id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // null = bez animacji (pełny tekst), liczba = ile znaków już „wpisano”.
  const [typed, setTyped] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(SEEN_KEY);
    } catch {
      return;
    }
    if (seen === id) return;

    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        // Długie tytuły nie mogą pisać się w nieskończoność: najwyżej ~1,6 s.
        const step = Math.max(12, Math.min(34, 1600 / text.length));
        let n = 0;
        setTyped(0);
        timer = window.setInterval(() => {
          n += 1;
          setTyped(n);
          if (n >= text.length) {
            window.clearInterval(timer);
            setTyped(null);
            try {
              localStorage.setItem(SEEN_KEY, id);
            } catch {
              /* bez zapamiętania - najwyżej animacja powtórzy się przy kolejnej wizycie */
            }
          }
        }, step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [id, text]);

  return (
    <span ref={ref} className={styles.typed}>
      <span className={typed === null ? undefined : styles.typedGhost}>{text}</span>
      {typed !== null ? (
        <span className={styles.typedLayer} aria-hidden="true">
          {text.slice(0, typed)}
          <span className={styles.typedCaret} />
        </span>
      ) : null}
    </span>
  );
}
