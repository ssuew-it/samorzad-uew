import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { globalClientMessages } from "@/i18n/page-messages";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import { LazyAssistantBubble } from "@/components/LazyAssistantBubble";
import { LazyFeedbackPrompt } from "@/components/LazyFeedbackPrompt";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { ACCOUNT_HINT_SCRIPT } from "@/lib/account-hint";
import { AUTHOR } from "@/lib/credits";
import { isAssistantConfigured } from "@/lib/assistant-config";
import "../globals.css";

const SITE_URL = "https://samorzad.ue.wroc.pl";

// Structured data - helps Google understand the organization and surface
// rich results / a knowledge panel ("pozycjonowanie").
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
  alternateName: "SSUEW",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-dark.svg`,
  email: "kontakt@samorzad.ue.wroc.pl",
  // Bez foundingDate: rok założenia Samorządu nie ma potwierdzonego źródła.
  address: {
    "@type": "PostalAddress",
    streetAddress: "ul. Kamienna 44, Budynek L, pok. 110",
    postalCode: "53-307",
    addressLocality: "Wrocław",
    addressCountry: "PL",
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Uniwersytet Ekonomiczny we Wrocławiu",
    url: "https://www.ue.wroc.pl",
  },
  sameAs: [
    "https://www.tiktok.com/@samorzaduew",
    "https://www.facebook.com/samorzad.ue",
    "https://www.instagram.com/samorzad.ue",
    "https://www.linkedin.com/company/samorząd-studentów-uniwersytetu-ekonomicznego-we-wrocławiu/",
  ],
};

const websiteLd = (locale: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
  url: `${SITE_URL}/${locale}`,
  inLanguage: locale === "en" ? "en" : "pl-PL",
  // Twórca serwisu (src/lib/credits.ts).
  creator: { "@type": "Person", name: AUTHOR.name },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/${locale}/szukaj?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const ogLocale = locale === "en" ? "en_US" : "pl_PL";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    // Twórca serwisu (src/lib/credits.ts) - meta author i creator.
    authors: [{ name: AUTHOR.name }],
    creator: AUTHOR.name,
    keywords: [
      "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
      "Samorząd Studentów UEW",
      "Uniwersytet Ekonomiczny we Wrocławiu",
      "UEW",
      "studenci",
      "stypendia",
      "prawa studenta",
    ],
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: `/${locale}`,
      siteName: t("titleDefault"),
      title: t("titleDefault"),
      description: t("ogDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("titleDefault"),
      description: t("ogDescription"),
    },
    // Canonical i hreflang ustawia każda strona przez `ogMeta()` z lib/og.ts -
    // tutaj by przeciekły na wszystkie podstrony jako canonical strony głównej.
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0D14" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Tylko pl i en. Boty skanujące pliki („/sftp-config.json”, „/wp-login.php”)
// trafiały tu jako „język”: render nieznanego segmentu sięgał po nagłówki
// i kończył się 500 „Page changed from static to dynamic” (logi Vercela,
// 11.2026) zamiast zwykłego 404.
export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  // Tylko teksty komponentów klienckich z layoutu; każda strona dokłada swoje
  // przez withPageMessages (src/i18n/page-messages.tsx).
  const messages = await globalClientMessages();
  const t = await getTranslations({ locale, namespace: "site" });

  // `data-scroll-behavior="smooth"`: globals.css ustawia płynne przewijanie
  // (kotwice, „do góry”). Od Next 16 framework sam go nie wyłącza przy zmianie
  // strony - bez tego atrybutu nowa strona pojawiała się w starej pozycji
  // przewinięcia i płynnie zjeżdżała na górę (tests/nav-scroll.spec.ts).
  //
  // Skrypt w <head> wykonuje się przed pierwszym malowaniem i oznacza <html>
  // atrybutem `data-konto`, gdy w localStorage jest podpowiedź konta - CSS
  // pokazuje wtedy szkielet przycisku konta zamiast „Zaloguj się” (szczegóły
  // w src/lib/account-hint.ts). Layout nie czyta ciasteczek, więc strony
  // zostają statyczne. Atrybut zmienia <html> przed hydratacją - stąd, tak
  // jak dla klasy motywu z next-themes, `suppressHydrationWarning`.
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ACCOUNT_HINT_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd(locale)) }}
        />
        <a href="#main-content" className="skip-link">
          {t("skipLink")}
        </a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <ScrollProgress />
            <Nav />
            {children}
            <Footer />
            <BackToTop />
            {/* Czy asystent ma klucz AI - sprawdzane przy buildzie, bez wywołań funkcji. */}
            <LazyAssistantBubble ready={isAssistantConfigured()} />
            {/* Ocena strony - włączana zmienną OPINIE=1 po wdrożeniu nowego Apps Script
                (docs/WRZUC-TUTAJ.md); stary skrypt wysłałby oceny mailem na kontakt@. */}
            {process.env.OPINIE === "1" && <LazyFeedbackPrompt />}
            <AnalyticsConsent />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
