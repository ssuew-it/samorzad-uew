import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import { AssistantBubble } from "@/components/AssistantBubble";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
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
  foundingDate: "1987",
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

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Samorząd Studentów Uniwersytetu Ekonomicznego we Wrocławiu",
  url: SITE_URL,
  inLanguage: "pl-PL",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/szukaj?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

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
    // Per-page canonical/hreflang are emitted via sitemap.ts to avoid this
    // layout's alternates leaking onto every child route.
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
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "site" });

  // `data-scroll-behavior="smooth"`: globals.css ustawia płynne przewijanie
  // (kotwice, „do góry”). Od Next 16 framework sam go nie wyłącza przy zmianie
  // strony - bez tego atrybutu nowa strona pojawiała się w starej pozycji
  // przewinięcia i płynnie zjeżdżała na górę (tests/nav-scroll.spec.ts).
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
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
            <AssistantBubble />
            <AnalyticsConsent />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
