"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { readConsent, subscribeConsent } from "@/lib/consent";
import { feedbackDone, feedbackForcedByUrl } from "@/lib/feedback-flag";

/**
 * Kiedy pokazać „Jak oceniasz nową stronę?”:
 * - po minucie na stronie, licząc od pierwszego wejścia w tej karcie (przejścia
 *   między podstronami nie zerują licznika - układ strony zostaje zamontowany),
 * - NIE czekamy na decyzję o cookies: większość osób baner ignoruje i do 11.2026
 *   przez to nie widziała oceny wcale. Gdy baner jeszcze stoi, okienko staje
 *   nad nim (oba siedzą na dole ekranu, na laptopie i telefonie by się nakryły),
 * - tylko raz: po ocenie albo zamknięciu już nie wraca (lib/feedback-flag).
 * Kod okienka ładuje się dopiero wtedy - nie obciąża pierwszego wejścia.
 */
const FeedbackPromptPresence = dynamic(
  () => import("./FeedbackPrompt").then((m) => m.FeedbackPromptPresence).catch(() => () => null),
  { ssr: false },
);

const PO_MS = 60_000;
/** Odstęp między okienkiem a banerem cookies. */
const ODSTEP = 12;
let start: number | null = null;

/** Ile px od dołu ekranu musi stać okienko, żeby nie nachodzić na baner (undefined = banera nie ma). */
function useNadBanerem(aktywne: boolean): number | undefined {
  const banerJest = useSyncExternalStore(subscribeConsent, () => readConsent() === null, () => false);
  const [bottom, setBottom] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!aktywne || !banerJest) return;
    let obs: ResizeObserver | null = null;
    const mierz = () => {
      const el = document.querySelector("[data-consent-banner]");
      if (!el) return setBottom(undefined);
      setBottom(Math.round(window.innerHeight - el.getBoundingClientRect().top + ODSTEP));
      if (!obs) {
        obs = new ResizeObserver(mierz);
        obs.observe(el);
      }
    };
    // Baner montuje się po hydratacji i wjeżdża animacją: czekamy na jego
    // pojawienie się w DOM, mierzymy po klatce, przy zmianie rozmiaru i na końcu animacji.
    const dom = new MutationObserver(mierz);
    dom.observe(document.body, { childList: true, subtree: true });
    const raf = requestAnimationFrame(mierz);
    const pozniej = setTimeout(mierz, 600);
    window.addEventListener("resize", mierz);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(pozniej);
      window.removeEventListener("resize", mierz);
      dom.disconnect();
      obs?.disconnect();
    };
  }, [aktywne, banerJest]);

  return aktywne && banerJest ? bottom : undefined;
}

export function LazyFeedbackPrompt() {
  const [open, setOpen] = useState(false);
  const bottom = useNadBanerem(open);

  useEffect(() => {
    if (feedbackDone()) return;
    start ??= Date.now();
    const wait = feedbackForcedByUrl(window.location.search) ? 0 : Math.max(0, PO_MS - (Date.now() - start));
    const t = setTimeout(() => setOpen(true), wait);
    return () => clearTimeout(t);
  }, []);

  return <FeedbackPromptPresence open={open} onClose={() => setOpen(false)} bottom={bottom} />;
}
