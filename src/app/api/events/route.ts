import { NextResponse } from "next/server";

/**
 * Wydarzenia z Google Sheets jako CMS.
 * Działacze edytują arkusz → „Plik → Udostępnij → Opublikuj w internecie → CSV"
 * → link wklejamy do zmiennej `EVENTS_SHEET_CSV_URL` (Vercel → Settings → Env).
 * Kolumny (dowolna kolejność): nazwa | data (RRRR-MM-DD) | tag.
 * Bez zmiennej / przy błędzie zwraca pustą listę - front nie pokazuje wtedy
 * sekcji. Dat wydarzeń nie wolno uzupełniać fikcyjnym fallbackiem.
 */

export const revalidate = 600; // odśwież co 10 min

interface EventRow {
  name: string;
  date: string;
  tag: string;
}

const NAME_KEYS = ["nazwa", "name", "wydarzenie", "tytuł", "tytul"];
const DATE_KEYS = ["data", "date"];
const TAG_KEYS = ["tag", "kategoria", "typ"];

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string): EventRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const iName = header.findIndex((h) => NAME_KEYS.includes(h));
  const iDate = header.findIndex((h) => DATE_KEYS.includes(h));
  const iTag = header.findIndex((h) => TAG_KEYS.includes(h));
  if (iName === -1 || iDate === -1) return [];

  return lines
    .slice(1)
    .map(splitCsvLine)
    .map((cols) => ({
      name: (cols[iName] ?? "").trim(),
      date: (cols[iDate] ?? "").trim(),
      tag: iTag >= 0 ? (cols[iTag] ?? "").trim() : "",
    }))
    .filter((e) => e.name && /^\d{4}-\d{2}-\d{2}$/.test(e.date));
}

export async function GET() {
  const url = process.env.EVENTS_SHEET_CSV_URL;
  if (!url) return NextResponse.json({ events: [], source: "none" });
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) throw new Error(`sheet ${res.status}`);
    const text = await res.text();
    return NextResponse.json({ events: parseCsv(text), source: "sheet" });
  } catch {
    return NextResponse.json({ events: [], source: "error" });
  }
}
