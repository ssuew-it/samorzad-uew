"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/**
 * Wybór jednej z kart (wzorzec zakładek WAI-ARIA, automatyczna aktywacja):
 * strzałki, Home i End przesuwają wybór, najechanie myszą też wybiera
 * (tylko wskaźnik `mouse` - dotyk wybiera stuknięciem). Zmiana z klawiatury
 * idzie bez animacji panelu (`instant`): powtarzana wiele razy z rzędu
 * tylko by spowalniała.
 */
export function useWybor(count: number) {
  const [selected, setSelected] = useState(0);
  const [instant, setInstant] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, fromKeyboard: boolean) => {
    setInstant(fromKeyboard);
    setSelected(i);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (selected + 1) % count
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (selected - 1 + count) % count
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? count - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    select(next, true);
    refs.current[next]?.focus();
  };

  const tabProps = (i: number, ids: { tab: (i: number) => string; panel: string }) => ({
    ref: (el: HTMLButtonElement | null) => {
      refs.current[i] = el;
    },
    id: ids.tab(i),
    role: "tab" as const,
    type: "button" as const,
    "aria-selected": selected === i,
    "aria-controls": ids.panel,
    tabIndex: selected === i ? 0 : -1,
    onClick: () => select(i, false),
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "mouse") select(i, false);
    },
  });

  return { selected, instant, onKeyDown, tabProps };
}
