"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Coins,
  DownloadSimple,
  FileText,
  Gavel,
  Palette,
  Scroll,
  Stamp,
  type Icon,
} from "@phosphor-icons/react";
import { documents, type DocSlot } from "@/lib/documents";
import { formatActDateLong } from "@/lib/docMeta";
import { chair } from "@/lib/people";
import type { TransparencyData } from "@/lib/transparency";
import { ContactCard } from "../ContactCard";


interface Category {
  key: string;
  icon: Icon;
  href?: string;
  doc?: DocSlot;
}

const categories: Category[] = [
  { key: "regulacje", icon: Scroll, href: "/regulacje-wewnetrzne" },
  { key: "zarzadzenia", icon: Stamp, href: "/zarzadzenia-przewodniczacego" },
  { key: "prawo", icon: Gavel, href: "/prawo-dla-studenta" },
  // Rejestr uchwał i protokołów prowadzi strona Rady (arkusz Treści strony).
  { key: "russRaporty", icon: FileText, href: "/rada-uczelniana-samorzadu-studentow#uchwaly" },
  { key: "finansowanie", icon: Coins, doc: documents.finansowanie },
  { key: "ksiega", icon: Palette, doc: documents.ksiega },
];


export function TransparentnoscContent({ data }: { data: TransparencyData }) {
  const t = useTranslations("transparentnosc");
  const tc = useTranslations("common");
  const tb = useTranslations("board");
  const locale = useLocale() === "en" ? "en" : "pl";
  const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", { day: "numeric", month: "short", year: "numeric" });
  // Żywe liczniki z arkusza: ile wpisów i kiedy ostatni (pomysł A, 2.11.2026).
  const live: Record<string, string | null> = {
    zarzadzenia:
      data.counts.orders && data.lastOrder
        ? t("live.orders", { count: data.counts.orders, date: formatActDateLong(data.lastOrder, locale) })
        : null,
    russRaporty:
      data.counts.resolutions && data.lastResolution
        ? t("live.resolutions", { count: data.counts.resolutions, date: formatActDateLong(data.lastResolution, locale) })
        : null,
  };
  const publishedCount = categories.filter((category) => category.href || category.doc?.href).length;
  const awaitingCount = categories.length - publishedCount;

  return (
    <>
      <section
        id="rejestr"
        className="section-padding scroll-mt-20 bg-bg-surface"
        aria-labelledby="registry-heading"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)] lg:items-end lg:gap-20">
            <div>
              <p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.1em] text-accent">
                {t("registry.eyebrow")}
              </p>
              <h2
                id="registry-heading"
                className="mt-4 max-w-[17ch] text-balance font-display text-[clamp(2.1rem,4.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink-primary"
              >
                {t("registry.heading")}
              </h2>
              <p className="mt-5 max-w-[66ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
                {t("intro")}
              </p>
            </div>

            <dl className={`grid border-y border-border-medium ${awaitingCount > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
              <div className="py-5 pr-5">
                <dt className="text-[0.75rem] text-ink-tertiary">{t("registry.available")}</dt>
                <dd className="mt-1 font-mono text-[1.75rem] font-medium text-ink-primary tabular-nums">{publishedCount}</dd>
              </div>
              {/* Licznik braków tylko wtedy, gdy czegoś faktycznie brakuje - „0 oczekujących” nic nie mówi. */}
              {awaitingCount > 0 ? (
                <div className="border-l border-border-medium py-5 pl-5">
                  <dt className="text-[0.75rem] text-ink-tertiary">{t("registry.awaiting")}</dt>
                  <dd className="mt-1 font-mono text-[1.75rem] font-medium text-ink-primary tabular-nums">{awaitingCount}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <ol className="mt-12 border-y border-border-medium">
            {categories.map((category) => {
              const Glyph = category.icon;
              const docHref = category.doc?.href;
              const available = Boolean(category.href || docHref);
              const title = t(`categories.${category.key}.title`);
              const rowContent = (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-glow text-accent" aria-hidden="true">
                    <Glyph size={20} weight="duotone" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] font-semibold leading-[1.45] text-ink-primary">{title}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-[1.5] text-ink-secondary">
                      {t(`categories.${category.key}.desc`)}
                    </span>
                    {live[category.key] ? (
                      <span className="mt-2 block font-mono text-[0.75rem] leading-[1.4] text-accent">{live[category.key]}</span>
                    ) : null}
                    <span className="mt-2 block text-xs text-ink-secondary sm:hidden">{available ? t("registry.published") : tc("comingSoon")}</span>
                  </span>
                  <span
                    className={`hidden items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] sm:inline-flex ${
                      available ? "text-accent" : "text-ink-tertiary"
                    }`}
                  >
                    {available ? (
                      <CheckCircle size={16} weight="fill" aria-hidden="true" />
                    ) : (
                      <Clock size={16} weight="fill" aria-hidden="true" />
                    )}
                    {available ? t("registry.published") : tc("comingSoon")}
                  </span>
                  {available ? (
                    category.href ? (
                      <ArrowRight size={20} className="text-accent transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    ) : (
                      <DownloadSimple size={20} className="text-accent transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden="true" />
                    )
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-border-strong" aria-hidden="true" />
                  )}
                </>
              );
              const rowClass =
                "group grid min-h-[104px] grid-cols-[40px_minmax(0,1fr)_20px] items-center gap-4 border-b border-border-subtle px-1 py-5 text-left last:border-b-0 sm:grid-cols-[44px_minmax(0,1fr)_auto_24px] sm:px-5 sm:py-6";

              return (
                <li key={category.key}>
                  {category.href ? (
                    <Link href={category.href} className={`${rowClass} hover:bg-bg-elevated`}>
                      {rowContent}
                    </Link>
                  ) : docHref ? (
                    <a
                      href={docHref}
                      {...(category.doc?.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : { download: true })}
                      className={`${rowClass} hover:bg-bg-elevated`}
                    >
                      {rowContent}
                      {category.doc?.external ? <span className="sr-only">{t("registry.external")}</span> : null}
                    </a>
                  ) : (
                    <div className={rowClass}>{rowContent}</div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Ostatnio opublikowane: najnowsze uchwały i zarządzenia razem (pomysł B). */}
          {data.recent.length > 0 ? (
            <section className="mt-16" aria-labelledby="recent-heading">
              <h3 id="recent-heading" className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold tracking-[-0.02em] text-ink-primary">
                {t("recent.heading")}
              </h3>
              <ol className="mt-6 border-t border-border-medium">
                {data.recent.map((item) => {
                  const kindLabel = t(item.kind === "order" ? "recent.order" : "recent.resolution");
                  const body = (
                    <>
                      <span className="font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink-tertiary">
                        <time dateTime={item.date}>{dateFmt.format(new Date(`${item.date}T12:00:00`))}</time>
                      </span>
                      {/* Na telefonie tytuł schodzi pod datę i strzałkę, na szerszym ekranie stoi między nimi. */}
                      <span className="row-start-2 min-w-0 sm:row-start-auto">
                        <span className="mr-2 inline-flex rounded-full border border-border-strong px-2 py-0.5 align-[2px] font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-accent">
                          {kindLabel} {item.number}
                        </span>
                        <span className="text-[0.9375rem] leading-[1.5] text-ink-primary">{item.title[locale]}</span>
                      </span>
                      {item.href ? (
                        <ArrowUpRight size={18} className="text-accent transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      ) : (
                        <span />
                      )}
                    </>
                  );
                  const cls =
                    "group grid grid-cols-[minmax(0,1fr)_20px] items-start gap-x-6 gap-y-1 border-b border-border-subtle px-1 py-4 sm:grid-cols-[120px_minmax(0,1fr)_20px] sm:px-5";
                  return (
                    <li key={`${item.kind}-${item.number}`}>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:bg-bg-elevated`}>
                          {body}
                          <span className="sr-only"> ({tc("newTab")})</span>
                        </a>
                      ) : (
                        <div className={cls}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {/* Brakuje dokumentu? Prawo dostępu do informacji (§ 76-77) i kontakt do Przewodniczącego. */}
          <div className="mt-14 grid gap-6 rounded-2xl border border-border-medium bg-bg-base p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-center lg:gap-12">
            <div>
              <h3 className="font-display text-[1.25rem] font-semibold tracking-[-0.015em] text-ink-primary">{t("registry.missingHeading")}</h3>
              {awaitingCount > 0 ? <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink-secondary">{t("registry.note")}</p> : null}
              <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-[1.65] text-ink-secondary">{t("registry.rightNote")}</p>
            </div>
            <ContactCard label={t("registry.chairLabel")} name={chair.name} role={tb("roles.chair")} email={chair.email} photo={chair.photo} />
          </div>
        </div>
      </section>
    </>
  );
}
