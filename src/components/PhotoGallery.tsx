"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import styles from "./PhotoGallery.module.css";

export interface GalleryPhoto {
  src: string;
  width: number;
  height: number;
  /** Opis tego, co WIDAĆ na zdjęciu. */
  alt: string;
}

/**
 * Galeria zdjęć z podglądem.
 *
 * - `strip`: jeden rząd przewijany w poziomie. Na stronie projektów każdy
 *   projekt ma kilka-kilkanaście zdjęć - w wierszach strona rosłaby o kilka
 *   ekranów na projekt, a pasek trzyma wszystkie na wysokości jednego rzędu.
 * - `rows`: wiersze na całą szerokość, każde zdjęcie w swoich proporcjach
 *   (szerokość rośnie z proporcją, więc wysokość w wierszu jest wspólna i nic
 *   nie jest przycięte). Dla kilku zdjęć, które mają być widać od razu.
 *
 * Podgląd to natywny <dialog> w trybie modalnym: przeglądarka sama zamyka
 * fokus w oknie, obsługuje Escape i po zamknięciu oddaje fokus miniaturze.
 */
export function PhotoGallery({
  photos,
  label,
  layout = "strip",
  perRow = 3,
}: {
  photos: GalleryPhoto[];
  /** Nazwa galerii dla czytnika ekranu, np. „Zdjęcia: Bal UEW”. */
  label: string;
  layout?: "strip" | "rows";
  perRow?: number;
}) {
  const t = useTranslations("gallery");
  const [open, setOpen] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const thumb = (photo: GalleryPhoto, index: number, sizes: string) => (
    <button type="button" className={styles.thumb} onClick={() => setOpen(index)} aria-haspopup="dialog">
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className={styles.thumbImage} />
      <span className="sr-only"> ({t("enlarge")})</span>
    </button>
  );

  return (
    <>
      {layout === "strip" ? (
        <Strip photos={photos} label={label} thumb={thumb} />
      ) : (
        <div className={styles.rows} role="group" aria-label={label}>
          {chunk(photos, perRow).map((row, r) => (
            <ul key={r} className={styles.row}>
              {row.map((photo, i) => (
                <li
                  key={photo.src}
                  className={styles.rowItem}
                  style={{ flexGrow: photo.width / photo.height, aspectRatio: `${photo.width} / ${photo.height}` }}
                >
                  {thumb(photo, r * perRow + i, "(min-width: 1024px) 520px, (min-width: 640px) 45vw, 100vw")}
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}
      <Lightbox photos={photos} index={open} onChange={setOpen} />
    </>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
}

function Strip({
  photos,
  label,
  thumb,
}: {
  photos: GalleryPhoto[];
  label: string;
  thumb: (photo: GalleryPhoto, index: number, sizes: string) => ReactNode;
}) {
  const t = useTranslations("gallery");
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Przyciski gasną na końcach paska, żeby nie udawały, że coś jeszcze jest.
  const measure = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
  };

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const move = (direction: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <div className={styles.strip}>
      <div className={styles.bar}>
        <span className={styles.count}>{t("count", { count: photos.length })}</span>
        <div className={styles.nav}>
          <button type="button" className={styles.navButton} onClick={() => move(-1)} disabled={edges.start} aria-label={t("prev")}>
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
          </button>
          <button type="button" className={styles.navButton} onClick={() => move(1)} disabled={edges.end} aria-label={t("next")}>
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul ref={track} className={styles.track} aria-label={label} onScroll={measure}>
        {photos.map((photo, i) => (
          <li key={photo.src} className={styles.stripItem} style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
            {thumb(photo, i, "(min-width: 1024px) 420px, 60vw")}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onChange,
}: {
  photos: GalleryPhoto[];
  index: number | null;
  onChange: (index: number | null) => void;
}) {
  const t = useTranslations("gallery");
  const dialog = useRef<HTMLDialogElement>(null);
  const swipeFrom = useRef<number | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  const step = (direction: -1 | 1) => {
    if (index === null) return;
    onChange((index + direction + photos.length) % photos.length);
  };

  const photo = index === null ? null : photos[index];

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label={t("dialog")}
      onClose={() => onChange(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
      // Kliknięcie w tło (sam <dialog>, nie jego zawartość) zamyka podgląd.
      onClick={(e) => {
        if (e.target === e.currentTarget) onChange(null);
      }}
    >
      {photo ? (
        <figure
          className={styles.figure}
          onPointerDown={(e: PointerEvent) => {
            swipeFrom.current = e.clientX;
          }}
          onPointerUp={(e: PointerEvent) => {
            const from = swipeFrom.current;
            swipeFrom.current = null;
            if (from === null || Math.abs(e.clientX - from) < 50) return;
            step(e.clientX < from ? 1 : -1);
          }}
        >
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1024px) 80vw, 100vw"
            className={styles.full}
          />
          <figcaption className={styles.caption}>
            <span className={styles.position}>{t("position", { n: index! + 1, total: photos.length })}</span>
            <span>{photo.alt}</span>
          </figcaption>
        </figure>
      ) : null}
      {photos.length > 1 ? (
        <>
          <button type="button" className={`${styles.lbButton} ${styles.lbPrev}`} onClick={() => step(-1)} aria-label={t("prevPhoto")}>
            <ArrowLeft size={22} weight="bold" aria-hidden="true" />
          </button>
          <button type="button" className={`${styles.lbButton} ${styles.lbNext}`} onClick={() => step(1)} aria-label={t("nextPhoto")}>
            <ArrowRight size={22} weight="bold" aria-hidden="true" />
          </button>
        </>
      ) : null}
      <button type="button" className={`${styles.lbButton} ${styles.lbClose}`} onClick={() => onChange(null)} aria-label={t("close")}>
        <X size={22} weight="bold" aria-hidden="true" />
      </button>
    </dialog>
  );
}
