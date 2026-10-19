"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface SpotlightProps {
  /** Diameter of the glow in px. */
  size?: number;
}

/**
 * Cursor-following gold glow. Adapted from ibelick's spotlight to motion/react +
 * our design tokens. Attaches to its parent element (which becomes the hover
 * surface). Decorative only - disabled entirely under prefers-reduced-motion
 * and on touch (no hover), so it never blocks interaction or accessibility.
 */
export function Spotlight({ size = 420 }: SpotlightProps) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [parent, setParent] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { bounce: 0, duration: 0.4 });
  const y = useSpring(mouseY, { bounce: 0, duration: 0.4 });
  const left = useTransform(x, (v) => `${v - size / 2}px`);
  const top = useTransform(y, (v) => `${v - size / 2}px`);

  useEffect(() => {
    if (reduce) return;
    const el = containerRef.current?.parentElement;
    if (!el) return;
    el.style.position = "relative";
    el.style.overflow = "hidden";
    setParent(el);
  }, [reduce]);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [parent, mouseX, mouseY],
  );

  useEffect(() => {
    if (!parent || reduce) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("mouseenter", enter);
    parent.addEventListener("mouseleave", leave);
    return () => {
      parent.removeEventListener("mousemove", handleMove);
      parent.removeEventListener("mouseenter", enter);
      parent.removeEventListener("mouseleave", leave);
    };
  }, [parent, handleMove, reduce]);

  if (reduce) return null;

  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-0 rounded-full blur-3xl transition-opacity duration-300"
      style={{
        width: size,
        height: size,
        left,
        top,
        opacity: hovered ? 1 : 0,
        background:
          "radial-gradient(circle at center, color-mix(in srgb, var(--accent) 24%, transparent), transparent 70%)",
      }}
    />
  );
}
