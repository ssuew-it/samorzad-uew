"use client";

import Image from "next/image";
import { ArrowSquareOut } from "@phosphor-icons/react";

export interface InfopackCoverDetail {
  label: string;
  value: string;
}

interface InfopackCoverImageProps {
  src: string;
  priority?: boolean;
  sizes?: string;
}

interface InfopackSourceVisualProps extends InfopackCoverImageProps {
  href: string;
  openLabel: string;
  sourceLabel: string;
  sourceTitle: string;
  details: InfopackCoverDetail[];
  className?: string;
}

export function InfopackCoverImage({
  src,
  priority = false,
  sizes = "(max-width: 1024px) 92vw, 430px",
}: InfopackCoverImageProps) {
  return (
    <span className="infopack-cover-object" aria-hidden="true">
      <Image
        src={src}
        alt=""
        width={1024}
        height={1448}
        priority={priority}
        sizes={sizes}
        className="infopack-cover-image"
      />
    </span>
  );
}

export function InfopackCoverFan() {
  const covers = [
    "/photos/infopacki/regulamin-cover.jpg",
    // Bez okładki USOS: oryginalny PDF ma na niej literówkę („PORISZANIE”).
    "/photos/infopacki/semestr-cover.jpg",
    "/photos/infopacki/zycie-cover.jpg",
  ];

  return (
    <div className="infopack-cover-fan" aria-hidden="true">
      {covers.map((cover, index) => (
        <span key={cover} className={`infopack-cover-fan-item infopack-cover-fan-item-${index + 1}`}>
          <InfopackCoverImage src={cover} priority={index === 1} sizes="(max-width: 768px) 72vw, 360px" />
        </span>
      ))}
    </div>
  );
}

export function InfopackSourceVisual({
  src,
  href,
  openLabel,
  sourceLabel,
  sourceTitle,
  details,
  priority = true,
  className = "",
}: InfopackSourceVisualProps) {
  return (
    <figure
      className={`infopack-source-visual min-w-0 ${className}`}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={openLabel}
        className="infopack-cover-link group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <InfopackCoverImage src={src} priority={priority} />
        <span className="infopack-cover-open" aria-hidden="true">
          <ArrowSquareOut size={18} weight="bold" />
        </span>
      </a>

      <figcaption className="mt-5 border-y border-white/20 py-4 text-white">
        <p className="text-[0.6875rem] font-medium text-white/58">{sourceLabel}</p>
        <p className="mt-2 max-w-[38ch] text-[0.875rem] font-semibold leading-[1.45]">{sourceTitle}</p>
        <dl className="mt-4 grid gap-x-5 gap-y-3 border-t border-white/15 pt-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={`${detail.label}-${detail.value}`}>
              <dt className="text-[0.625rem] text-white/52">{detail.label}</dt>
              <dd className="mt-1 text-[0.6875rem] font-semibold leading-[1.45] text-white/88">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  );
}
