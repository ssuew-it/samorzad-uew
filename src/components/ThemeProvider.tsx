"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "motion/react";

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
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
