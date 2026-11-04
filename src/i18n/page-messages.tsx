import type { ComponentType } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { GLOBAL_CLIENT_NAMESPACES, PAGE_CLIENT_NAMESPACES } from "./client-namespaces.generated";

type Messages = Record<string, unknown>;

/** Wybiera z tłumaczeń tylko podane przestrzenie nazw (najwyższego poziomu). */
export function pickNamespaces(messages: Messages, namespaces: readonly string[]): Messages {
  return Object.fromEntries(namespaces.filter((n) => n in messages).map((n) => [n, messages[n]]));
}

/** Teksty dla `NextIntlClientProvider` w layoucie: tylko komponenty klienckie wspólne dla stron. */
export async function globalClientMessages(): Promise<Messages> {
  return pickNamespaces((await getMessages()) as Messages, GLOBAL_CLIENT_NAMESPACES);
}

/**
 * Opakowuje stronę własnym `NextIntlClientProvider` z tekstami, których
 * potrzebują JEJ komponenty klienckie (lista z client-namespaces.generated.ts).
 *
 * Zagnieżdżony provider nie scala się z layoutowym, tylko go zastępuje -
 * dlatego dostaje też przestrzenie wspólne.
 *
 * Użycie: `export default withPageMessages("/kontakt", KontaktPage);`
 */
export function withPageMessages<P extends object>(route: string, Page: ComponentType<P>) {
  const own = PAGE_CLIENT_NAMESPACES[route];
  if (!own) {
    throw new Error(
      `Brak trasy "${route}" w client-namespaces.generated.ts - uruchom npm run i18n:namespaces`,
    );
  }
  const namespaces = [...GLOBAL_CLIENT_NAMESPACES, ...own];

  async function PageWithMessages(props: P & { params: Promise<{ locale: string }> }) {
    const { locale } = await props.params;
    const messages = (await getMessages({ locale })) as Messages;
    return (
      <NextIntlClientProvider messages={pickNamespaces(messages, namespaces)}>
        <Page {...props} />
      </NextIntlClientProvider>
    );
  }
  PageWithMessages.displayName = `withPageMessages(${Page.displayName ?? Page.name ?? "Page"})`;
  return PageWithMessages;
}
