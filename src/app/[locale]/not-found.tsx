import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, House } from "@phosphor-icons/react/dist/ssr";
import { AuroraField } from "@/components/AuroraField";

const links = [
  { key: "dlaStudenta", href: "/dla-studenta" },
  { key: "naszaDzialalnosc", href: "/nasza-dzialalnosc" },
  { key: "kontakt", href: "/kontakt" },
];

export default function NotFound() {
  const t = useTranslations("notFound");
  const tp = useTranslations("pages");

  return (
    // Bez własnego <main> i bez `id="main-content"`: landmark tworzy już
    // `template.tsx`, więc tutaj powstawał <main> w <main> i drugi element
    // z tym samym `id`.
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -inset-x-0 -top-[10%] h-[120%]">
          <AuroraField />
        </div>
        <div className="grain" />
      </div>

      <div className="relative z-10 mx-auto max-w-[640px] text-center">
        <p className="font-display text-[clamp(5rem,16vw,11rem)] font-semibold leading-none tracking-[-0.03em] text-accent">
          404
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-primary">
          {t("heading")}
        </h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-[1.0625rem] leading-[1.7] text-ink-secondary">
          {t("body")}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-base font-medium text-bg-base transition-[background-color,transform] duration-150 ease-out hover:bg-accent-dim active:scale-[0.97]"
          >
            <House size={20} weight="regular" aria-hidden="true" />
            {t("home")}
          </Link>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center gap-1.5 py-1 text-[0.9375rem] font-medium text-accent transition-colors hover:text-accent-dim"
              >
                {tp(link.key)}
                <ArrowRight size={16} weight="regular" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
