"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface Blob {
  x: number;
  y: number;
  r: number;
  sx: number;
  sy: number;
  px: number;
  py: number;
  alpha: number;
}

const BLOBS: Blob[] = [
  { x: 0.3, y: 0.35, r: 0.5, sx: 0.00007, sy: 0.00009, px: 0, py: 1.7, alpha: 0.2 },
  { x: 0.72, y: 0.5, r: 0.42, sx: 0.00009, sy: 0.00006, px: 2.1, py: 0.3, alpha: 0.13 },
  { x: 0.5, y: 0.72, r: 0.38, sx: 0.00006, sy: 0.0001, px: 4.0, py: 2.5, alpha: 0.1 },
];

function hexToRgb(hex: string): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return "91, 157, 249";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * Dependency-free animated "aurora" field rendered on canvas — the hero's
 * signature ambient. Slow drifting gold light blobs (additive blend) over the
 * dark base. Theme-aware (reads --accent), DPR-aware, pauses off-screen / when
 * the tab is hidden, and renders a single static frame under reduced-motion.
 */
export function AuroraField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let accent = "#5B9DF9";
    let isDark = true;

    const readColors = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      if (v) accent = v;
      isDark = document.documentElement.classList.contains("dark");
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      // Additive glow reads well on dark; on light use normal blend so the
      // blue tints the surface instead of washing it out to white.
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      const alphaScale = isDark ? 1 : 0.7;
      const rgb = hexToRgb(accent);
      const span = Math.max(width, height);
      for (const b of BLOBS) {
        const cx = (b.x + Math.sin(t * b.sx + b.px) * 0.12) * width;
        const cy = (b.y + Math.cos(t * b.sy + b.py) * 0.12) * height;
        const rad = b.r * span;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${rgb}, ${b.alpha * alphaScale})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    readColors();
    resize();

    if (reduce) {
      draw(0);
      const ro = new ResizeObserver(() => {
        resize();
        draw(0);
      });
      ro.observe(parent);
      return () => ro.disconnect();
    }

    const loop = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);

    const onVisibility = () => {
      const shouldRun = !document.hidden;
      if (shouldRun && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!shouldRun) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
