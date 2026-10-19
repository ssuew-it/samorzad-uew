// src/components/wydawnictwo/EditionReader.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ArrowLeft, ArrowRight, FilePdf } from "@phosphor-icons/react";
import { pagesOf, type Edition } from "@/lib/editions";
import { sheetCount, spreadAt } from "@/lib/spread";
import styles from "./EditionReader.module.css";

/**
 * Czytnik wydania - nakładka pełnoekranowa.
 *
 * ODPOWIADA ZA DOSTĘPNOŚĆ CAŁEJ FUNKCJI i dlatego powstał przed sceną 3D.
 * Scena jest doładowywana osobno i może się nie uruchomić (brak WebGL, słabe
 * urządzenie, ograniczony ruch) - wtedy zostaje to, co widać tutaj: dwie
 * strony obok siebie, klawiatura i odnośnik do pełnego PDF-a.
 *
 * PDF jest tu elementem obowiązkowym, nie ozdobnym. Płótno WebGL jest dla
 * czytnika ekranu puste, więc drogą do treści jest dokument - a ten ma warstwę
 * tekstową i strukturę nagłówków.
 */

interface EditionReaderProps {
  edition: Edition;
  onClose: () => void;
  labels: {
    close: string;
    prev: string;
    next: string;
    readFull: string;
    pageOf: string;
    licenseNote: string;
  };
}

