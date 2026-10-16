"use client";

import { useRef, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface MagneticButtonProps {
  children: ReactNode;
  href: string;
  className?: string;
  ariaLabel?: string;
  external?: boolean;
  strength?: number;
}

/**
 * Anchor that gently follows the cursor (magnetic effect). Decorative —
 * disabled under reduced-motion and inert on touch.
 */
export function MagneticButton({
  children,
  href,
  className,
  ariaLabel,
  external,
  strength = 0.35,
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });

  const rel = external ? "noopener noreferrer" : undefined;
  const target = external ? "_blank" : undefined;

  if (reduce) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
