"use client";

import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * Szablon trasy — trzyma punkt orientacyjny <main>, czyli cel odnośnika
 * „przejdź do treści", i opakowuje go w reactowe <ViewTransition>, żeby
 * zmiana strony przenikała łagodnie zamiast przeskakiwać.
 *
 * Świadomie BEZ własnej choreografii. Zamalowywanie pędzlem, które tu przez
 * chwilę stało, było za mocne jak na charakter serwisu. Zredukowany ruch
 * obsługuje globals.css, zerując czas przejścia.
 *
 * Animujemy WYŁĄCZNIE wejście i wyjście, czyli zmianę strony (szablon montuje
 * się od nowa przy każdej nawigacji). `update` i `default` są wyłączone, bo
 * bez tego <ViewTransition> przenika całą stronę przy każdym odsłonięciu
 * Suspense w środku. Na stronie głównej takim odsłonięciem jest leniwie
 * ładowany moduł animacji, więc ok. 1 s po wejściu cała strona gasła
 * i wracała, co wyglądało jak przeładowanie.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" update="none" default="none">
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </ViewTransition>
  );
}
