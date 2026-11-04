import { buildPassages } from "@/lib/knowledge";
import { routing } from "@/i18n/routing";

/**
 * Fragmenty treści do wyszukiwarki ⌘K („W treści stron”), budowane z pełnych
 * tłumaczeń. Wcześniej wyszukiwarka robiła to w przeglądarce z `useMessages()`,
 * przez co każda strona niosła w HTML cały plik messages (~214 KB). Teraz okno
 * pobiera ten plik dopiero przy pierwszym otwarciu, a sam plik powstaje przy
 * buildzie i leży w CDN.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    return Response.json([], { status: 404 });
  }
  const messages = (await import(`../../../../../messages/${locale}.json`)) as { default: unknown };
  return Response.json(buildPassages(messages.default));
}
