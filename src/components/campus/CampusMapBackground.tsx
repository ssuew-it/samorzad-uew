import { CAMPUS_GEOMETRY } from "@/lib/campus-map-data";
import styles from "./CampusMap.module.css";

/**
 * Nieruchome warstwy planu: obszar kampusu, zieleń, ulice, torowiska, budynki
 * w tle i nazwy ulic. Komponent serwerowy - ok. 60 KB geometrii trafia do HTML
 * raz, a nie do paczki JS. Interaktywne budynki Uczelni rysuje CampusMap.
 */
export function CampusMapBackground() {
  const g = CAMPUS_GEOMETRY;
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
      <g className={styles.roads}>
        {g.roads.map((r, i) => (
          <path key={i} d={r.d} data-major={r.major || undefined} />
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
