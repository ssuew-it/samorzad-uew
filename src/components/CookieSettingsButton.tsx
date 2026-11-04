"use client";

import { clearConsent } from "@/lib/consent";

/** „Ustawienia cookies” w stopce: kasuje decyzję, więc baner zgody wraca. */
export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={clearConsent} className={className}>
      {label}
    </button>
  );
}
