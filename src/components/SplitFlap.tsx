"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Split-flap (tablica „odlotów" / Solari) — ciąg znaków w ciemnych celach,
 * każdy „przewraca się" przy wejściu. Mono, zakorzenione w technicznej
 * tożsamości. Reduced-motion: bez obrotu (statyczne cele).
 */
export function SplitFlap({
  text,
  size = "md",
  className,
}: {
  text: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const chars = text.split("");
  const cell =
    size === "lg"
      ? "h-12 min-w-[30px] text-[26px]"
      : "h-9 min-w-[22px] text-[17px]";

  return (
    <span className={`inline-flex flex-wrap gap-[3px] ${className ?? ""}`} role="img" aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`inline-flex items-center justify-center rounded-[3px] bg-[#0B1322] px-1 font-mono font-semibold text-white ${cell}`}
          style={
            reduce
              ? undefined
              : {
                  animation: `split-flap 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both`,
                  transformOrigin: "center top",
                }
          }
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
