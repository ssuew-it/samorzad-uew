/**
 * Zgoda na analitykę - wspólny stan dla banera i dla wszystkiego, co nie może
 * się z nim bić o miejsce na ekranie.
 *
 * Powód wydzielenia: baner zgody jest przyklejony do dołu ekranu i na telefonie
 * zajmuje całą szerokość. Dymek asystenta siedzi w tym samym rogu, więc dopóki
 * baner wisi, dymek jest fizycznie nieklikalny. Zamiast przesuwać przyciski,
 * przyjmujemy zasadę: **najpierw decyzja o zgodzie, potem reszta**.
 *
 * `storage` nie odpala się w karcie, która sama zapisała wartość, więc zmianę
 * rozgłaszamy własnym zdarzeniem.
 */

export type Consent = "accepted" | "rejected";

export const CONSENT_KEY = "ssuew-consent";
export const CONSENT_EVENT = "ssuew-consent-change";

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "accepted" || stored === "rejected" ? stored : null;
}

export function writeConsent(consent: Consent): void {
  window.localStorage.setItem(CONSENT_KEY, consent);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

/** Wywołuje `onChange` po każdej decyzji - także z innej karty. */
export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
