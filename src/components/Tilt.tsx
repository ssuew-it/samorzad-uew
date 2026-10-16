"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees. */
  max?: number;
}

/**
 * Subtle 3D tilt toward the cursor. Pointer-only enhancement — disabled under
 * reduced-motion (renders a plain div) and inert on touch (no mouse events).
 */
export function Tilt({ children, className, max = 8 }: TiltProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), {
    stiffness: 200,
    damping: 20,
  });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
