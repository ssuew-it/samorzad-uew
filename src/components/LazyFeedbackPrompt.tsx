"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { readConsent, subscribeConsent } from "@/lib/consent";
import { feedbackDone, feedbackForcedByUrl } from "@/lib/feedback-flag";

/**
 * Kiedy pokazać „Jak oceniasz nową stronę?”:
 * - po decyzji o zgodzie na cookies (baner siedzi w tym samym dolnym pasie),
 * - po minucie na stronie, licząc od pierwszego wejścia w tej karcie (przejścia
 *   między podstronami nie zerują licznika - układ strony zostaje zamontowany),
 * - tylko raz: po ocenie albo zamknięciu już nie wraca (lib/feedback-flag).
 * Kod okienka ładuje się dopiero wtedy - nie obciąża pierwszego wejścia.
 */
const FeedbackPromptPresence = dynamic(
  () => import("./FeedbackPrompt").then((m) => m.FeedbackPromptPresence).catch(() => () => null),
  { ssr: false },
);

const PO_MS = 60_000;
let start: number | null = null;

export function LazyFeedbackPrompt() {
  const settled = useSyncExternalStore(subscribeConsent, () => readConsent() !== null, () => false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!settled || feedbackDone()) return;
    start ??= Date.now();
    const wait = feedbackForcedByUrl(window.location.search) ? 0 : Math.max(0, PO_MS - (Date.now() - start));
    const t = setTimeout(() => setOpen(true), wait);
    return () => clearTimeout(t);
  }, [settled]);

  if (!settled) return null;
  return <FeedbackPromptPresence open={open} onClose={() => setOpen(false)} />;
}
