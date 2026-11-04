"use client";

import { useState } from "react";
import { previewDocument, type PreviewMode } from "@/lib/signature";

/**
 * „Jak zobaczą to odbiorcy” - ta sama stopka w czterech warunkach, w których
 * najczęściej się psuje: jasna wiadomość, dwa rodzaje trybu ciemnego i wąski
 * ekran telefonu. Iframe trzyma stopkę z dala od stylów strony; wysokość
 * dopasowuje się do treści, więc nic nie jest ucinane.
 */
const MODES: { mode: PreviewMode; width?: number }[] = [
  { mode: "light" },
  { mode: "darkPartial" },
  { mode: "darkInvert" },
  { mode: "phone", width: 360 },
];

export function SignaturePreviews({
  html,
  labels,
}: {
  html: string;
  labels: Record<PreviewMode, { title: string; note: string }>;
}) {
  const [heights, setHeights] = useState<Partial<Record<PreviewMode, number>>>({});

  return (
    <div className="mt-3 grid gap-4 md:grid-cols-2">
      {MODES.map(({ mode, width }) => {
        const dark = mode === "darkPartial" || mode === "darkInvert";
        return (
          <figure key={mode} className="min-w-0 overflow-hidden rounded-2xl border border-border-subtle">
            <figcaption className="border-b border-border-subtle bg-bg-surface px-4 py-3">
              <span className="block text-[0.875rem] font-semibold text-ink-primary">{labels[mode].title}</span>
              <span className="mt-0.5 block text-[0.75rem] leading-[1.45] text-ink-tertiary">{labels[mode].note}</span>
            </figcaption>
            <div className={`overflow-x-auto ${dark ? "bg-[#202124]" : "bg-white"}`}>
              <iframe
                title={labels[mode].title}
                srcDoc={previewDocument(html, mode)}
                onLoad={(e) => {
                  const h = e.currentTarget.contentDocument?.documentElement.scrollHeight;
                  if (h) setHeights((prev) => (prev[mode] === h ? prev : { ...prev, [mode]: h }));
                }}
                style={{ height: heights[mode] ?? 420, width: width ?? "100%", minWidth: width ? undefined : 470 }}
                className="block border-0"
              />
            </div>
          </figure>
        );
      })}
    </div>
  );
}
