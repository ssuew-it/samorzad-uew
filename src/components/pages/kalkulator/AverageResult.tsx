"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface Props {
  /** Weighted average, or null when nothing is graded yet. */
  average: number | null;
  gradedEcts: number;
  totalEcts: number;
  labels: {
    heading: string;
    average: string;
    empty: string;
    ects: string; // contains {graded} and {total}
    announce: string; // contains {value}
  };
}

function formatPl(n: number): string {
  return n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AverageResult({ average, gradedEcts, totalEcts, labels }: Props) {
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

  const ectsText = labels.ects
    .replace("{graded}", String(gradedEcts))
    .replace("{total}", String(totalEcts));

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
          <p className="mt-2 font-mono text-[0.8125rem] text-ink-secondary">{ectsText}</p>
          <p className="sr-only" aria-live="polite">
            {labels.announce.replace("{value}", formatPl(average))}
          </p>
        </>
      )}
    </div>
  );
}
