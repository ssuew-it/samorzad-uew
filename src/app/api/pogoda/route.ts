import { NextResponse } from "next/server";
import { weatherKind } from "@/lib/weather";

/**
 * Pogoda dla Wrocławia z Open-Meteo.
 *
 * Pobieramy PO STRONIE SERWERA, nie z przeglądarki. Gdyby odpytywał ją
 * przeglądarką każdy odwiedzający, adres IP i nagłówki każdego studenta
 * trafiałyby do zewnętrznej usługi tylko po to, żeby na pasku pokazać
 * temperaturę. Tak wychodzi stamtąd jedno zapytanie na kwadrans, z serwera.
 *
 * Open-Meteo nie wymaga klucza, więc nie ma tu żadnego sekretu do wycieku.
 * Przy błędzie zwracamy pustą odpowiedź - pasek po prostu nie pokaże komórki,
 * bo zmyślona temperatura byłaby gorsza niż jej brak.
 */

export const revalidate = 900; // 15 minut - tyle wynosi krok danych źródła

// Plac Grunwaldzki, czyli kampus UEW.
const LAT = 51.1079;
const LON = 17.0385;

export async function GET() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,weather_code&timezone=Europe%2FWarsaw`;

    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return NextResponse.json({});

    const data: { current?: { temperature_2m?: number; weather_code?: number } } =
      await res.json();
    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code;

    if (typeof temp !== "number" || typeof code !== "number") return NextResponse.json({});

    const kind = weatherKind(code);
    // Nieznany kod = nie wiemy, jaka jest pogoda. Sama temperatura bez opisu
    // nadal jest prawdziwa, więc ją zostawiamy.
    return NextResponse.json({ temp, kind: kind === "unknown" ? null : kind });
  } catch {
    return NextResponse.json({});
  }
}
