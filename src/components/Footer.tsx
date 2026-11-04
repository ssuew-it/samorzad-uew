// Komponent serwerowy: stopka nie ma stanu ani zdarzeń, a jako kliencka
// wymagała wysyłania do przeglądarki tekstów z kilku przestrzeni nazw
// (footer, pages, nav, dlaStudenta) na każdej stronie.
import {
  TiktokLogo,
  FacebookLogo,
  LinkedinLogo,
  InstagramLogo,
  EnvelopeSimple,
  MapPin,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { studentTools } from "@/lib/situations";
import { ScrollReveal } from "./ScrollReveal";
import { CookieSettingsButton } from "./CookieSettingsButton";

// Skróty do systemów Uczelni - te same adresy co pasek na /dla-studenta.
const systems = studentTools.filter((tool) => tool.key !== "harmonogram");

const socials = [
  { icon: TiktokLogo, label: "TikTok", href: "https://www.tiktok.com/@samorzaduew" },
  { icon: FacebookLogo, label: "Facebook", href: "https://www.facebook.com/samorzad.ue" },
  { icon: InstagramLogo, label: "Instagram", href: "https://www.instagram.com/samorzad.ue" },
  {
    icon: LinkedinLogo,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/samorząd-studentów-uniwersytetu-ekonomicznego-we-wrocławiu/",
  },
];

const linkGroups: { titleKey: string; links: { labelKey: string; href: string }[] }[] = [
  {
    titleKey: "student",
    links: [
      { labelKey: "dlaStudenta", href: "/dla-studenta" },
      { labelKey: "prawaStudenta", href: "/prawa-studenta" },
      { labelKey: "stypendia", href: "/stypendia" },
      { labelKey: "prawoDlaStudenta", href: "/prawo-dla-studenta" },
      { labelKey: "infopacki", href: "/infopacki" },
      { labelKey: "rzecznik", href: "/rzecznik-praw-studenta" },
      { labelKey: "mapaKampusu", href: "/mapa-kampusu" },
      { labelKey: "pomocPsych", href: "/pomoc-psychologiczna" },
      { labelKey: "organizacje", href: "/organizacje-studenckie" },
      { labelKey: "wydawnictwo", href: "/wydawnictwo" },
      { labelKey: "kalendarz", href: "/kalendarz" },
    ],
  },
  {
    titleKey: "samorzad",
    links: [
      { labelKey: "oNas", href: "/o-nas" },
      { labelKey: "naszeProjekty", href: "/nasze-projekty" },
      { labelKey: "filia", href: "/filia-jelenia-gora" },
      { labelKey: "russ", href: "/rada-uczelniana-samorzadu-studentow" },
      { labelKey: "regulacje", href: "/regulacje-wewnetrzne" },
      { labelKey: "strefaDzialacza", href: "/strefa-dzialacza" },
    ],
  },
  {
    titleKey: "wspolpraca",
    links: [
      { labelKey: "partnerzy", href: "/partnerzy" },
      { labelKey: "kontakt", href: "/kontakt" },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  // `inline-block py-1` daje polu dotyku 24 px wysokości (WCAG 2.5.8) -
  // sam tekst 15 px dawał 16 px, za mało na telefonie.
  const className =
    "inline-block py-1 text-[0.9375rem] text-ink-secondary transition-colors hover:text-ink-primary";
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {label}
    </Link>
  ) : (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

/** Ta sama stopka na każdej stronie (także na Partnerach). */
export function Footer() {
  const t = useTranslations();
  const email = "kontakt@samorzad.ue.wroc.pl";

  return (
    <footer
      id="kontakt"
      aria-labelledby="kontakt-heading"
      className="section-padding border-t border-border-subtle"
    >
      <div className="mx-auto max-w-[1200px]">
        <ScrollReveal>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
            {/* Brand + contact */}
            <div>
              <h2
                id="kontakt-heading"
                className="sm:max-w-[22ch] font-display text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-[1.25] tracking-[-0.02em] text-ink-primary"
              >
                {t("footer.brand")}
              </h2>

              <address className="mt-6 flex flex-col gap-4 not-italic">
                <div className="flex items-start gap-3 text-ink-secondary">
                  <MapPin
                    size={20}
                    weight="regular"
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ink-secondary"
                  />
                  <p className="text-[0.9375rem] leading-[1.7]">
                    ul. Kamienna 44
                    <br />
                    Budynek L, pok. 110
                    <br />
                    53-307 Wrocław
                  </p>
                </div>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 py-1 text-[0.9375rem] text-ink-secondary transition-colors hover:text-ink-primary"
                >
                  <EnvelopeSimple
                    size={20}
                    weight="regular"
                    aria-hidden="true"
                    className="shrink-0 text-ink-secondary"
                  />
                  <span className="min-w-0 break-all">{email}</span>
                </a>
              </address>

              <ul className="mt-6 flex list-none gap-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={`${social.label} (${t("common.newTab")})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-bg-elevated hover:text-accent"
                    >
                      <social.icon size={22} weight="regular" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Link columns - ostatnia kolumna ma też skróty do systemów Uczelni. */}
            {linkGroups.map((group, gi) => (
              <div key={group.titleKey} className="flex flex-col gap-10">
                <nav aria-label={t(`nav.${group.titleKey}`)}>
                  <h3 className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink-secondary">
                    {t(`nav.${group.titleKey}`)}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {group.links.map((link) => (
                      <li key={link.labelKey}>
                        <FooterLink href={link.href} label={t(`pages.${link.labelKey}`)} />
                      </li>
                    ))}
                  </ul>
                </nav>
                {gi === linkGroups.length - 1 && (
                  <nav aria-label={t("footer.systems")}>
                    <h3 className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink-secondary">
                      {t("footer.systems")}
                    </h3>
                    <ul className="mt-4 flex flex-col gap-3">
                      {systems.map((tool) => (
                        <li key={tool.key}>
                          <a
                            href={tool.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 py-1 text-[0.9375rem] text-ink-secondary transition-colors hover:text-ink-primary"
                          >
                            {t(`dlaStudenta.quickLinks.${tool.key}`)}
                            <ArrowUpRight
                              size={14}
                              aria-hidden="true"
                              className="text-ink-tertiary transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transform-none"
                            />
                            <span className="sr-only">({t("common.newTab")})</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Copyright */}
        <div className="mt-16 flex flex-col gap-2 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-ink-secondary">
            &copy; {new Date().getFullYear()} {t("footer.brand")}. {t("footer.rights")}
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label={t("footer.privacy")}>
            <Link
              href="/prywatnosc"
              className="inline-block py-1 text-[0.8125rem] font-medium text-ink-secondary transition-colors hover:text-accent"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/deklaracja-dostepnosci"
              className="inline-block py-1 text-[0.8125rem] font-medium text-ink-secondary transition-colors hover:text-accent"
            >
              {t("footer.accessibility")}
            </Link>
            <CookieSettingsButton
              label={t("footer.cookieSettings")}
              className="inline-block py-1 text-[0.8125rem] font-medium text-ink-secondary transition-colors hover:text-accent"
            />
          </nav>
        </div>
      </div>
    </footer>
  );
}
