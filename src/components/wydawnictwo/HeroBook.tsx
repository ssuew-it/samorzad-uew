import Image from "next/image";
import { BookOpen } from "@phosphor-icons/react/dist/ssr";
import { editions, pagesOf } from "@/lib/editions";
import styles from "./HeroBook.module.css";

/**
 * Najnowszy tom serii jako książka 3D w hero - prawdziwa okładka zamiast
 * symbolu. Czyste CSS (preserve-3d): grzbiet, krawędź kartek, góra bloku.
 * Obraca się przodem do czytającego razem z przewijaniem; przy ograniczonym
 * ruchu stoi w lekkim skręcie.
 *
 * Przycisk prowadzi do `#czytaj` - półka tomów otwiera wtedy czytnik
 * (EditionShelf nasłuchuje tej kotwicy).
 */
export function HeroBook({ ctaLabel }: { ctaLabel: string }) {
  const edition = editions[0];
  const cover = edition ? pagesOf(edition.slug)[0] : undefined;
  if (!edition || !cover) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.book}>
          <span className={styles.shadow} />
          <div className={`${styles.face} ${styles.back}`} />
          <div className={`${styles.face} ${styles.spine}`} />
          <div className={`${styles.face} ${styles.pages}`} />
          <div className={`${styles.face} ${styles.top}`} />
          <div className={`${styles.face} ${styles.cover}`}>
            <Image
              src={cover.src}
              alt=""
              width={cover.width}
              height={cover.height}
              priority
              sizes="280px"
              className={styles.coverImg}
            />
          </div>
        </div>
      </div>
      <a href="#czytaj" className={styles.cta}>
        <BookOpen size={20} weight="regular" aria-hidden="true" />
        {ctaLabel}
      </a>
      <p className={styles.caption}>
        {edition.title}, {edition.year}
      </p>
    </div>
  );
}
