"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Szerokie zdjęcie zespołu pod hero. Kadr 16:7 mieści całą grupę i kończy
 * się na biodrach - w kadrze obok tytułu (prawie kwadrat) albo widać było
 * nogi pierwszego rzędu, albo odpadały osoby z brzegów (uwaga z 3.11.2026).
 */
export function TeamPhotoBand({ src, alt, position = "50% 30%" }: { src: string; alt: string; position?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-[1200px] pt-8 sm:px-6 md:pt-14">
      <motion.figure
        className="relative aspect-[16/7] overflow-hidden bg-bg-elevated sm:rounded-2xl"
        initial={reduce ? false : { clipPath: "inset(12% 0 12% 0)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0 0% 0)", opacity: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 1, delay: 0.15, ease: EASE }}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 1.4, delay: 0.15, ease: EASE }}
        >
          <Image src={src} alt={alt} fill priority sizes="(min-width: 1248px) 1200px, 100vw" className="object-cover" style={{ objectPosition: position }} />
        </motion.div>
      </motion.figure>
    </div>
  );
}
