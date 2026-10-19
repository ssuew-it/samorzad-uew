"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { DURATION, EASE } from "@/lib/motion";

interface ImpulseProps {
  /** Kierunek rysowania: pozioma kreska rośnie w prawo, pionowa w dół. */
  orientation?: "horizontal" | "vertical";
  /**
   * Pozycja, grubość i kolor należą do miejsca użycia - tutaj ujednolicamy
   * wyłącznie *ruch*. Podaj klasy jak przy zwykłym elemencie.
   */
  className?: string;
  delay?: number;
  duration?: number;
  /** Jaka część elementu musi wejść w kadr, żeby ślad zaczął się rysować. */
  amount?: number;
}

/**
 * Niebieski Impuls - wspólny ślad, którym strona pokazuje przepływ.
 *
 * Ten sam materiał w różnych rolach: podkreślenie liczby, łącznik między
 * organami, oś procesu. Wcześniej każde z tych miejsc miało własną kopię
 * `initial/whileInView/transition` z osobno wpisanym warunkiem `reduce` -
 * czyli osobną szansę na powtórzenie błędu „treść uwięziona niewidoczna".
 * Tutaj ten warunek istnieje raz.
 *
 * Przy `prefers-reduced-motion` ślad jest od razu narysowany w całości. To
 * świadomy stan docelowy, a nie brak animacji: §9 wizji wymaga, żeby tryb
 * ograniczonego ruchu był osobną, kompletną kompozycją.
 *
 * Element jest czysto dekoracyjny - zawsze `aria-hidden`. Jeśli ślad niesie
 * znaczenie (np. etap procesu), musi ono istnieć również w tekście obok.
 */
export function Impulse({
  orientation = "horizontal",
  className = "",
  delay = 0,
  duration,
  amount = 0.6,
}: ImpulseProps) {
  const reduce = useReducedMotion();
  const horizontal = orientation === "horizontal";

  return (
    <motion.span
      aria-hidden="true"
      initial={horizontal ? { scaleX: 0 } : { scaleY: 0 }}
      whileInView={horizontal ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={{ once: true, amount }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: duration ?? DURATION.draw, delay, ease: EASE }
      }
      className={`${horizontal ? "origin-left" : "origin-top"} block ${className}`}
    />
  );
}
