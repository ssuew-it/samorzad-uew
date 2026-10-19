"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./PrawaStudenta.module.css";

/**
 * Szklany paragraf w hero Praw studenta - obraca się razem z przewijaniem.
 *
 * Źródło: render (Higgsfield) i krótkie wideo z obrotem 360° wygenerowane
 * z tego samego kadru, rozbite na klatki WebP (ffmpeg, 48 klatek, ~0,5 MB).
 * Przewinięcie o ok. 80% wysokości ekranu = jeden pełny obrót, jak na
 * stronach produktowych. Obiekt-symbol, celowo bez ludzi.
 *
 * Kolejność ładowania jest ważna dla płynności:
 * 1. Od razu stoi statyczny kadr (next/image, priority) - ten sam, od którego
 *    zaczyna się obrót, więc przejście na klatki jest niewidoczne.
 * 2. Klatki dociągamy dopiero po pierwszym malowaniu, w czasie bezczynności.
 * 3. Rysujemy je na <canvas> w requestAnimationFrame, tylko gdy zmieni się
 *    numer klatki.
 *
 * Przy ograniczonym ruchu klatki nie są nawet pobierane - zostaje kadr.
 *
 * Kadr i klatki mają przezroczyste tło (wycięte 18.10.2026), więc jeden zestaw
 * działa w obu motywach. Gdy klatki są gotowe, kadr pod kanwą znika - inaczej
 * przezierałby przez przezroczyste miejsca obracającego się paragrafu.
 * Ozdoba, więc `aria-hidden`.
 */

const FRAMES = 48;
/** Ile wysokości ekranu przewinięcia przypada na pełny obrót. */
const TURN_VIEWPORTS = 0.8;

const frameUrl = (i: number) => `/photos/prawa/obrot/${String(i + 1).padStart(2, "0")}.webp`;


export function PrawaHeroArt() {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const animate = !reduce;

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
        img.src = frameUrl(i);
        images.push(img);
      }
    };

    // Klatki dopiero po pierwszym malowaniu - nie konkurują z treścią strony.
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
  }, [animate]);

  return (
    <div className={styles.art} data-frames={ready ? "ready" : undefined} aria-hidden="true">
      <Image
        src="/photos/prawa/paragraf.webp"
        alt=""
        width={900}
        height={1125}
        priority
        sizes="(max-width: 767px) 80vw, 420px"
        className={styles.artImg}
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
