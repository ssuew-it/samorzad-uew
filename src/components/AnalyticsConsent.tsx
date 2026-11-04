"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";

// Baner widzi tylko ktoś, kto jeszcze nie zdecydował - reszta nie pobiera jego kodu.
const ConsentBanner = dynamic(() => import("./ConsentBanner").then((m) => m.ConsentBanner), { ssr: false });
import { readConsent, subscribeConsent, writeConsent, type Consent } from "@/lib/consent";

/**
 * Analityka (Vercel, bez ciasteczek) ładowana TYLKO po zgodzie. Niezbędne
 * ciasteczka (sesja działacza, język) działają niezależnie od tego wyboru.
 * Wybór trzymamy w localStorage, więc baner nie wraca po decyzji - chyba że
 * ktoś kliknie „Ustawienia cookies” w stopce (clearConsent).
 */
export function AnalyticsConsent() {
  const [state, setState] = useState<{ ready: boolean; consent: Consent | null }>({
    ready: false,
    consent: null,
  });

  // localStorage jest dostępny dopiero po stronie klienta.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ready: true, consent: readConsent() });
    return subscribeConsent(() => setState({ ready: true, consent: readConsent() }));
  }, []);

  // Skrypt analityki raz załadowany zostaje w pamięci strony - przy wycofaniu
  // zgody przeładowujemy, żeby na pewno przestał działać.
  const analyticsLoaded = useRef(false);
  useEffect(() => {
    if (state.consent === "accepted") analyticsLoaded.current = true;
  }, [state.consent]);

  const choose = (c: Consent) => {
    writeConsent(c);
    if (c === "rejected" && analyticsLoaded.current) window.location.reload();
  };

  return (
    <>
      {state.consent === "accepted" && <Analytics />}
      {state.ready && state.consent === null && (
        <ConsentBanner onAccept={() => choose("accepted")} onReject={() => choose("rejected")} />
      )}
    </>
  );
}
