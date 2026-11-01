"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface Props {
  /** Średnia arytmetyczna albo null, gdy nie ma jeszcze ocen. */
  average: number | null;
  graded: number;
  total: number;
  /** Próg „wyróżniających wyników” (§ 19 ust. 2 Regulaminu świadczeń). */
  minimum: number;
  labels: {
    heading: string;
    average: string;
    empty: string;
    count: string; // contains {graded} and {total}
    announce: string; // contains {value}
    below: string; // contains {min}
  };
}

function formatPl(n: number): string {
  return n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AverageResult({ average, graded, total, minimum, labels }: Props) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (average === null) {
      if (prev.current !== 0) setDisplay(0);
      prev.current = 0;
      return;
    }
    if (reduce) {
      if (prev.current !== average) setDisplay(average);
      prev.current = average;
      return;
    }
    const controls = animate(prev.current, average, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = average;
    return () => controls.stop();
  }, [average, reduce]);

  const countText = labels.count.replace("{graded}", String(graded)).replace("{total}", String(total));

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8">
      <p className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-accent">
        {labels.heading}
      </p>

      {average === null ? (
        <p className="mt-4 text-[0.9375rem] leading-[1.6] text-ink-secondary">{labels.empty}</p>
      ) : (
        <>
          <div className="mt-3 flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className="font-mono text-[clamp(2.5rem,7vw,4rem)] font-semibold tabular-nums tracking-[-0.02em] text-ink-primary"
            >
              {formatPl(display)}
            </span>
            <span className="text-[0.8125rem] text-ink-tertiary">{labels.average}</span>
          </div>
          <p className="mt-2 font-mono text-[0.8125rem] text-ink-secondary">{countText}</p>
          {average < minimum ? (
            <p className="mt-3 text-[0.875rem] leading-[1.55] text-ink-primary">{labels.below.replace("{min}", formatPl(minimum))}</p>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {labels.announce.replace("{value}", formatPl(average))}
          </p>
        </>
      )}
    </div>
  );
}
