/**
 * Magazyn ról Strefy Działacza w Vercel Global Config (dawniej Edge Config) -
 * jeden rekord pod kluczem `role` z całym `RolesStore` (Task 1). Odczyt
 * SDK-em (ultra-niskie opóźnienie, czytane przy każdym żądaniu); zapis przez
 * REST API Vercela, bo SDK służy tylko do odczytu.
 *
 * Bez connection stringa magazyn po prostu nie istnieje - strony Strefy
 * działają, tylko wszyscy poza superadminem widzą rolę "normal" (patrz access.ts).
 */
import "server-only";
import { createClient } from "@vercel/global-config";
import { emptyStore, parseRolesStore, type RolesStore } from "./roles-core";

export const ROLES_KEY = "role";

export type StoreRead = { ok: true; store: RolesStore; configured: boolean } | { ok: false };

/**
 * Connection string magazynu. Po przemianowaniu produktu Vercel przy
 * podpinaniu magazynu dodaje zmienną `GLOBAL_CONFIG`; starsze magazyny miały
 * `EDGE_CONFIG`. Przyjmujemy obie, żeby przemianowanie nie wyłączyło ról.
 */
export function rolesConnectionString(): string | undefined {
  return process.env.GLOBAL_CONFIG || process.env.EDGE_CONFIG || undefined;
}

/**
 * Odczytuje magazyn ról. Bez connection stringa zwraca pusty magazyn jako
 * "nieskonfigurowany" (nie dotykamy SDK - łączenie się bez connection stringa
 * i tak by rzuciło). Błąd SDK (np. token/edge config usunięty) -> `ok:false`,
 * a decyzję co z tym zrobić podejmuje `getAccessFor`.
 *
 * SDK czyta przez `fetch` z `no-store` (patrz README @vercel/global-config),
 * więc wynik nie jest cache'owany między żądaniami - a strony Strefy są
 * i tak dynamiczne przez `cookies()`.
 *
 * `consistent: true` (SDK: `consistentRead`) czyta prosto ze źródła,
 * z pominięciem kopii brzegowej i pamięci podręcznej SDK w development.
 * Używają go WYŁĄCZNIE akcje panelu ról przed zapisem: zapis zastępuje cały
 * klucz, więc odczyt sprzed kilku sekund (zmiana jeszcze się nie rozeszła)
 * cofnąłby poprzednią zmianę - np. zablokuj X, edytuj Y -> X odblokowany,
 * a w `npm run dev` „dodaj A, dodaj B” gubiło A za każdym razem. Zwykłe
 * odczyty (strony, sprawdzanie dostępu) zostają szybkie - kilkusekundowe
 * opóźnienie roli jest tam bez znaczenia.
 */
export async function readRolesStore(options?: { consistent?: boolean }): Promise<StoreRead> {
  const connectionString = rolesConnectionString();
  if (!connectionString) {
    return { ok: true, store: emptyStore(), configured: false };
  }
  try {
    const client = createClient(connectionString);
    const raw = options?.consistent
      ? await client.get(ROLES_KEY, { consistentRead: true })
      : await client.get(ROLES_KEY);
    return { ok: true, store: parseRolesStore(raw), configured: true };
  } catch {
    return { ok: false };
  }
}

/** Czy edycja magazynu (zapis) jest możliwa - wymaga ID magazynu i tokenu API,
 *  oba osobne od connection stringa (ten służy tylko do odczytu). */
export function canWriteRoles(): boolean {
  return Boolean(process.env.EDGE_CONFIG_ID && process.env.VERCEL_API_TOKEN);
}

/**
 * Zapisuje cały magazyn ról przez REST API Vercela (SDK Edge Config nie
 * wspiera zapisu). `upsert` zastępuje wartość pod kluczem `role` w całości -
 * edycje magazynu robimy więc zawsze na jego kopii (patrz roles-core.ts).
 * Rzuca, gdy odpowiedź nie jest `ok` (np. 403 - zły token albo zły zakres).
 */
export async function writeRolesStore(store: RolesStore): Promise<void> {
  const id = process.env.EDGE_CONFIG_ID;
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const url = new URL(`https://api.vercel.com/v1/edge-config/${id}/items`);
  if (teamId) url.searchParams.set("teamId", teamId);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items: [{ operation: "upsert", key: ROLES_KEY, value: store }] }),
  });
  if (!res.ok) {
    throw new Error(`Zapis magazynu ról nie powiódł się (HTTP ${res.status})`);
  }
}
