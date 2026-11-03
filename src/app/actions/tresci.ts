"use server";

import { updateTag } from "next/cache";
import { getAccess } from "@/lib/access";
import { TRESCI_ROLES } from "@/lib/panel";
import { canSee } from "@/lib/roles-core";
import { TRESCI_TAG } from "@/lib/tresci/arkusz";

/**
 * „Odśwież teraz” w Strefie Działacza. Na co dzień nie jest potrzebny -
 * skrypt w arkuszu odświeża stronę sam - ale gdy ktoś poprawił arkusz,
 * a skrypt nie jest jeszcze podpięty, to jedyna droga bez czekania godziny.
 *
 * Dostęp (sesja + rola, nie tylko sesja) sprawdzamy tutaj, a nie tylko na
 * stronie: akcję serwera da się wywołać z pominięciem przycisku.
 */
export async function refreshTresci(): Promise<void> {
  const access = await getAccess();
  if (!access || !canSee(TRESCI_ROLES, access)) return;
  updateTag(TRESCI_TAG);
}
