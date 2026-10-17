"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Segmentowy przełącznik języka PL | EN. Zachowuje bieżącą ścieżkę
 * (next-intl router.replace z opcją locale).
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center overflow-hidden rounded-lg border border-border-strong font-mono text-[0.75rem] font-medium uppercase"
      role="group"
      aria-label="Język / Language"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale ? "true" : undefined}
          className={`flex min-h-11 items-center justify-center px-3 transition-colors ${
            l === locale
              ? "bg-accent text-bg-base"
              : "text-ink-secondary hover:text-ink-primary"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
