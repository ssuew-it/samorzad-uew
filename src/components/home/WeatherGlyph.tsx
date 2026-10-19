"use client";

import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type Icon,
} from "@phosphor-icons/react";
import type { WeatherKind } from "@/lib/weather";
import styles from "./WeatherGlyph.module.css";

/**
 * Znak pogody obok temperatury.
 *
 * Ikona i jej ruch wynikają z tego, co naprawdę dzieje się za oknem: słońce
 * obraca się, chmura dryfuje, deszcz i śnieg opadają, mgła gaśnie i wraca,
 * burza mruga. Dla nieznanego zjawiska nie ma znaku - nie zgadujemy pogody
 * ikoną, tak samo jak nie zgadujemy jej podpisem.
 *
 * Ikony pochodzą z Phosphora, którego projekt już używa; żadnej nowej
 * zależności to nie wprowadza.
 */

const IKONY: Record<Exclude<WeatherKind, "unknown">, Icon> = {
  clear: Sun,
  cloudy: CloudSun,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: CloudRain,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

/** Mżawka dostaje ten sam ruch co deszcz - to ten sam rodzaj zjawiska. */
const RUCH: Record<Exclude<WeatherKind, "unknown">, string> = {
  clear: styles.clear,
  cloudy: styles.cloudy,
  overcast: styles.overcast,
  fog: styles.fog,
  drizzle: styles.rain,
  rain: styles.rain,
  snow: styles.snow,
  storm: styles.storm,
};

export function WeatherGlyph({ kind }: { kind: WeatherKind | null }) {
  if (kind === null || kind === "unknown") return null;
  const Glyph = IKONY[kind];
  return (
    <span className={`${styles.glyph} ${RUCH[kind]}`}>
      {/* `aria-hidden`: pogodę niesie już podpis komórki, więc ikona
          powtarzałaby ją czytnikowi ekranu. */}
      <Glyph size={18} weight="regular" aria-hidden="true" />
    </span>
  );
}
