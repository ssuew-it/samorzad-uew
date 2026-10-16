"use client";

import { useState } from "react";
import { MapPin } from "@phosphor-icons/react";

/**
 * Click-to-load dla Google Maps (ePrivacy): do kliknięcia zero żądań do Google —
 * tylko na-brand placeholder z adresem. Lustrzany wzorzec do VideoEmbed.
 */
export function MapEmbed({
  src,
  title,
  address,
  loadLabel,
  consentNote,
}: {
  src: string;
  title: string;
  address: string;
  loadLabel: string;
  consentNote: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[360px] w-full border-0"
      />
    );
  }

  return (
    <div className="flex h-[360px] w-full flex-col items-center justify-center gap-4 bg-bg-elevated px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-glow text-accent">
        <MapPin size={26} weight="regular" aria-hidden="true" />
      </span>
      <p className="text-[0.9375rem] font-medium text-ink-primary">{address}</p>
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="inline-flex h-11 items-center rounded-lg bg-accent px-6 text-[0.9375rem] font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
      >
        {loadLabel}
      </button>
      <p className="max-w-[40ch] text-[0.75rem] leading-[1.5] text-ink-tertiary">{consentNote}</p>
    </div>
  );
}
