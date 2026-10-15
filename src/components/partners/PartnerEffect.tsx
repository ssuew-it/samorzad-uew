"use client";

import { resolvePartnerEffect, type Partner } from "./partnerEffects";

/**
 * Gra raz przy zamontowaniu (otwarciu modala partnera). Tinta = color partnera.
 * `frames` jest slotem na przyszłość — dziś renderuje fallback domyślny.
 */
export function PartnerEffect({ partner }: { partner: Partner }) {
  const effect = resolvePartnerEffect(partner);
  const color = partner.color ?? "var(--accent)";

  if (effect === "aviation") {
    return (
      <div className="relative mx-auto h-24 w-24" aria-hidden="true">
        <span
          className="pe-trail absolute left-[42px] top-[58px] h-[2px] origin-left rotate-[-25deg] rounded-full blur-[0.6px]"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)`, animation: "plane-trail 1.1s cubic-bezier(0.5,0,0.2,1) 1s forwards" }}
        />
        <svg
          className="pe-plane absolute left-[34px] top-[34px]"
          width="30" height="30" viewBox="0 0 24 24" fill="none"
          stroke={color} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"
          style={{ animation: "plane-takeoff 1.1s cubic-bezier(0.5,0,0.2,1) 1s forwards" }}
        >
          <path
            pathLength={100}
            d="M2 21l21-9L2 3v7l15 2-15 2v7z"
            style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: "plane-draw 1s ease forwards" }}
          />
        </svg>
      </div>
    );
  }

  // default — elegancki sweep przez logo. Prawdziwy partner dostaje swój znak
  // na białym tle (część logotypów to JPG na bieli); wolne miejsce „Twoja
  // marka" zostaje pustą, akcentową płytką.
  if (partner.logo) {
    return (
      <div className="relative mx-auto flex h-24 w-44 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-white px-5" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={partner.logo} alt="" className="max-h-14 max-w-full object-contain" />
        <span
          className="pe-sweep absolute inset-y-0 w-1/2"
          style={{ background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.85), transparent)", animation: "partner-sweep 1.4s cubic-bezier(0.16,1,0.3,1) forwards" }}
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-2xl" aria-hidden="true"
         style={{ background: "var(--accent-glow)" }}>
      <span
        className="pe-sweep absolute inset-y-0 w-1/2"
        style={{ background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.85), transparent)", animation: "partner-sweep 1.4s cubic-bezier(0.16,1,0.3,1) forwards" }}
      />
    </div>
  );
}
