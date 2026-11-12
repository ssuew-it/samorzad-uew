import type { CSSProperties } from "react";
import Image from "next/image";
import type { ProjectLogo as Logo } from "@/lib/photos";

/**
 * Logotyp projektu w wersji pasującej do motywu: jasna wersja na jasnym tle,
 * ciemna (z białym tuszem) w trybie ciemnym. Obie są w kodzie strony, a CSS
 * pokazuje jedną - bez mignięcia złego logo przy wczytaniu.
 *
 * `alt` pusty, gdy obok stoi nazwa projektu tekstem (np. nagłówek sceny);
 * z nazwą, gdy logotyp sam jest treścią linku.
 */
export function ProjectLogo({
  logo,
  height,
  alt = "",
  className = "",
  style,
}: {
  logo: Logo;
  height: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const width = (photo: Logo["light"]) => Math.round((height * photo.width) / photo.height);
  return (
    <span className={`inline-flex shrink-0 ${className}`} style={style}>
      <Image
        src={logo.light.src}
        alt={alt}
        width={width(logo.light)}
        height={height}
        sizes={`${width(logo.light)}px`}
        className="h-auto max-h-full w-auto max-w-full object-contain dark:hidden"
      />
      <Image
        src={logo.dark.src}
        alt={alt}
        width={width(logo.dark)}
        height={height}
        sizes={`${width(logo.dark)}px`}
        className="hidden h-auto max-h-full w-auto max-w-full object-contain dark:block"
      />
    </span>
  );
}
