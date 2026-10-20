import { getTranslations } from "next-intl/server";
import { ArrowClockwise, ArrowSquareOut, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { refreshTresci } from "@/app/actions/tresci";
import type { TabStatus } from "@/lib/tresci";

/**
 * Tabela stanu zakładek arkusza. Komponent serwerowy - dane i status są
 * liczone przy renderze strony, a „Odśwież teraz” to zwykły formularz
 * z akcją serwera (działa też bez JavaScriptu).
 */
export async function TresciStatus({
  status,
  configured,
  sheetUrl,
}: {
  status: TabStatus[];
  configured: boolean;
  sheetUrl: string | null;
}) {
  const t = await getTranslations("tresciStrony");

  return (
    <section className="section-padding" aria-labelledby="tresci-heading">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2
              id="tresci-heading"
              className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary"
            >
              {t("heading")}
            </h2>
            <p className="mt-3 max-w-[62ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">
              {configured ? t("leadConfigured") : t("leadNotConfigured")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-border-strong px-5 text-[0.9375rem] font-semibold text-ink-primary hover:bg-bg-elevated"
              >
                <ArrowSquareOut size={18} aria-hidden="true" />
                {t("openSheet")}
              </a>
            )}
            <form action={refreshTresci}>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-5 text-[0.9375rem] font-semibold text-bg-base transition-[background-color,transform] duration-150 hover:bg-accent-dim active:scale-[0.97]"
              >
                <ArrowClockwise size={18} weight="bold" aria-hidden="true" />
                {t("refresh")}
              </button>
            </form>
          </div>
        </div>

        <ul className="mt-10 grid gap-5">
          {status.map((s) => (
            <li key={s.tab} className="rounded-xl border border-border-subtle bg-bg-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[1.125rem] font-semibold text-ink-primary">
                  {t("tab", { name: s.tab })}
                </h3>
                <p className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink-primary">
                  {s.source === "arkusz" && s.errors.length === 0 ? (
                    <CheckCircle size={20} weight="fill" className="text-accent" aria-hidden="true" />
                  ) : (
                    <WarningCircle size={20} weight="fill" className="text-ink-secondary" aria-hidden="true" />
                  )}
                  {s.source === "arkusz" ? t("fromSheet", { rows: s.rows }) : t("fromCode", { rows: s.rows })}
                </p>
              </div>
              {s.reason && <p className="mt-2 text-[0.9375rem] text-ink-secondary">{t("reason", { reason: s.reason })}</p>}
              {s.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-[0.9375rem] font-semibold text-ink-primary">
                    {t("errorsHeading", { count: s.errors.length })}
                  </p>
                  <ul className="mt-2 grid gap-1.5">
                    {s.errors.map((e) => (
                      <li key={`${e.line}-${e.message}`} className="text-[0.9375rem] leading-[1.55] text-ink-secondary">
                        <span className="font-semibold text-ink-primary">{t("row", { line: e.line })}</span> {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-[70ch] text-[0.875rem] leading-[1.6] text-ink-secondary">{t("help")}</p>
      </div>
    </section>
  );
}
