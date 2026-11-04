import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CaretRight } from "@phosphor-icons/react";
import { pageUrl } from "@/lib/og";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations("ui.aria");
  const locale = useLocale();
  // BreadcrumbList structured data → breadcrumb rich result in Google.
  // Adresy z prefiksem języka: bez niego każdy prowadził przez przekierowanie 307.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: pageUrl(locale, c.href) } : {}),
    })),
  };

  return (
    <nav aria-label={t("breadcrumb")}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ol className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-secondary">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="py-1 transition-colors hover:text-ink-primary"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "text-ink-primary" : undefined}
                >
                  {c.label}
                </span>
              )}
              {!last && (
                <CaretRight
                  size={13}
                  weight="bold"
                  aria-hidden="true"
                  className="text-ink-tertiary"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
