/**
 * Rejestr i rozwiązywanie efektu animacji partnera.
 * Kolejność priorytetu: frames (przyszłe pliki klatkowe) → kategoria → domyślny.
 */

export interface FrameAsset {
  /** URL sprite-sheetu / sekwencji / Lottie / wideo. Format dograny przy wdrożeniu assetów. */
  src: string;
  kind: "sprite" | "sequence" | "lottie" | "video";
}

export interface Partner {
  name: string;
  logo?: string;
  /** Kolor marki - tinta efektu; brak → akcent UEW. */
  color?: string;
  /** Klucz szablonu efektu (patrz CATEGORY_EFFECTS). */
  category?: string;
  /** Przyszłe pliki klatkowe - mają priorytet nad szablonem. */
  frames?: FrameAsset;
}

export type PartnerEffectId = "frames" | "aviation" | "default";

/** Kategorie z gotowym szablonem CSS/motion. Dokładać tu kolejne. */
export const CATEGORY_EFFECTS: Record<string, Exclude<PartnerEffectId, "frames" | "default">> = {
  aviation: "aviation",
};

export function resolvePartnerEffect(partner: Partner): PartnerEffectId {
  if (partner.frames) return "frames";
  if (partner.category && CATEGORY_EFFECTS[partner.category]) {
    return CATEGORY_EFFECTS[partner.category];
  }
  return "default";
}
