"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "@phosphor-icons/react";

/**
 * Click-to-load YouTube. Do kliknięcia pokazujemy tylko miniaturę (cookieless
 * i.ytimg.com) + przycisk - żaden śledzący skrypt/iframe YouTube nie ładuje się,
 * dopóki student sam nie kliknie. Wtedy montujemy youtube-nocookie z autoplay.
 */
export function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const poster = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={title}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated"
    >
      <Image src={poster} alt="" aria-hidden fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
      <span aria-hidden className="absolute inset-0 bg-ink-primary/20 transition-colors group-hover:bg-ink-primary/30" />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg-base transition-transform duration-200 group-hover:scale-105"
      >
        <Play size={28} weight="fill" />
      </span>
    </button>
  );
}
