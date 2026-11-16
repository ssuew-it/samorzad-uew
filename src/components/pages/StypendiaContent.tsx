import { useTranslations } from "next-intl";
import { ArrowRight, ArrowSquareOut, FileText } from "@phosphor-icons/react/ssr";
import { StypendiaNawigator } from "./StypendiaNawigator";
import { REGULAMIN_SWIADCZEN_PDF, STYPENDIA_BIP_PAGE, ZALACZNIKI } from "@/lib/stypendia-dokumenty";
import { Link } from "@/i18n/navigation";

const officialLinks = [
  {
    key: "news",
    href: "https://uew.pl/kandydaci/wsparcie-finansowe-dla-studentow/",
    external: true,
  },
  // Infopack Samorządu o stypendiach (PDF na Dysku, od 1.11.2026).
  { key: "infopack", href: "https://drive.google.com/file/d/16HA8cl3ohcDJyVzuYfh9f4BWG7NbAMH2/view?usp=sharing", external: true },
  // Oficjalny PDF z BIP zamiast dawnej kopii na Dysku Google, która się nie aktualizuje.
  { key: "regulamin", href: REGULAMIN_SWIADCZEN_PDF, external: true },
];

export function StypendiaContent() {
  const t = useTranslations("stypendia");
  const tc = useTranslations("common");
  const documents = t.raw("documents") as string[];

  return (
    <>
      <section className="section-padding" aria-labelledby="navigator-heading">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)] lg:items-end lg:justify-between lg:gap-20">
            <div>
              <h2
                id="navigator-heading"
                className="max-w-[18ch] text-balance font-display text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink-primary"
              >
                {t("navigator.heading")}
              </h2>
              <p className="mt-5 max-w-[62ch] text-pretty text-[1rem] leading-[1.75] text-ink-secondary">
                {t("navigator.lead")}
              </p>
            </div>
            <p className="border-t border-border-medium pt-4 text-[0.8125rem] leading-[1.6] text-ink-tertiary">
              {t("navigator.disclaimer")}
            </p>
          </div>

          <StypendiaNawigator />
        </div>
      </section>

      <section
        className="section-padding border-t border-border-subtle bg-bg-surface"
        aria-labelledby="dokumenty-heading"
      >
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2
                id="dokumenty-heading"
                className="text-balance font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-ink-primary"
              >
                {t("documentsHeading")}
              </h2>
              <p className="font-mono text-[0.75rem] font-medium text-ink-tertiary tabular-nums">
                {t("documentsCount", { count: documents.length })}
              </p>
            </div>
            {/* Każdy załącznik prowadzi do oficjalnego PDF-a w BIP (src/lib/stypendia-dokumenty.ts).
                Wcześniej była tu sama lista nazw - student musiał szukać plików na własną rękę. */}
            <ol className="mt-8 border-y border-border-medium">
              {documents.map((doc, index) => {
                const href = ZALACZNIKI[index];
                const body = (
                  <>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 w-8 shrink-0 font-mono text-[0.75rem] font-medium tabular-nums text-accent"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[0.9375rem] leading-[1.55] text-ink-secondary transition-colors group-hover:text-ink-primary">
                      {doc}
                    </span>
                    {href && (
                      <span className="mt-0.5 flex shrink-0 items-center gap-1.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.06em] text-ink-tertiary transition-colors group-hover:text-accent">
                        PDF
                        <ArrowSquareOut size={15} aria-hidden="true" />
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={doc} className="scholarship-document-row border-b border-border-subtle last:border-b-0">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[64px] items-start gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {body}
                        <span className="sr-only"> ({tc("newTab")})</span>
                      </a>
                    ) : (
                      <div className="flex min-h-[64px] items-start gap-4 py-4">{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
            <a
              href={STYPENDIA_BIP_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="scholarship-motion-control mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-strong px-5 py-2.5 text-[0.9375rem] font-semibold text-ink-primary transition-[background-color,transform] duration-150 hover:bg-bg-elevated active:scale-[0.97]"
            >
              <FileText size={18} aria-hidden="true" />
              {t("downloadAll")}
              <span className="sr-only"> ({tc("newTab")})</span>
            </a>
          </div>

          <div>
            <h2 className="text-balance font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
              {t("linksHeading")}
            </h2>
            <ul className="mt-8 border-y border-border-medium">
              {officialLinks.map((link) => {
                const OutIcon = link.external ? ArrowSquareOut : ArrowRight;
                return (
                  <li key={link.key} className="border-b border-border-subtle last:border-b-0">
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="scholarship-motion-control group flex min-h-[76px] items-center justify-between gap-4 py-4 transition-colors hover:text-accent">
                      <span className="text-[0.9375rem] font-semibold text-ink-primary transition-colors group-hover:text-accent">
                        {t(`officialLinks.${link.key}`)}
                      </span>
                      <OutIcon
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-ink-tertiary transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-accent"
                      />
                    </a>
                    ) : (
                      <Link href={link.href} className="scholarship-motion-control group flex min-h-[76px] items-center justify-between gap-4 py-4 transition-colors hover:text-accent">
                      <span className="text-[0.9375rem] font-semibold text-ink-primary transition-colors group-hover:text-accent">
                        {t(`officialLinks.${link.key}`)}
                      </span>
                      <OutIcon
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-ink-tertiary transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-accent"
                      />
                    </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
