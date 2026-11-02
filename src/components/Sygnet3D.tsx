import styles from "./Sygnet3D.module.css";

/** Liczba warstw bryły. Przy 0,65 px odstępu daje ok. 12 px grubości przy 112 px wysokości. */
const LAYERS = 20;

/**
 * Sygnet Samorządu jako bryła 3D, która powoli obraca się wokół pionowej osi.
 *
 * Bez WebGL i bez pliku 3D: kilkanaście warstw tego samego znaku
 * (maska z public/sygnet.svg) ułożonych jedna za drugą w osi Z. Przód i tył
 * mają gradient w kolorze marki, warstwy środkowe są ciemniejsze i tworzą
 * boki bryły. Animowany jest tylko `transform` kontenera, więc obrót idzie
 * na GPU. Przy ograniczonym ruchu znak stoi lekko obrócony.
 */
export function Sygnet3D({ className }: { className?: string }) {
  return (
    <div className={`${styles.scene} ${className ?? ""}`} aria-hidden="true">
      <div className={styles.body}>
        {Array.from({ length: LAYERS }, (_, i) => (
          <span
            key={i}
            className={i === 0 ? styles.back : i === LAYERS - 1 ? styles.front : styles.side}
            style={{ "--z": i - (LAYERS - 1) / 2 } as React.CSSProperties}
          />
        ))}
      </div>
      <span className={styles.shadow} />
    </div>
  );
}
