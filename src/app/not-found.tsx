import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

/**
 * Globalna strona 404 - dla adresów, które nie pasują do żadnej trasy.
 *
 * Dlaczego renderuje własne `<html>`: w tym projekcie `app/layout.tsx` jest
 * świadomą przepustką (zwraca `children`), a prawdziwą powłokę dokumentu daje
 * dopiero `[locale]/layout.tsx`. Nietrafiony adres nigdy tam nie dociera, więc
 * bez tego pliku Next renderował 404 bez `<html lang>` - zmierzone: brak
 * atrybutu na `/pl/…`, `/en/…` i na ścieżkach bez prefiksu. To naruszenie
 * WCAG 3.1.1 (język strony) na całej klasie stron, nie przypadek brzegowy.
 *
 * `[locale]/not-found.tsx` zostaje i obsługuje `notFound()` wywołane wewnątrz
 * trasy z językiem - tam mamy locale, tłumaczenia i pełną nawigację.
 *
 * Język: `pl`. Przy adresie, który do niczego nie pasuje, nie wiemy, kim jest
 * odwiedzający - polski jest językiem podstawowym serwisu. Angielskie zdanie
 * jest obok, żeby nikogo nie zostawić bez wyjścia.
 */

export const metadata: Metadata = {
  title: "Nie znaleziono strony - Samorząd Studentów UEW",
  description: "Pod tym adresem nic nie ma. Wróć na stronę główną Samorządu.",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <main className="flex min-h-dvh items-center justify-center px-6">
          <div className="mx-auto max-w-[560px] text-center">
            <p
              aria-hidden="true"
              className="font-display text-[clamp(4rem,14vw,9rem)] font-semibold leading-none tracking-[-0.03em] text-accent"
            >
              404
            </p>
            <h1 className="mt-4 font-display text-[clamp(1.5rem,4vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">
              Tej strony nie znaleźliśmy
            </h1>
            <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink-secondary">
              Być może adres się zmienił albo strona została przeniesiona.
            </p>
            <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-tertiary" lang="en">
              This page doesn&rsquo;t exist. Go back to the home page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/* Zwykły `next/link`, nie ten z `@/i18n/navigation` - tutaj nie
                  ma kontekstu routingu next-intl, więc adresy podajemy wprost
                  z prefiksem języka. */}
              <Link
                href="/pl"
                className="inline-flex h-12 items-center rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-colors hover:bg-accent-dim"
              >
                Strona główna
              </Link>
              <Link
                href="/en"
                className="inline-flex h-12 items-center rounded-lg px-4 text-base font-medium text-ink-secondary transition-colors hover:text-ink-primary"
                lang="en"
              >
                English version
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
