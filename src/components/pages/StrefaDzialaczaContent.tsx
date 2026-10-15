"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LockKey, SignOut, ArrowRight, ArrowSquareOut, SquaresFour } from "@phosphor-icons/react";
import { ScrollReveal } from "../ScrollReveal";
// Sam typ — `import type` znika przy kompilacji, więc lista kafelków (z adresami
// narzędzi) nie trafia do paczki JS. Dane przychodzą w propsach, i to tylko
// dla zalogowanych.
import type { PanelTile } from "@/lib/panel";

interface Props {
  user: { name: string } | null;
  /** Kafelki panelu; serwer przekazuje je wyłącznie po sprawdzeniu sesji. */
  tiles: PanelTile[];
  configured: boolean;
  error?: string;
}

export function StrefaDzialaczaContent({ user, tiles, configured, error }: Props) {
  const t = useTranslations("strefaDzialacza");
  const tc = useTranslations("common");
  const locale = useLocale();

  // — Zalogowany: panel z kafelkami —
  if (user) {
    return (
      <section className="section-padding" aria-labelledby="panel-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[1.0625rem] text-ink-secondary">
                {t("greeting", { name: user.name })}
              </p>
              {/* POST, nie link: GET-em dałoby się wylogować kogoś obcą stroną. */}
              <form method="post" action={`/api/auth/logout?locale=${locale}`}>
                <button
                  type="submit"
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border-strong px-4 text-[0.875rem] font-medium text-ink-secondary transition-colors hover:border-border-soft hover:bg-bg-elevated hover:text-ink-primary"
                >
                  <SignOut size={16} weight="regular" aria-hidden="true" />
                  {t("logout")}
                </button>
              </form>
            </div>
            <h2
              id="panel-heading"
              className="mt-6 flex items-center gap-2 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.02em] text-ink-primary"
            >
              <SquaresFour size={26} weight="regular" aria-hidden="true" className="text-accent" />
              {t("toolsHeading")}
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile, i) => {
              const inner = (
                <>
                  <h3 className="text-[1.125rem] font-semibold tracking-[-0.01em] text-ink-primary">
                    {tile.name}
                  </h3>
                  {tile.desc && (
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                      {tile.desc}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-medium">
                    {tile.internal ? (
                      <span className="text-accent">{t("open")}</span>
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
                </>
              );
              const cls =
                "group relative flex h-full flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated";
              return (
                <ScrollReveal key={tile.name + i} delay={Math.min(i, 5) * 0.04}>
                  {tile.internal ? (
                    <Link href={tile.internal} aria-label={tile.name} className={cls}>
                      {inner}
                    </Link>
                  ) : tile.url ? (
                    // Nazwa dostępna mówi o nowej karcie — sama ikona strzałki
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
        </div>
      </section>
    );
  }

  // — Niezalogowany —
  return (
    <section className="section-padding" aria-labelledby="strefa-heading">
      <div className="mx-auto max-w-[760px]">
        {error && (
          <ScrollReveal>
            <p
              role="alert"
              className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-[0.9375rem] text-red-600 dark:text-red-400"
            >
              {error === "domain" ? t("errorDomain") : t("errorAuth")}
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
                className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-all hover:bg-accent-dim active:scale-[0.98]"
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
