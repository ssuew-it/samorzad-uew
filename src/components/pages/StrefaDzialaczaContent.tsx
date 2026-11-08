"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LockKey, SignOut, ArrowRight, ArrowSquareOut, SealWarning } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
import { clearAccountHint, primeAccount } from "../AccountMenu";
// Sam typ - `import type` znika przy kompilacji, więc lista kafelków (z adresami
// narzędzi) nie trafia do paczki JS. Dane przychodzą w propsach, i to tylko
// dla zalogowanych.
import type { PanelTile } from "@/lib/panel";
import type { PozycjaRejestru } from "@/lib/zarzadzenia-wewnetrzne";
import { RejestrZarzadzen } from "../strefa/RejestrZarzadzen";
import { CEL_KLUCZ } from "@/lib/rejestr-widok";

interface Props {
  user: { name: string; picture?: string; roles: { label: string; until: string }[] } | null;
  /** Kafelki panelu; serwer przekazuje je wyłącznie po sprawdzeniu sesji. */
  tiles: PanelTile[];
  /** Rejestr zarządzeń - serwer przekazuje go wyłącznie zalogowanym. */
  rejestr: PozycjaRejestru[];
  configured: boolean;
  error?: string;
}

export function StrefaDzialaczaContent({ user, tiles, rejestr, configured, error }: Props) {
  const t = useTranslations("strefaDzialacza");
  const tc = useTranslations("common");
  const locale = useLocale();

  // - Zalogowany: panel z kafelkami -
  if (user) {
    // Tu ląduje logowanie Google. Serwer zna już konto, więc przekazujemy je
    // przyciskowi w nawigacji od razu - bez tego przy pierwszym logowaniu
    // stałby tam „Zaloguj się” aż do odpowiedzi /api/auth/me. Wywołanie
    // w renderze jest celowe (patrz komentarz przy primeAccount).
    primeAccount(user);
    return (
      <section className="section-padding" aria-labelledby="panel-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            {/* Karta Działacza: kto jest zalogowany i z jakimi rolami. */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element -- zdjęcie z konta Google, adres zewnętrzny
                <img src={user.picture} alt="" width={56} height={56} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 font-display text-[1.125rem] font-semibold text-accent">
                  {user.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((s) => s.charAt(0))
                    .join("")}
                </span>
              )}
              <div className="min-w-[11rem] flex-1">
                <p className="font-display text-[1.25rem] font-semibold tracking-[-0.01em] text-ink-primary">
                  {t("greeting", { name: user.name })}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {user.roles.map((r) => (
                    <li key={r.label} className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/10 px-3 py-1 text-[0.8125rem] text-ink-primary">
                      <span className="font-medium">{r.label}</span>
                      <span className="font-mono text-[0.75rem] text-ink-secondary">{r.until}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* POST, nie link: GET-em dałoby się wylogować kogoś obcą stroną.
                  Podpowiedź konta kasujemy przy wysłaniu, jak w menu konta -
                  inaczej po przekierowaniu pasek pokazałby jeszcze avatar
                  z zieloną kropką, aż do odpowiedzi /api/auth/me. */}
              {/* Na telefonie przycisk na całą szerokość karty, pod danymi. */}
              <form method="post" action={`/api/auth/logout?locale=${locale}`} onSubmit={clearAccountHint} className="w-full sm:w-auto">
                <button
                  type="submit"
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-700 sm:w-auto px-5 text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-red-800 active:scale-[0.97]"
                >
                  <SignOut size={18} weight="bold" aria-hidden="true" />
                  {t("logout")}
                </button>
              </form>
            </div>
            <h2
              id="panel-heading"
              className="mt-14 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[0.02em] text-ink-primary [font-variant-caps:all-small-caps]"
            >
              {t("toolsHeading")}
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile, i) => {
              const inner = (
                <>
                  <TileCover tile={tile} />
                  <div className="flex flex-1 flex-col p-6">
                    {/* Kapitaliki: nazwa narzędzia czyta się jak szyld, a nie zdanie. */}
                    <h3 className="font-display text-[1.5rem] font-semibold leading-[1.15] tracking-[0.02em] text-ink-primary [font-variant-caps:small-caps]">
                      {tile.name}
                    </h3>
                    {tile.desc && (
                      <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ink-secondary">{tile.desc}</p>
                    )}
                    {tile.notice && (
                      <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/25 bg-accent/[0.07] px-3.5 py-3 text-[0.875rem] leading-[1.5] text-ink-primary">
                        <SealWarning size={18} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                        {tile.notice}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.875rem] font-medium">
                      {tile.internal ? (
                        <>
                          <span className="text-accent">{t("open")}</span>
                          <ArrowRight
                            size={15}
                            weight="bold"
                            aria-hidden="true"
                            className="text-accent transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-0.5"
                          />
                        </>
                      ) : tile.url ? (
                        <>
                          <span className="text-accent">{t("open")}</span>
                          <ArrowSquareOut size={15} weight="bold" aria-hidden="true" className="text-accent" />
                        </>
                      ) : (
                        <span className="rounded-full border border-border-subtle px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                          {tc("comingSoon")}
                        </span>
                      )}
                    </span>
                  </div>
                </>
              );
              const cls =
                "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated";
              return (
                <ScrollReveal key={tile.name + i} delay={Math.min(i, 5) * 0.04}>
                  {tile.internal ? (
                    <Link href={tile.internal} aria-label={tile.name} className={cls}>
                      {inner}
                    </Link>
                  ) : tile.url ? (
                    // Nazwa dostępna mówi o nowej karcie - sama ikona strzałki
                    // jest ukryta przed czytnikiem (WCAG 3.2.5, wzór jak w stopce).
                    <a
                      href={tile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${tile.name} (${tc("newTab")})`}
                      className={cls}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </ScrollReveal>
              );
            })}
          </div>

          <RejestrZarzadzen items={rejestr} />
        </div>
      </section>
    );
  }

  // - Niezalogowany -
  return (
    <section className="section-padding" aria-labelledby="strefa-heading">
      <div className="mx-auto max-w-[760px]">
        {error && (
          <ScrollReveal>
            <p
              role="alert"
              className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-[0.9375rem] text-red-600 dark:text-red-400"
            >
              {error === "domain"
                ? t("errorDomain")
                : error === "blocked"
                  ? t("errorBlocked")
                  : t("errorAuth")}
            </p>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-glow text-accent">
              <LockKey size={26} weight="regular" aria-hidden="true" />
            </span>
            <h2
              id="strefa-heading"
              className="mt-6 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary"
            >
              {t("cardHeading")}
            </h2>
            <p className="mt-3 text-[1rem] leading-[1.7] text-ink-secondary">{t("cardBody")}</p>

            {configured ? (
              <a
                href={`/api/auth/login?locale=${locale}`}
                onClick={() => {
                  // Link do zarządzenia (#z-…) - po logowaniu Google wraca bez #.
                  try {
                    if (location.hash) sessionStorage.setItem(CEL_KLUCZ, location.hash);
                  } catch {
                    // Bez pamięci przeglądarki po prostu trafi na początek Strefy.
                  }
                }}
                className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
              >
                <LockKey size={20} weight="regular" aria-hidden="true" />
                {t("loginButton")}
              </a>
            ) : (
              <div className="mt-7 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border-medium bg-bg-base p-5">
                <span className="rounded-full border border-border-subtle px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                  {tc("comingSoon")}
                </span>
                <p className="text-[0.9375rem] text-ink-secondary">{t("soon")}</p>
              </div>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-8 flex flex-col items-start gap-5 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.01em] text-ink-primary">
                {t("noAccessHeading")}
              </h2>
              <p className="mt-1 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                {t("noAccessBody")}
              </p>
            </div>
            <Link
              href="/rekrutacja"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border-strong px-6 text-[0.9375rem] font-medium text-ink-primary transition-colors hover:border-border-soft hover:bg-bg-elevated"
            >
              {t("noAccessButton")}
              <ArrowRight size={18} weight="regular" aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/**
 * Plansza z logo na górze kafelka: pole w kolorze samej ikony, a na nim
 * duża ikona aplikacji (zaokrąglenie 22% jak na telefonie - pliki z ostrymi
 * rogami i z własnym zaokrągleniem wyglądają tak samo). Bez ikony - monogram.
 * Po najechaniu logo lekko rośnie; przy ograniczonym ruchu stoi w miejscu.
 * Dekoracyjna: nazwa narzędzia stoi pod spodem.
 */
function TileCover({ tile }: { tile: PanelTile }) {
  const icon =
    "relative h-28 w-28 overflow-hidden rounded-[22%] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)] ring-1 ring-white/15 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.04]";
  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-[16/9] items-center justify-center overflow-hidden"
      style={{ background: tile.tint ?? "linear-gradient(135deg, #16204A, #070B1C)" }}
    >
      {/* Miękkie światło od góry - plansza nie jest płaską plamą koloru. */}
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.18),transparent_60%)]" />
      {tile.icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- statyczna ikona, next/image nic tu nie daje
        <img src={tile.icon} alt="" width={112} height={112} className={icon} />
      ) : (
        <span className={`${icon} flex items-center justify-center bg-white/10 font-display text-[3rem] font-semibold text-white`}>
          {tile.name.charAt(0)}
        </span>
      )}
    </div>
  );
}
