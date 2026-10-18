"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  EnvelopeSimple,
  FacebookLogo,
  Globe,
  InstagramLogo,
  LinkedinLogo,
  MagnifyingGlass,
  TiktokLogo,
  XLogo,
  type Icon,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "../ScrollReveal";
import {
  UEW_ORGS_PAGE,
  organizations,
  type OrgLinkKind,
  type Organization,
} from "@/lib/organizations";
import styles from "./Organizacje.module.css";

type Filter = "all" | "organizacja" | "kolo" | "jg";
const FILTERS: Filter[] = ["all", "organizacja", "kolo", "jg"];

const LINK_ICONS: Record<OrgLinkKind, Icon> = {
  www: Globe,
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  linkedin: LinkedinLogo,
  tiktok: TiktokLogo,
  x: XLogo,
};

/** Bez wielkości liter i polskich znaków: „łańcuch” znajdzie też „lancuch”. */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const matchesFilter = (o: Organization, f: Filter) =>
  f === "all" ? true : f === "jg" ? o.campus === "jelenia-gora" : o.kind === f;

/**
 * Grafika hero: szklana sieć połączonych węzłów (Higgsfield), z tej samej
 * serii co reszta strony. Obiekt-symbol, bez ludzi; jasna i ciemna wersja.
 */
export function OrganizacjeHeroArt() {
  return (
    <div className={styles.art} aria-hidden="true">
      <Image
        src="/photos/organizacje/siec.webp"
        alt=""
        width={900}
        height={1125}
        priority
        sizes="(max-width: 767px) 80vw, 420px"
        className={styles.artImg}
      />
    </div>
  );
}

