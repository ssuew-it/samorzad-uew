"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  ChartBar,
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
import { FinancialReport } from "./FinancialReport";


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
  { key: "russRaporty", icon: FileText, doc: documents.russResolutions },
  { key: "sprawozdania", icon: ChartBar, doc: documents.sprawozdania },
  { key: "finansowanie", icon: Coins, doc: documents.finansowanie },
  { key: "ksiega", icon: Palette, doc: documents.ksiega },
];


export function TransparentnoscContent() {
  const t = useTranslations("transparentnosc");
  const tc = useTranslations("common");
  const publishedCount = categories.filter((category) => category.href || category.doc?.href).length;
  const awaitingCount = categories.length - publishedCount;

  return (
    <>
      <FinancialReport />

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

            <dl className="grid grid-cols-2 border-y border-border-medium">
              <div className="py-5 pr-5">
                <dt className="text-[0.75rem] text-ink-tertiary">{t("registry.available")}</dt>
                <dd className="mt-1 font-mono text-[1.75rem] font-medium text-ink-primary tabular-nums">{publishedCount}</dd>
              </div>
              <div className="border-l border-border-medium py-5 pl-5">
                <dt className="text-[0.75rem] text-ink-tertiary">{t("registry.awaiting")}</dt>
                <dd className="mt-1 font-mono text-[1.75rem] font-medium text-ink-primary tabular-nums">{awaitingCount}</dd>
              </div>
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

          <div className="mt-8 flex items-start gap-3 border-t border-border-medium pt-5 text-[0.8125rem] leading-[1.6] text-ink-secondary">
            <ArrowUpRight size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            <p>{t("registry.note")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
