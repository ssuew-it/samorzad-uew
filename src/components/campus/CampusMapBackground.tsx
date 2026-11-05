import { CAMPUS_GEOMETRY } from "@/lib/campus-map-data";
import styles from "./CampusMap.module.css";

/**
 * Nieruchome warstwy planu: obszar kampusu, zieleń, boiska, parkingi, ulice,
 * chodniki i schody, torowiska, budynki w tle, drzewa i nazwy ulic.
 * Komponent serwerowy - geometria trafia do HTML raz, a nie do paczki JS.
 * Interaktywne budynki, punkty i trasy rysuje CampusMap.
 */
export function CampusMapBackground() {
  const g = CAMPUS_GEOMETRY;
  // Drzewa jednym ścieżką zamiast 800 elementów <circle> - lżejszy DOM.
  const trees = g.trees.map(([x, y]) => `M${x - 2.2} ${y}a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0`).join("");
  return (
    <>
      <g className={styles.campusArea}>
        {g.campus.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className={styles.green}>
        {g.green.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className={styles.pitches}>
        {g.pitches.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className={styles.parkings}>
        {g.parkings.map((p, i) => (
          <path key={i} d={p.d} />
        ))}
      </g>
      <g className={styles.roads}>
        {g.roads.map((r, i) => (
          <path key={i} d={r.d} data-major={r.major || undefined} />
        ))}
      </g>
      <g className={styles.footpaths}>
        {g.footpaths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className={styles.steps}>
        {g.steps.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className={styles.rails}>
        {g.rails.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className={styles.context}>
        {g.context.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <path className={styles.trees} d={trees} />
      <g className={styles.parkingLabels}>
        {g.parkings
          .filter((p) => p.at)
          .map((p, i) => (
            <text key={i} x={p.at![0]} y={p.at![1]}>
              P
            </text>
          ))}
      </g>
      <g className={styles.roadLabels}>
        {g.labels.map((l) => (
          <text key={l.name} transform={`translate(${l.at[0]} ${l.at[1]}) rotate(${l.angle})`} dy="4">
            {l.name}
          </text>
        ))}
      </g>
    </>
  );
}
