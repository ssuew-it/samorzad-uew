"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { readConsent, subscribeConsent } from "@/lib/consent";

/**
 * Asystent doładowywany osobno i dopiero wtedy, gdy:
 * - zapadła decyzja o zgodzie na cookies (dymek i tak czeka na baner, bo
 *   siedzą w tym samym rogu - patrz AssistantBubble),
 * - strona się załadowała i przeglądarka jest bezczynna.
 * Dzięki temu jego kod nie konkuruje o łącze i procesor z pierwszym ekranem.
 */
const AssistantBubble = dynamic(
  () => import("./AssistantBubble").then((m) => m.AssistantBubble).catch(() => () => null),
  { ssr: false },
);

let idle = false;
let scheduled = false;
const listeners = new Set<() => void>();

function subscribeIdle(onChange: () => void) {
  listeners.add(onChange);
  if (!scheduled) {
    scheduled = true;
    const ready = () => {
      idle = true;
      listeners.forEach((l) => l());
    };
    // Safari nie ma requestIdleCallback - tam po prostu chwila po załadowaniu.
    const whenIdle = () =>
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(ready, { timeout: 3000 })
        : setTimeout(ready, 1500);
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
  }
  return () => {
    listeners.delete(onChange);
  };
}

export function LazyAssistantBubble({ ready }: { ready: boolean }) {
  const settled = useSyncExternalStore(subscribeConsent, () => readConsent() !== null, () => false);
  const idleReady = useSyncExternalStore(subscribeIdle, () => idle, () => false);
  return settled && idleReady ? <AssistantBubble ready={ready} /> : null;
}
