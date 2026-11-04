/**
 * Wybór „mój tryb, kierunek i rok” zapamiętany w przeglądarce.
 *
 * Zapisuje go plan zajęć (PlanSubskrypcja), a czytają Terminy roku - jeden
 * wybór filtruje całą stronę Kalendarza. Tylko na tym urządzeniu (localStorage);
 * brak pamięci (tryb prywatny) znaczy po prostu „nic nie wybrano”.
 */
import type { StudyChoice } from "./audience-match";

const KEY = "ssuew:moja-grupa";
const EVENT = "ssuew-moja-grupa";

let cachedRaw: string | null | undefined;
let cachedValue: StudyChoice | null = null;

export function readStudyChoice(): StudyChoice | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  // Ten sam obiekt dla tego samego zapisu - wymóg useSyncExternalStore.
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const v = raw ? (JSON.parse(raw) as StudyChoice) : null;
    cachedValue = v && v.mode && v.program && v.year ? v : null;
  } catch {
    cachedValue = null;
  }
  return cachedValue;
}

export function writeStudyChoice(choice: StudyChoice | null): void {
  try {
    if (choice) window.localStorage.setItem(KEY, JSON.stringify(choice));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Bez pamięci wybór działa tylko do przeładowania.
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribeStudyChoice(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
