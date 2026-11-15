"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

/**
 * Ciężka choreografia przewijania (gsap + ScrollTrigger, ok. 128 KB) ładuje się
 * dopiero wtedy, gdy ekran spełnia jej własny warunek. Wcześniej pobierał ją
 * każdy telefon, choć efekty startują od 900 px.
 *
 * Osobna „bramka”, a nie część HomeExperience: dzięki temu cała strona główna
 * renderuje się na serwerze i nie hydratuje w przeglądarce - po stronie
 * klienta zostaje tylko ten mały komponent.
 */
const HomeMotion = dynamic(
  () =>
    import("./HomeMotion").catch(() => {
      // Moduł może się nie pobrać: słabe łącze albo karta otwarta w trakcie
      // nowego wdrożenia, po którym stary plik znika z serwera. Animacja to
      // ozdoba - jej brak nie może psuć treści.
      return { default: () => null };
    }),
  { ssr: false },
);

export function HomeMotionGate() {
  const scope = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    scope.current = document.querySelector<HTMLDivElement>("[data-home-experience]");
    const mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setReady(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return ready ? <HomeMotion scope={scope} /> : null;
}
