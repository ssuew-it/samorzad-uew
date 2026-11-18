"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

/**
 * Przycisk „Kopiuj adres” - jedyny kawałek strony Filii, który potrzebuje
 * przeglądarki. Podpisy przychodzą w propsach, więc do przeglądarki nie
 * trafiają teksty strony.
 */
export function KopiujEmail({ email, label, copiedLabel, className }: { email: string; label: string; copiedLabel: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Starsze przeglądarki i kontekst bez uprawnień do schowka.
      const fallback = document.createElement("textarea");
      fallback.value = email;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      const ok = document.execCommand("copy");
      fallback.remove();
      setCopied(ok);
    }
  }

  return (
    <button type="button" onClick={copyEmail} className={className}>
      {copied ? <Check size={18} weight="bold" aria-hidden="true" className="text-accent" /> : <Copy size={18} aria-hidden="true" />}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
