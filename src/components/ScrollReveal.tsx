import type { CSSProperties, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Opóźnienie w kaskadzie (0-0,4). Przesuwa start względem przewijania. */
  delay?: number;
}

/**
 * Ciche ujawnianie przy przewijaniu - w czystym CSS (klasa `.reveal`
 * w globals.css, `animation-timeline: view()`).
 *
 * Treść NIE jest chowana przed załadowaniem skryptu: komponent nie ma żadnego
 * stanu ani efektu, a animację napędza przewijanie. Dawny wariant ustawiał
 * `opacity: 0` do czasu uruchomienia Intersection Observera, przez co awaria
 * lub opóźnienie JavaScriptu potrafiły zostawić całe sekcje niewidoczne.
 */
export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const style = delay ? ({ "--reveal-delay": Math.min(delay, 0.4) } as CSSProperties) : undefined;
  return (
    <div className={className ? `reveal ${className}` : "reveal"} style={style}>
      {children}
    </div>
  );
}
