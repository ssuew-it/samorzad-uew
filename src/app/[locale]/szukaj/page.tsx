import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/PageHero";
import { searchPages, highlightSegments } from "@/lib/searchIndex";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "szukaj" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    // Results pages shouldn't be indexed (thin/duplicate), but the route must
    // exist for the Google sitelinks searchbox (SearchAction) to work.
    robots: { index: false, follow: true },
  };
}

export default async function SzukajPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? searchPages(query, locale) : [];

  const t = await getTranslations({ locale, namespace: "szukaj" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: t("heroTitle") },
        ]}
      />

      <section className="section-padding pt-0" aria-labelledby="szukaj-heading">
        <div className="mx-auto max-w-[760px]">
          <h2 id="szukaj-heading" className="sr-only">
            {t("resultsSr")}
          </h2>

          {/* GET form — works without JavaScript */}
          <form
            action={`/${locale}/szukaj`}
            method="get"
            role="search"
            className="flex items-center gap-3 rounded-xl border border-border-strong bg-bg-surface px-5 focus-within:border-accent"
          >
            <MagnifyingGlass size={20} weight="regular" aria-hidden="true" className="shrink-0 text-ink-tertiary" />
            <label htmlFor="q" className="sr-only">
              {t("inputLabel")}
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder={t("placeholder")}
              className="h-14 w-full bg-transparent text-[1rem] text-ink-primary placeholder:text-ink-tertiary focus:outline-none"
            />
            <button
              type="submit"
              className="my-2 inline-flex h-10 shrink-0 items-center rounded-lg bg-accent px-5 text-[0.875rem] font-medium text-bg-base transition-colors hover:bg-accent-dim"
            >
              {t("submit")}
            </button>
          </form>

          {/* Results */}
          {query === "" ? (
            <p className="mt-8 text-[0.9375rem] text-ink-secondary">
              {t("emptyHint")}
            </p>
          ) : results.length === 0 ? (
            <p className="mt-8 text-[0.9375rem] text-ink-secondary">
              {t("noResults", { query })}
            </p>
          ) : (
            <ul className="mt-8 flex flex-col gap-2">
              <li className="pb-1 text-[0.8125rem] text-ink-tertiary">
                {t("count", { count: results.length })}
              </li>
              {results.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-surface px-5 py-4 transition-colors duration-150 hover:border-border-soft hover:bg-bg-elevated"
                  >
                    <span>
                      <span className="block text-[1rem] font-medium text-ink-primary">
                        {highlightSegments(entry.label, query).map((seg, k) =>
                          seg.hit ? (
                            <mark key={k} className="bg-transparent font-semibold text-accent">
                              {seg.text}
                            </mark>
                          ) : (
                            <span key={k}>{seg.text}</span>
                          ),
                        )}
                      </span>
                      <span className="mt-0.5 block text-[0.75rem] uppercase tracking-[0.08em] text-ink-tertiary">
                        {entry.group}
                      </span>
                    </span>
                    <ArrowRight
                      size={18}
                      weight="bold"
                      aria-hidden="true"
                      className="shrink-0 text-ink-tertiary transition-[transform,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
