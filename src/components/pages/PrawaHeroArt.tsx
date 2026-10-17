"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./PrawaStudenta.module.css";

/**
 * Szklany paragraf w hero Praw studenta — obraca się razem z przewijaniem.
 *
 * Źródło: render (Higgsfield) i krótkie wideo z obrotem 360° wygenerowane
 * z tego samego kadru, rozbite na klatki WebP (ffmpeg, 48 klatek, ~0,5 MB).
 * Przewinięcie o ok. 80% wysokości ekranu = jeden pełny obrót, jak na
 * stronach produktowych. Obiekt-symbol, celowo bez ludzi.
 *
 * Kolejność ładowania jest ważna dla płynności:
 * 1. Od razu stoi statyczny kadr (next/image, priority) — ten sam, od którego
 *    zaczyna się obrót, więc przejście na klatki jest niewidoczne.
 * 2. Klatki dociągamy dopiero po pierwszym malowaniu, w czasie bezczynności.
 * 3. Rysujemy je na <canvas> w requestAnimationFrame, tylko gdy zmieni się
 *    numer klatki.
 *
 * Przy ograniczonym ruchu klatki nie są nawet pobierane — zostaje kadr.
 * Ozdoba, więc `aria-hidden`.
 */

const FRAMES = 48;
/** Ile wysokości ekranu przewinięcia przypada na pełny obrót. */
const TURN_VIEWPORTS = 0.8;

const frameUrl = (set: "jasny" | "ciemny", i: number) =>
  `/photos/prawa/obrot-${set}/${String(i + 1).padStart(2, "0")}.webp`;

function useDarkTheme(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

export function PrawaHeroArt({ darkFrames = true }: { darkFrames?: boolean }) {
  const reduce = useReducedMotion();
  const dark = useDarkTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  // Zestaw klatek do motywu; ciemny tylko wtedy, gdy istnieje.
  const set: "jasny" | "ciemny" = dark && darkFrames ? "ciemny" : "jasny";
  // Bez ciemnych klatek w ciemnym motywie zostaje statyczny ciemny kadr.
  const animate = !reduce && (!dark || darkFrames);

  useEffect(() => {
    if (!animate) return;
    let cancelled = false;
    let raf = 0;
    let last = -1;
    const images: HTMLImageElement[] = [];

    const draw = () => {
      raf = 0;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const progress = (window.scrollY / (window.innerHeight * TURN_VIEWPORTS)) % 1;
      const index = Math.min(FRAMES - 1, Math.max(0, Math.floor(progress * FRAMES)));
      if (index === last) return;
      const img = images[index];
      if (!img || !img.complete || !img.naturalWidth) return;
      last = index;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const load = () => {
      let loaded = 0;
      for (let i = 0; i < FRAMES; i++) {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => {
          loaded += 1;
          if (loaded === FRAMES && !cancelled) {
            setReady(true);
            last = -1;
            draw();
          }
        };
        img.src = frameUrl(set, i);
        images.push(img);
      }
    };

    // Klatki dopiero po pierwszym malowaniu — nie konkurują z treścią strony.
    const idle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(load, { timeout: 1500 })
        : globalThis.setTimeout(load, 600);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle as number);
      else globalThis.clearTimeout(idle as number);
      setReady(false);
    };
  }, [animate, set]);

  return (
    <div className={styles.art} aria-hidden="true">
      <Image
        src="/photos/prawa/paragraf-jasny.webp"
        alt=""
        width={900}
        height={1125}
        priority
        sizes="(max-width: 767px) 80vw, 420px"
        className={`${styles.artImg} ${styles.artLight}`}
      />
      <Image
        src="/photos/prawa/paragraf-ciemny.webp"
        alt=""
        width={900}
        height={1125}
        sizes="(max-width: 767px) 80vw, 420px"
        className={`${styles.artImg} ${styles.artDark}`}
      />
      {animate && (
        <canvas
          ref={canvasRef}
          className={styles.artCanvas}
          data-ready={ready ? "true" : undefined}
        />
      )}
    </div>
  );
}
