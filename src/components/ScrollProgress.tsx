"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const springX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  // Reduced motion: bind directly to scroll position, skip the spring lag.
  const scaleX = reduce ? scrollYProgress : springX;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-accent"
    />
  );
}
