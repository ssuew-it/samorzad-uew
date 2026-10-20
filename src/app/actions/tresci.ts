"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/lib/auth";
import { TRESCI_TAG } from "@/lib/tresci/arkusz";

/**
 * „Odśwież teraz” w Strefie działacza. Na co dzień nie jest potrzebny -
 * skrypt w arkuszu odświeża stronę sam - ale gdy ktoś poprawił arkusz,
 * a skrypt nie jest jeszcze podpięty, to jedyna droga bez czekania godziny.
 *
 * Sesję sprawdzamy tutaj, a nie tylko na stronie: akcję serwera da się
 * wywołać z pominięciem przycisku.
 */
export async function refreshTresci(): Promise<void> {
  const session = await getSession();
  if (!session) return;
  updateTag(TRESCI_TAG);
}