export function OrganizacjeContent() {
  const t = useTranslations("organizacje");
  const tc = useTranslations("common");
  const locale = useLocale() === "en" ? "en" : "pl";
  const searchId = useId();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const withUs = organizations.filter((o) => o.ssuew);
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f, organizations.filter((o) => matchesFilter(o, f)).length])),
    [],
  ) as Record<Filter, number>;

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return organizations.filter((o) => {
      if (!matchesFilter(o, filter)) return false;
      if (!q) return true;
      // Każde słowo zapytania musi zaczynać któreś słowo wpisu — „ai” trafia
      // w „AI4Business”, ale nie w środek „szkolenia” czy „działa”.
      const words = normalize([o.name, o.unit ?? "", o.desc[locale], ...o.topics].join(" ")).split(/[^a-z0-9]+/);
      return q.split(/\s+/).every((term) => words.some((w) => w.startsWith(term)));
    });
  }, [filter, query, locale]);

  const reset = () => {
    setFilter("all");
    setQuery("");
  };

  const metaLine = (o: Organization) =>
    [o.kind === "kolo" ? t("catalog.kindClub") : t("catalog.kindOrg"), o.unit, o.campus === "jelenia-gora" ? t("catalog.campusJg") : null]
      .filter(Boolean)
      .join(" · ");

  return (
    <>
      {/* Działaj z nami: zespoły przy Samorządzie, na samej górze. */}
      <section className="section-padding" aria-labelledby="org-with-us-heading">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal>
            <h2
              id="org-with-us-heading"
              className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("withUs.heading")}
            </h2>
            <p className="mt-3 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">{t("withUs.lead")}</p>
          </ScrollReveal>

          <ul className={styles.withUs}>
            {withUs.map((o) => {
              const link = o.links[0];
              return (
                <li key={o.id} className={styles.withUsItem}>
                  <h3 className={styles.withUsName}>{o.name}</h3>
                  <p className={styles.withUsDesc}>{o.desc[locale]}</p>
                  {o.internalHref ? (
                    <Link href={o.internalHref} className={styles.withUsLink}>
                      {t("catalog.internal")}
                      <ArrowRight size={16} weight="bold" aria-hidden="true" />
                    </Link>
                  ) : link ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.withUsLink}>
                      {t(`links.${link.kind}`)}
                      <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                      <span className="sr-only">
                        {o.name}, {tc("newTab")}
                      </span>
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Katalog: filtry + wyszukiwarka + lista rozwijanych wierszy. */}
      <section className="section-padding pt-0" aria-labelledby="org-catalog-heading">
        <div className="mx-auto max-w-[1200px]">
          <h2
            id="org-catalog-heading"
            className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
          >
            {t("catalog.heading")}
          </h2>
          <p className="mt-3 max-w-[64ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">
            {t("catalog.lead", { orgs: counts.organizacja, clubs: counts.kolo })}
          </p>

          <div className={styles.controls}>
            <fieldset className={styles.filters}>
              <legend className="sr-only">{t("catalog.filterLegend")}</legend>
              {FILTERS.map((f) => (
                <label key={f} className={styles.filter} data-checked={filter === f ? "true" : undefined}>
                  <input
                    type="radio"
                    name="org-filter"
                    value={f}
                    checked={filter === f}
                    onChange={() => setFilter(f)}
                    className={styles.filterInput}
                  />
                  {t(`catalog.${f}`)}
                  <span className={styles.filterCount} aria-hidden="true">
                    {counts[f]}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className={styles.search}>
              <label htmlFor={searchId} className={styles.searchLabel}>
                {t("catalog.searchLabel")}
              </label>
              <div className={styles.searchBox}>
                <MagnifyingGlass size={18} aria-hidden="true" />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("catalog.searchPlaceholder")}
                  autoComplete="off"
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>

          <p className={styles.status} role="status">
            {t("catalog.results", { count: results.length })}
          </p>

          {results.length > 0 ? (
            // Klucz z filtra: zmiana zakładki odtwarza wejście wierszy,
            // a pisanie w wyszukiwarce już nie (żeby lista nie migała).
            <ol key={filter} className={styles.list}>
              {results.map((o, i) => (
                <li key={o.id} className={styles.row} style={{ "--i": i } as React.CSSProperties}>
                  <details id={`org-${o.id}`}>
                    <summary className={styles.summary}>
                      <span className={styles.num} aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className={styles.name}>{o.name}</span>
                        <span className={styles.meta}>{metaLine(o)}</span>
                      </span>
                      <CaretDown size={18} weight="bold" aria-hidden="true" className={styles.caret} />
                    </summary>
                    <div className={styles.body}>
                      <p className={styles.desc}>{o.desc[locale]}</p>
                      {(o.links.length > 0 || o.internalHref) && (
                        <div className={styles.links}>
                          {o.internalHref && (
                            <Link href={o.internalHref} className={styles.chip}>
                              {t("catalog.internal")}
                              <ArrowRight size={14} weight="bold" aria-hidden="true" />
                            </Link>
                          )}
                          {o.links.map((l) => {
                            const Glyph = LINK_ICONS[l.kind];
                            return (
                              <a
                                key={l.url}
                                href={l.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.chip}
                              >
                                <Glyph size={16} aria-hidden="true" />
                                {t(`links.${l.kind}`)}
                                <span className="sr-only">
                                  {" "}
                                  {o.name}, {tc("newTab")}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.empty}>
              <p className="m-0">{t("catalog.empty")}</p>
              <button type="button" onClick={reset} className={styles.resetBtn}>
                {t("catalog.reset")}
              </button>
            </div>
          )}

          <div className={styles.source}>
            <p className="m-0 max-w-[70ch]">{t("catalog.source")}</p>
            <a href={UEW_ORGS_PAGE} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
              {t("catalog.sourceLink")}
              <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              <span className="sr-only">{tc("newTab")}</span>
            </a>
          </div>

          <ScrollReveal delay={0.1}>
            <div className="mt-14 flex flex-col items-start gap-6 rounded-2xl border border-border-subtle bg-bg-surface p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="max-w-[26ch] font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-primary">
                  {t("ctaHeading")}
                </h2>
                <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-[1.6] text-ink-secondary">{t("ctaBody")}</p>
              </div>
              <a
                href="mailto:kontakt@samorzad.ue.wroc.pl?subject=Zg%C5%82oszenie%20organizacji%20studenckiej"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
              >
                <EnvelopeSimple size={20} weight="regular" aria-hidden="true" />
                {t("ctaButton")}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