export function EditionReader({ edition, onClose, labels }: EditionReaderProps) {
  const pages = pagesOf(edition.slug);
  const sheets = sheetCount(pages.length);
  const [o, setO] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Typ importowany, nie przepisany - przepisana sygnatura rozjedzie się
  // z modułem przy pierwszej zmianie.
  const sceneRef = useRef<import("./editionScene").SceneHandle | null>(null);
  const [scene3d, setScene3d] = useState(false);

  const go = useCallback(
    (delta: number) => setO((v) => Math.max(0, Math.min(sheets, v + delta))),
    [sheets],
  );

  // Klawiatura: bez niej czytnik jest niedostępny. Escape zamyka, strzałki
  // i PageUp/PageDown przewracają.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, go]);

  // Fokus wchodzi do nakładki po otwarciu. Zwrot fokusu na grzbiet robi
  // SpineWall, bo to on wie, skąd otwarto.
  useEffect(() => {
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  // Pułapka fokusu - Tab nie może wyjść poza nakładkę, bo za nią leży strona,
  // której w tym momencie nie widać.
  useEffect(() => {
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onTab);
    return () => window.removeEventListener("keydown", onTab);
  }, []);

  // Strona pod spodem nie może się przewijać, gdy nakładka jest otwarta.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Scena 3D. Póki się nie uruchomi - a może się nie uruchomić wcale - zostaje
  // statyczna rozkładówka, więc czytnik nigdy nie przestaje działać.
  useEffect(() => {
    if (pages.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Wykrycie WebGL tworzy PRAWDZIWY kontekst, a przeglądarki mają twardy limit
    // jednoczesnych kontekstów (rzędu 8-16) i porzucony nie znika natychmiast.
    // Bez jawnego zwolnienia scena przestawałaby powstawać po kilku otwarciach
    // czytnika w obrębie jednej wizyty.
    const probe = document.createElement("canvas").getContext("webgl2");
    const supported = probe !== null;
    probe?.getExtension("WEBGL_lose_context")?.loseContext();
    if (!supported) return;

    let disposed = false;
    // `three` ładuje się DOPIERO TUTAJ - kto nie otworzy czytnika, nie pobiera
    // ani kilobajta silnika.
    import("./editionScene").then(({ createScene }) => {
      if (disposed || !canvasRef.current) return;
      sceneRef.current = createScene(canvasRef.current, pages, { reduced, onSettled: setO });
      setScene3d(true);
    });

    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [pages]);

  // Strzałki i przyciski sterują sceną, gdy ta działa. `goTo` sam wychodzi
  // wcześniej przy niezmienionym stanie, więc odesłanie z `onSettled` nie
  // zapętla się tutaj z powrotem.
  //
  // `scene3d` jest w zależnościach nie dla ozdoby: scena powstaje
  // asynchronicznie, więc gdy ktoś naciśnie strzałkę przed rozwiązaniem
  // importu, ten efekt trafia na pusty `sceneRef` i przepada. Przełączenie
  // `scene3d` na prawdę uruchamia go ponownie i dociąga scenę do stanu, jaki
  // ma już React - bez tego licznik mówiłby co innego niż obraz.
  useEffect(() => {
    sceneRef.current?.goTo(o);
  }, [o, scene3d]);

  const { verso, recto } = spreadAt(o, pages.length);
  const shown = [verso, recto].filter((n): n is number => n !== null).map((n) => n + 1);
  const position = shown.join("-");

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${edition.title}. ${edition.subtitle ?? ""}`}
      className={styles.overlay}
    >
      <header className={styles.bar}>
        <div>
          <p className={styles.title}>{edition.title}</p>
          <p className={styles.meta}>
            {edition.editors.join(" · ")} · {edition.year} · {edition.license}
          </p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className={styles.close}>
          <X size={20} weight="bold" aria-hidden="true" />
          {labels.close}
        </button>
      </header>

      {/* Rozkładówka. Gdy scena 3D wstanie, przejmuje ten obszar; gdy nie -
          brak WebGL, brak stron, błąd ładowania - zostają dwie płaskie strony.
          Licznik i odnośnik do PDF-a leżą w stopce, więc treść dla czytnika
          ekranu jest ta sama w obu trybach. */}
      <div className={styles.stage}>
        {/* Dla czytnika ekranu płótno jest puste - stan niesie licznik niżej,
            a drogą do treści jest otagowany PDF. */}
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" hidden={!scene3d} />
        {!scene3d && (
          <>
            {/* Klasa `verso` oznacza LEWĄ stronę rozkładówki: na telefonie to
                ona się chowa. Oznaczenie jest jawne, bo reguła oparta na
                kolejności zaczęła kiedyś ukrywać płótno sceny. */}
            {verso !== null ? (
              <Image
                src={pages[verso].src}
                alt=""
                width={pages[verso].width}
                height={pages[verso].height}
                className={`${styles.page} ${styles.verso}`}
                preload={o === 0}
              />
            ) : (
              <span className={`${styles.blank} ${styles.verso}`} aria-hidden="true" />
            )}
            {recto !== null ? (
              <Image
                src={pages[recto].src}
                alt=""
                width={pages[recto].width}
                height={pages[recto].height}
                className={styles.page}
                preload={o === 0}
              />
            ) : (
              <span className={styles.blank} aria-hidden="true" />
            )}
          </>
        )}
      </div>

      <footer className={styles.bar}>
        <div className={styles.nav}>
          <button type="button" onClick={() => go(-1)} disabled={o === 0} className={styles.arrow}>
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
            {labels.prev}
          </button>
          {/* aria-live, żeby czytnik ekranu ogłaszał zmianę stron. */}
          <p className={styles.counter} aria-live="polite">
            {labels.pageOf.replace("{position}", position).replace("{total}", String(pages.length))}
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={o >= sheets}
            className={styles.arrow}
          >
            {labels.next}
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {/* NIE JEST TO DODATEK. To jedyna droga do treści dla czytnika ekranu
            i jedyny sposób, żeby ten tekst dało się naprawdę przeczytać. */}
        <a href={edition.pdf} className={styles.pdf} target="_blank" rel="noopener noreferrer">
          <FilePdf size={20} weight="regular" aria-hidden="true" />
          {labels.readFull}
        </a>
      </footer>

      <p className={styles.license}>
        {labels.licenseNote}{" "}
        <a href={edition.licenseUrl} target="_blank" rel="noopener noreferrer">
          {edition.license}
        </a>
      </p>
    </div>
  );
}
