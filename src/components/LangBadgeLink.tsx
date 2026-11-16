/**
 * Plakietka z drugą wersją językową dokumentu (uchwały, zarządzenia): na /pl
 * prowadzi do wersji angielskiej („EN”), na /en do polskiego oryginału („PL”).
 * Stoi OBOK wiersza z głównym linkiem - linków nie wolno zagnieżdżać.
 */
export function LangBadgeLink({ href, locale, label }: { href: string; locale: "pl" | "en"; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      lang={locale === "en" ? "pl" : "en"}
      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center self-center rounded border border-border-strong px-2 font-mono text-[0.75rem] font-semibold tracking-[0.06em] text-ink-primary transition-colors hover:border-accent hover:text-accent"
    >
      {locale === "en" ? "PL" : "EN"}
      <span className="sr-only"> {label}</span>
    </a>
  );
}
