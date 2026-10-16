"use client";

import { useSyncExternalStore } from "react";

/**
 * `prefers-reduced-motion` bezpieczne dla hydratacji.
 *
 * Używaj ZAMIAST `useReducedMotion` z "motion/react".
 *
 * Dlaczego: serwer nie zna ustawień systemu, więc zawsze renderuje wariant
 * „z ruchem”. Hook z biblioteki motion przy pierwszym renderze w przeglądarce
 * od razu zwraca prawdziwą wartość, więc komponent, który przy ograniczonym
 * ruchu zwraca INNY HTML (np. statyczną wersję zamiast przyklejonej paralaksy),
 * nie zgadzał się z HTML-em z serwera. React zgłaszał błąd hydratacji #418
 * i renderował stronę od zera — akurat u osób, które ograniczenie ruchu
 * włączyły ze względu na dostępność (strona główna i „Dla studenta”, 10.2026).
 *
 * `useSyncExternalStore` z osobnym zrzutem dla serwera rozwiązuje to tak, jak
 * React to przewiduje: podczas hydratacji zwraca wartość serwerową (false),
 * a zaraz potem przełącza się na prawdziwe ustawienie i reaguje na jego zmiany.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
