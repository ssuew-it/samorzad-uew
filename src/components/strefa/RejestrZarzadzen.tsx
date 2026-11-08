"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowSquareOut, LinkSimple, MagnifyingGlass, Scales } from "@phosphor-icons/react";
import { CEL_KLUCZ, celZHash, filtrujRejestr, komunikatBrakuWynikow, NA_START, type FiltrRejestru } from "@/lib/rejestr-widok";
import type { GrupaWydajacego, PozycjaRejestru } from "@/lib/zarzadzenia-wewnetrzne";

const LEX_URL = "https://lbd.ue.wroc.pl/183-logowanie/?ReturnUrl=%2f";
const GRUPY: (GrupaWydajacego | "wszyscy")[] = ["wszyscy", "przewodniczacy", "wiceprzewodniczacy", "czlonek", "zarzad"];

const data = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

/**
 * Rejestr zarządzeń w Strefie Działacza. Dane przychodzą z serwera tylko
 * dla zalogowanych (strona Strefy), tu jest wyłącznie widok: wyszukiwarka,
 * filtr wydającego, uchylone na żądanie i wejście z linkiem #z-….
 */
export function RejestrZarzadzen({ items }: { items: PozycjaRejestru[] }) {
  const t = useTranslations("strefaDzialacza.rejestr");
  const tc = useTranslations("common");
  const id = useId();
  const [filtr, setFiltr] = useState<FiltrRejestru>({ q: "", grupa: "wszyscy", uchylone: false });
  const [wszystkie, setWszystkie] = useState(false);
  const [wyrozniony, setWyrozniony] = useState<string | null>(null);
  const [skopiowany, setSkopiowany] = useState<string | null>(null);
  /** Do którego wiersza przewinąć po najbliższym renderze (n - żeby ten sam cel działał drugi raz). */
  const [przewin, setPrzewin] = useState<{ id: string; n: number } | null>(null);

  const widoczne = useMemo(() => filtrujRejestr(items, filtr), [items, filtr]);
  const pokazane = wszystkie ? widoczne : widoczne.slice(0, NA_START);
  const poNumerze = useMemo(() => new Map(items.map((i) => [i.number, i])), [items]);

  /** Przejście do zarządzenia: pokaż je (rozwiń, włącz uchylone, zdejmij filtry), przewiń, wyróżnij. */
  const pokaz = (cel: PozycjaRejestru) => {
    setFiltr((f) => ({ q: "", grupa: "wszyscy", uchylone: f.uchylone || cel.repealedBy.length > 0 }));
    setWszystkie(true);
    setWyrozniony(cel.id);
    setPrzewin((p) => ({ id: cel.id, n: (p?.n ?? 0) + 1 }));
  };

  // Przewijamy dopiero po zatwierdzeniu renderu: wiersz uchylony albo spoza
  // sześciu najnowszych pojawia się w DOM dopiero po zmianie filtra i rozwinięciu.
  useEffect(() => {
    if (!przewin) return;
    const el = document.getElementById(przewin.id);
    const ruch = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    el?.scrollIntoView({ behavior: ruch, block: "center" });
    el?.focus({ preventScroll: true });
  }, [przewin]);

  useEffect(() => {
    let zapisany = "";
    try {
      zapisany = sessionStorage.getItem(CEL_KLUCZ) ?? "";
      sessionStorage.removeItem(CEL_KLUCZ);
    } catch {
      // Brak dostępu do pamięci przeglądarki - zostaje sam adres.
    }
    const cel = celZHash(window.location.hash, items) ?? celZHash(zapisany, items);
    // Jednorazowo po wejściu z linkiem - stan listy zależy od adresu, którego
    // nie ma na serwerze, więc nie da się go policzyć wcześniej.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cel) pokaz(cel);
    // Link wklejony do paska adresu, gdy Strefa jest już otwarta.
    const naZmiane = () => {
      const c = celZHash(window.location.hash, items);
      if (c) pokaz(c);
    };
    window.addEventListener("hashchange", naZmiane);
    return () => window.removeEventListener("hashchange", naZmiane);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!skopiowany) return;
    const tm = setTimeout(() => setSkopiowany(null), 2000);
    return () => clearTimeout(tm);
  }, [skopiowany]);

  const kopiuj = async (poz: PozycjaRejestru) => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${poz.id}`);
      setSkopiowany(poz.id);
    } catch {
      // Schowek zablokowany - nic nie obiecujemy.
    }
  };

  const odnosnik = (nr: string, klucz: "repeals" | "amends" | "repealedBy" | "amendedBy", ton: string) => {
    const cel = poNumerze.get(nr);
    return (
      <a
        key={klucz + nr}
        href={cel ? `#${cel.id}` : undefined}
        onClick={(e) => {
          if (!cel) return;
          e.preventDefault();
          history.replaceState(null, "", `#${cel.id}`);
          pokaz(cel);
        }}
        className={`inline-flex rounded-md px-2 py-0.5 text-[0.75rem] font-medium underline-offset-2 hover:underline ${ton}`}
      >
        {t(klucz, { nr })}
      </a>
    );
  };

  const pole =
    "h-10 rounded-lg border border-border-medium bg-bg-base px-3 text-[0.875rem] text-ink-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <section aria-labelledby={`${id}-h`} className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id={`${id}-h`}
          className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[0.02em] text-ink-primary [font-variant-caps:all-small-caps]"
        >
          {t("heading")}
        </h2>
        <a
          href={LEX_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("lex")} (${tc("newTab")})`}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border-medium py-1.5 pl-1.5 pr-3.5 text-[0.875rem] font-medium text-ink-primary transition-colors hover:border-accent/50 hover:bg-bg-elevated"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Scales size={16} weight="bold" aria-hidden="true" />
          </span>
          {t("lex")}
          <ArrowSquareOut size={14} weight="bold" aria-hidden="true" className="text-ink-tertiary" />
        </a>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border-medium px-5 py-6 text-[0.9375rem] text-ink-secondary">{t("empty")}</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="relative min-w-[14rem] flex-1">
              <span className="sr-only">{t("search")}</span>
              <MagnifyingGlass size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
              <input
                type="search"
                value={filtr.q}
                onChange={(e) => setFiltr((f) => ({ ...f, q: e.target.value }))}
                placeholder={t("search")}
                className={`${pole} w-full pl-9`}
              />
            </label>
            <label className="flex items-center gap-2 text-[0.875rem] text-ink-secondary">
              {t("issuer")}
              <select
                value={filtr.grupa}
                onChange={(e) => setFiltr((f) => ({ ...f, grupa: e.target.value as FiltrRejestru["grupa"] }))}
                className={pole}
              >
                {GRUPY.map((g) => (
                  <option key={g} value={g}>
                    {t(`groups.${g}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-10 cursor-pointer items-center gap-2 text-[0.875rem] text-ink-secondary">
              <input
                type="checkbox"
                checked={filtr.uchylone}
                onChange={(e) => setFiltr((f) => ({ ...f, uchylone: e.target.checked }))}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {t("showRepealed")}
            </label>
          </div>

          {widoczne.length === 0 ? (
            <p className="mt-6 text-[0.9375rem] text-ink-secondary" role="status">
              {t(komunikatBrakuWynikow(filtr.q), { q: filtr.q.trim() })}
            </p>
          ) : (
            <ul className="mt-4 border-b border-border-subtle">
              {pokazane.map((poz) => {
                const uchylone = poz.repealedBy.length > 0;
                return (
                  <li
                    key={poz.id}
                    id={poz.id}
                    tabIndex={-1}
                    className={`grid scroll-mt-28 gap-x-5 gap-y-1 border-t border-border-subtle px-2 py-3.5 outline-none sm:grid-cols-[11rem_1fr_auto] ${
                      wyrozniony === poz.id ? "rounded-lg bg-accent/[0.08]" : ""
                    }`}
                  >
                    <span className="font-mono text-[0.8125rem] text-accent">{poz.number}</span>
                    {/* Uchylone: przekreślone i ciszej, ale z kontrastem AA - to nadal treść do przeczytania. */}
                    <div className={uchylone ? "text-ink-secondary" : ""}>
                      {poz.href ? (
                        <a
                          href={poz.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${poz.title} (${tc("newTab")})`}
                          className={`text-[0.9375rem] font-medium hover:underline ${uchylone ? "line-through" : "text-ink-primary"}`}
                        >
                          {poz.title}
                        </a>
                      ) : (
                        <span className={`text-[0.9375rem] font-medium ${uchylone ? "line-through" : "text-ink-primary"}`}>{poz.title}</span>
                      )}
                      <span className="mt-0.5 block text-[0.8125rem] text-ink-secondary">{poz.issuer}</span>
                      {(poz.repeals.length > 0 || poz.amends.length > 0 || poz.amendedBy.length > 0 || uchylone) && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {poz.repealedBy.map((nr) => odnosnik(nr, "repealedBy", "bg-bg-elevated text-ink-secondary"))}
                          {poz.amendedBy.map((nr) => odnosnik(nr, "amendedBy", "bg-amber-500/15 text-amber-800 dark:text-amber-300"))}
                          {poz.repeals.map((nr) => odnosnik(nr, "repeals", "bg-accent/10 text-accent"))}
                          {poz.amends.map((nr) => odnosnik(nr, "amends", "bg-accent/10 text-accent"))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                      <span className="font-mono text-[0.8125rem] text-ink-secondary">{data(poz.date)}</span>
                      <button
                        type="button"
                        onClick={() => kopiuj(poz)}
                        className="inline-flex min-h-8 items-center gap-1.5 text-[0.8125rem] text-ink-secondary hover:text-accent"
                      >
                        <LinkSimple size={14} aria-hidden="true" />
                        <span aria-live="polite">{skopiowany === poz.id ? t("copied") : t("copyLink")}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {widoczne.length > NA_START && (
            <button
              type="button"
              aria-expanded={wszystkie}
              onClick={() => setWszystkie((w) => !w)}
              className="mt-4 text-[0.875rem] font-medium text-accent hover:underline"
            >
              {wszystkie ? t("collapse") : t("showAll", { n: widoczne.length })}
            </button>
          )}
        </>
      )}
    </section>
  );
}
