import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { RolePanel } from "@/components/strefa/RolePanel";
import { requireAccess } from "@/lib/access";
import { toPeopleView, warsawToday } from "@/lib/roles-core";
import { readRolesStore, rolesConnectionString } from "@/lib/roles-store";

type Props = { params: Promise<{ locale: string }> };

/** Zmienne potrzebne do zapisu (ID + token API). Connection string do
 *  odczytu sprawdza osobno `rolesConnectionString` (GLOBAL_CONFIG albo
 *  dawne EDGE_CONFIG). Pokazujemy same NAZWY brakujących - wartości nigdy nie
 *  wychodzą z serwera. */
const WRITE_ENV = ["EDGE_CONFIG_ID", "VERCEL_API_TOKEN"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rolePanel" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/**
 * Panel „Role i dostęp” - tylko dla superadmina. Lista osób z rolami jest
 * poufna, więc trafia do HTML i danych RSC wyłącznie po sprawdzeniu roli na
 * serwerze (każdy inny zostaje odesłany do Strefy). Same zmiany idą przez
 * akcje serwera w app/actions/role.ts, które sprawdzają superadmina ponownie.
 */
export default async function RolePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAccess(locale, ["superadmin"]);

  const t = await getTranslations({ locale, namespace: "rolePanel" });
  const ts = await getTranslations({ locale, namespace: "strefaDzialacza" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const read = await readRolesStore();
  const missing: string[] = [
    ...(rolesConnectionString() ? [] : ["GLOBAL_CONFIG"]),
    ...WRITE_ENV.filter((name) => !process.env[name]),
  ];

  return (
    <>
      <PageHero
        title={t("heroTitle")}
        lead={t("heroLead")}
        breadcrumbs={[
          { label: tc("home"), href: "/" },
          { label: ts("metaTitle"), href: "/strefa-dzialacza" },
          { label: t("heroTitle") },
        ]}
      />
      <RolePanel
        people={read.ok ? toPeopleView(read.store) : []}
        canWrite={read.ok && missing.length === 0}
        missing={missing}
        readError={!read.ok}
        // Dzisiejsza data liczona raz, na serwerze, w strefie Warszawy - klient
        // liczy z niej „wygasa za n dni” i podpowiedź 31 maja, więc HTML
        // z serwera i po hydratacji jest ten sam, niezależnie od zegara i strefy
        // przeglądarki.
        today={warsawToday(new Date())}
      />
    </>
  );
}
