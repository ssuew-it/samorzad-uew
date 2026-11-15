import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { manifestPhoto } from "@/lib/photos";
import { HeroWall } from "./HeroWall";
import type { Termin } from "@/lib/terminy";
import { Register } from "./Register";
import { HomeMotionGate } from "./HomeMotionGate";
import styles from "./HomeExperience.module.css";

/**
 * Strona główna renderowana na serwerze. W przeglądarce hydratują się tylko
 * wyspy z interakcją: litery nazwy (HeroName), pasek danych (HeroTicker),
 * „Z czym możesz do nas przyjść” (Register) i animacja przewijania
 * (HomeMotionGate). Wcześniej cała strona była komponentem klienckim i jej
 * hydratacja zajmowała ponad sekundę procesora telefonu (Lighthouse,
 * 15.11.2026).
 */
export function HomeExperience({ sesje }: { sesje: Termin[] }) {
  const t = useTranslations("homeExperience");
  const manifestoWords = t("manifesto.statement").split(/\s+/);

  return (
    <div data-home-experience className={styles.experience}>
      <HomeMotionGate />
      {/*
        HERO - DECYZJA ZAMAWIAJĄCEGO, podjęta świadomie po kilku podejściach.
        Ściana kadrów zastępuje cały dotychczasowy blok hero razem z listwą
        sytuacji: te same cztery sytuacje leżą w sekcji „Wybierz sytuację"
        bezpośrednio niżej, więc listwa w hero była ich powtórzeniem.
      */}
      <HeroWall sesje={sesje} />


      {/*
        Rejestr spraw, z którymi studenci przychodzą do Samorządu. Ton mieszany
        (decyzja z 18.10.2026): nagłówek mówi do studenta („Z czym możesz do
        nas przyjść”), a przy każdej sprawie stoi formalnie, który organ się
        nią zajmuje. Uzasadnienie formatu w `Register`.
      */}
      <Register />

      <section data-manifest aria-labelledby="manifest-title" className={styles.manifesto}>
        <div className={styles.manifestInner}>
          <h2 id="manifest-title" className={styles.manifestStatement}>
            {manifestoWords.map((word, index) => (
              <span key={`${word}-${index}`} data-manifest-word>
                {word}{" "}
              </span>
            ))}
          </h2>
          <p className={styles.manifestNote}>{t("manifesto.note")}</p>
          <Link href="/o-nas" className={styles.manifestLink}>
            {t("manifesto.link")}
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
          <div data-manifest-media className={styles.manifestMedia} aria-hidden="true">
            <Image
              src={manifestPhoto}
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
