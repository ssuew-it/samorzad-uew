"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { heroPhotos } from "@/lib/photos";
import { HeroWall } from "./HeroWall";
import { Register } from "./Register";
import styles from "./HomeExperience.module.css";


/**
 * Ciężka choreografia przewijania (gsap + ScrollTrigger, ok. 128 KB) ładuje się
 * dopiero wtedy, gdy ekran spełnia jej własny warunek. Wcześniej pobierał ją
 * każdy telefon, choć efekty startują od 900 px.
 */
const HomeMotion = dynamic(
  () =>
    import("./HomeMotion").catch(() => {
      // Moduł może się nie pobrać: słabe łącze albo karta otwarta w trakcie
      // nowego wdrożenia, po którym stary plik znika z serwera. Bez tego
      // zabezpieczenia Next pokazywał wtedy ekran „This page couldn't load”
      // zamiast strony. Animacja to ozdoba - jej brak nie może psuć treści.
      return { default: () => null };
    }),
  { ssr: false },
);

export function HomeExperience() {
  const t = useTranslations("homeExperience");
  const rootRef = useRef<HTMLDivElement>(null);
  const manifestoWords = t("manifesto.statement").split(/\s+/);

  // Duże ekrany dostają choreografię przewijania; telefon nie pobiera jej wcale.
  const [motionReady, setMotionReady] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setMotionReady(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div ref={rootRef} className={styles.experience}>
      {motionReady && <HomeMotion scope={rootRef} />}
      {/*
        HERO - DECYZJA ZAMAWIAJĄCEGO, podjęta świadomie po kilku podejściach.
        Ściana kadrów zastępuje cały dotychczasowy blok hero razem z listwą
        sytuacji: te same cztery sytuacje leżą w sekcji „Wybierz sytuację"
        bezpośrednio niżej, więc listwa w hero była ich powtórzeniem.
      */}
      <HeroWall />


      {/*
        Rejestr spraw, z którymi studenci przychodzą do Samorządu. Ton mieszany
        (decyzja z 18.10.2026): nagłówek mówi do studenta („Z czym możesz do
        nas przyjść”), a przy każdej sprawie stoi formalnie, który organ się
        nią zajmuje. Uzasadnienie formatu w `Register`.
      */}
      <Register />

      <section data-manifest aria-labelledby="manifest-title" className={styles.manifesto}>
        <div className={styles.manifestInner}>
          <p className={styles.manifestEyebrow}>{t("manifesto.eyebrow")}</p>
          <h2 id="manifest-title" className={styles.manifestStatement}>
            {manifestoWords.map((word, index) => (
              <span key={`${word}-${index}`} data-manifest-word>
                {word}{" "}
              </span>
            ))}
          </h2>
          <p className={styles.manifestNote}>{t("manifesto.note")}</p>
          <div data-manifest-media className={styles.manifestMedia} aria-hidden="true">
            <Image
              src={heroPhotos[2]}
              alt=""
              fill
              sizes="(max-width: 899px) 100vw, 36vw"
              className={styles.manifestImage}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
