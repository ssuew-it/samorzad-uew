"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LazyMotion, MotionConfig } from "motion/react";

/**
 * Funkcje animacji doczytywane po starcie strony. Komponenty używają lekkiego
 * `m.*` zamiast `motion.*` - `strict` zgłosi błąd, gdyby ktoś dopisał `motion.*`,
 * który znowu wciągnąłby całą bibliotekę (ok. 30 KB) do paczki startowej.
 */
const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      {/* reducedMotion="user": przy włączonym ograniczeniu ruchu motion pomija
          animacje przesunięć i skali w całym serwisie. Komponenty i tak pytają
          useReducedMotion, ale ten zwraca „nie” w czasie hydratacji - bez tej
          bariery nagłówki (PageHero, StrefaHero) zdążały wjechać (audyt antislop
          nr 001, pkt 7). */}
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </NextThemesProvider>
  );
}
