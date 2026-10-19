"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Choreografia przewijania strony głównej - WYŁĄCZNIE dla dużych ekranów.
 *
 * Dlaczego osobny plik: `gsap` razem z `ScrollTrigger` to ok. 128 KB kodu.
 * Dopóki siedziały w `HomeExperience`, pobierał je każdy telefon - mimo że
 * te efekty i tak włączają się dopiero od 900 px. Zmierzone: strona główna
 * ważyła na telefonie prawie tyle samo co na desktopie.
 *
 * Teraz `HomeExperience` ładuje ten moduł dynamicznie i dopiero wtedy, gdy
 * ekran naprawdę spełnia warunek. Na telefonie ten kod nie jest pobierany
 * w ogóle, a efekty na desktopie zostają bez zmian.
 *
 * Po uporządkowaniu strony głównej zostaje tu jeden efekt: rozjaśnianie słów
 * manifestu wraz z przewijaniem. Paralaksy kadru w hero i paneli archiwum
 * odeszły razem z sekcjami, których dotyczyły.
 */
export default function HomeMotion({ scope }: { scope: RefObject<HTMLDivElement | null> }) {
  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        // Paralaksy kadru w hero już tu nie ma: hero nie ma fotografii. Jego
        // ruch niesie teraz sam sygnet - składa się z warstw i pochyla za
        // kursorem, w `HeroMark`, bez udziału ScrollTriggera.

        // Kolory czytamy z tokenów motywu, a nie wpisujemy na sztywno. Przy
        // wpisanych wartościach ciemny motyw dostawał ciemny tekst na ciemnym
        // tle - słowa manifestu znikały.
        const root = getComputedStyle(document.documentElement);
        const dim = root.getPropertyValue("--ink-tertiary").trim() || "#9aa8bc";
        const full = root.getPropertyValue("--ink-primary").trim() || "#102743";

        const words = gsap.utils.toArray<HTMLElement>("[data-manifest-word]");
        gsap.set(words, { color: dim });
        gsap.to(words, {
          color: full,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-manifest]",
            start: "top top+=72",
            end: "+=115%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Zdjęcie odsłania się maską od dołu w tym samym rytmie, w którym
        // rozjaśniają się słowa - jeden ruch sceny zamiast dwóch osobnych.
        // Start od 38%, nie od 100%: kadr nigdy nie znika całkiem, więc nawet
        // po przeładowaniu w połowie strony nie ma pustego prostokąta.
        // Skala osiada razem z maską (1,08 → 1), co daje głębię bez paralaksy.
        gsap.fromTo(
          "[data-manifest-media]",
          { clipPath: "inset(38% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: "[data-manifest]",
              start: "top top+=72",
              end: "+=80%",
              scrub: 0.7,
            },
          },
        );
        gsap.fromTo(
          "[data-manifest-media] img",
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-manifest]",
              start: "top top+=72",
              end: "+=115%",
              scrub: 0.9,
            },
          },
        );

      });

      return () => media.revert();
    },
    { scope },
  );

  return null;
}
