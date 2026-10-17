import type { ReactNode } from "react";
import styles from "./ScrollSteps.module.css";

export interface ScrollStep {
  key: string;
  title: string;
  desc: string;
  /** Dodatkowa treść pod opisem kroku (linki, lista). */
  extra?: ReactNode;
}

/**
 * Oś kroków, która rysuje się razem z przewijaniem.
 *
 * Wspólna dla procesów na stronach Dla studenta (Stypendia, Rzecznik,
 * Wydawnictwo). Ruch to czyste CSS (`animation-timeline: view()`): szyna
 * wypełnia się na niebiesko, a węzły zapalają, gdy krok wjeżdża w środek
 * ekranu. Bez wsparcia przeglądarki albo przy ograniczonym ruchu oś stoi
 * statycznie i wszystko jest od razu czytelne.
 */
export function ScrollSteps({ steps, className }: { steps: ScrollStep[]; className?: string }) {
  return (
    <ol className={`${styles.steps}${className ? ` ${className}` : ""}`}>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.railFill} />
      </span>
      {steps.map((step, i) => (
        <li key={step.key} className={styles.step}>
          <span className={styles.node} aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.desc}>{step.desc}</p>
            {step.extra}
          </div>
        </li>
      ))}
    </ol>
  );
}
