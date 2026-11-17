"use client";

import type { ReactNode } from "react";
import { clearAccountHint, primeAccount } from "../AccountMenu";
import { CEL_KLUCZ } from "@/lib/rejestr-widok";

/**
 * Wyspy Strefy Działacza - jedyne kawałki panelu, które potrzebują
 * przeglądarki. Reszta (karta, kafelki, ekran logowania) renderuje się na
 * serwerze w StrefaDzialaczaContent.
 */

/**
 * Tu ląduje logowanie Google. Serwer zna już konto, więc przekazujemy je
 * przyciskowi w nawigacji od razu - bez tego przy pierwszym logowaniu stałby
 * tam „Zaloguj się” aż do odpowiedzi /api/auth/me. Wywołanie w renderze jest
 * celowe (patrz komentarz przy primeAccount).
 */
export function ZasiejKonto({ name, picture }: { name: string; picture?: string }) {
  primeAccount({ name, picture });
  return null;
}

/**
 * POST, nie link: GET-em dałoby się wylogować kogoś obcą stroną. Podpowiedź
 * konta kasujemy przy wysłaniu, jak w menu konta - inaczej po przekierowaniu
 * pasek pokazałby jeszcze avatar z zieloną kropką, aż do odpowiedzi
 * /api/auth/me.
 */
export function WylogujForm({ action, className, children }: { action: string; className?: string; children: ReactNode }) {
  return (
    <form method="post" action={action} onSubmit={clearAccountHint} className={className}>
      {children}
    </form>
  );
}

/** Link do zarządzenia (#z-…) - po logowaniu Google wraca bez #, więc zapamiętujemy cel. */
export function LogowanieLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={() => {
        try {
          if (location.hash) sessionStorage.setItem(CEL_KLUCZ, location.hash);
        } catch {
          // Bez pamięci przeglądarki po prostu trafi na początek Strefy.
        }
      }}
      className={className}
    >
      {children}
    </a>
  );
}
