import Image from "next/image";
import styles from "./PrawaStudenta.module.css";

/**
 * Grafika hero strony Praw studenta: szklany paragraf w barwie marki.
 *
 * Wygenerowana (Higgsfield, 10.2026) jako OBIEKT-SYMBOL, celowo bez ludzi:
 * zdjęć studentów nie zastępujemy grafiką, która udawałaby prawdziwe osoby
 * albo wydarzenia. Dwie wersje, bo jasny kadr w ciemnym motywie świeciłby
 * jak biała plama — przełącza je klasa motywu, nie zapytanie medialne,
 * bo motyw wybiera się w serwisie przełącznikiem.
 *
 * Ozdoba, więc `alt=""`: treść niesie tytuł obok.
 */
export function PrawaHeroArt() {
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
    </div>
  );
}
