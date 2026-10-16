"use client";

import { useState } from "react";
import { MapPin } from "@phosphor-icons/react";
import styles from "./MapEmbed.module.css";

/**
 * Click-to-load dla Google Maps (ePrivacy): do kliknięcia zero żądań do Google,
 * tylko na-brand zaślepka z adresem. Lustrzany wzorzec do VideoEmbed.
 *
 * Wysokość ustala rodzic (`className`), bo kontakt i mapa kampusu potrzebują
 * innych proporcji. Zmiana `src` po załadowaniu przełącza mapę na nowe miejsce.
 */
export function MapEmbed({
  src,
  title,
  address,
  loadLabel,
  consentNote,
  className = "h-[360px]",
}: {
  src: string;
  title: string;
  address: string;
  loadLabel: string;
  consentNote: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  // Iframe wchodzi przez przenikanie dopiero, gdy Google odda pierwszą klatkę;
  // wcześniej widać zaślepkę, a nie biały prostokąt.
  const [readySrc, setReadySrc] = useState<string | null>(null);

  return (
    <div className={`${styles.frame} ${className}`}>
      {loaded && (
        <iframe
          key={src}
          title={title}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setReadySrc(src)}
          data-ready={readySrc === src}
          className={styles.iframe}
        />
      )}
      {!loaded && (
        <div className={styles.placeholder}>
          <span className={styles.pin} aria-hidden="true">
            <MapPin size={24} weight="fill" />
          </span>
          <p className={styles.address}>{address}</p>
          <button type="button" onClick={() => setLoaded(true)} className={styles.load}>
            {loadLabel}
          </button>
          <p className={styles.consent}>{consentNote}</p>
        </div>
      )}
    </div>
  );
}
