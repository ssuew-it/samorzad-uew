/**
 * Dyżury Dziekana i Prodziekanów ds. Studenckich oraz Prorektora ds. Studenckich
 * i Kształcenia - typy, wersja awaryjna z kodu i wyliczanie plakietki „Dyżur dziś”
 * na /dziekan-i-prodziekani i /wladze-rektorskie.
 *
 * Właściwe źródło to zakładka „Dyżury” w arkuszu „Treści strony”
 * (src/lib/tresci). Godziny zmieniają się co semestr, więc Samorząd
 * poprawia je w arkuszu, bez programisty. Lista niżej jest używana tylko
 * wtedy, gdy arkusz nie działa albo zakładka jest pusta.
 */

/** Klucz osoby: `dziekan`, `key` Prodziekana albo `dutyKey` Prorektora z src/lib/people.ts. */
export type DutyPerson = "dziekan" | "turowska" | "werenska" | "bobowski" | "okruszek";

export const DUTY_PEOPLE: readonly DutyPerson[] = ["dziekan", "turowska", "werenska", "bobowski", "okruszek"];

export interface Dyzur {
  person: DutyPerson;
  /** 1 = poniedziałek … 5 = piątek */
  weekday: number;
  /** GG:MM */
  from: string;
  /** GG:MM */
  to: string;
  /** Litera budynku z planu kampusu, np. „A”. */
  building?: string;
  room?: string;
  /** Można też dołączyć przez MS Teams. */
  teams?: boolean;
  note?: { pl: string; en: string };
  /** Dni (RRRR-MM-DD), w które dyżur jest odwołany. */
  cancelled?: string[];
}

// Stan ze strony Dziekanatu Uczelni (uew.pl/studenci/dziekanat), 2.11.2026.
export const DYZURY_Z_KODU: Dyzur[] = [
  {
    person: "dziekan",
    weekday: 4,
    from: "11:30",
    to: "13:00",
    building: "A",
    room: "121",
    note: {
      pl: "Termin spotkania uzgodnij e-mailem co najmniej dwa dni wcześniej.",
      en: "Arrange the meeting by email at least two days in advance.",
    },
  },
  { person: "turowska", weekday: 2, from: "09:00", to: "10:00", building: "A", room: "121", teams: true },
  { person: "werenska", weekday: 2, from: "08:30", to: "09:30", building: "Z", room: "205", teams: true },
  { person: "bobowski", weekday: 4, from: "09:00", to: "10:30", building: "A", room: "121" },
  // Dziekanat nie podaje sali dyżuru Prorektora.
  { person: "okruszek", weekday: 1, from: "12:15", to: "13:15", cancelled: ["2026-11-02"] },
  { person: "okruszek", weekday: 4, from: "10:30", to: "11:30" },
];

export type DutyStatus =
  | { kind: "now"; slot: Dyzur }
  | { kind: "today"; slot: Dyzur }
  | { kind: "cancelledToday"; slot: Dyzur; next?: { slot: Dyzur; date: string; inDays: number } }
  | { kind: "next"; slot: Dyzur; date: string; inDays: number };

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Dzień tygodnia (1-7) i minuta doby w Polsce. */
function warsawClock(now: Date): { weekday: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday")) + 1;
  return { weekday, minute: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** Dzisiejsza data w Polsce jako RRRR-MM-DD. */
function todayInWarsaw(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(now);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Stan dyżuru osoby w danej chwili: trwa, jeszcze dziś, dziś odwołany albo
 * najbliższy termin w ciągu dwóch tygodni (z pominięciem odwołanych dni).
 * `null`, gdy osoba nie ma żadnego dyżuru.
 */
export function dutyStatus(slots: Dyzur[], now: Date = new Date()): DutyStatus | null {
  if (slots.length === 0) return null;
  const today = todayInWarsaw(now);
  const { weekday, minute } = warsawClock(now);
  const isCancelled = (s: Dyzur, date: string) => s.cancelled?.includes(date) ?? false;

  const todays = slots.filter((s) => s.weekday === weekday).sort((a, b) => minutes(a.from) - minutes(b.from));
  const live = todays.find((s) => !isCancelled(s, today) && minute >= minutes(s.from) && minute < minutes(s.to));
  if (live) return { kind: "now", slot: live };
  const later = todays.find((s) => !isCancelled(s, today) && minute < minutes(s.from));
  if (later) return { kind: "today", slot: later };

  const next = (() => {
    for (let inDays = 1; inDays <= 14; inDays++) {
      const date = addDays(today, inDays);
      const wd = ((weekday - 1 + inDays) % 7) + 1;
      const slot = slots
        .filter((s) => s.weekday === wd && !isCancelled(s, date))
        .sort((a, b) => minutes(a.from) - minutes(b.from))[0];
      if (slot) return { slot, date, inDays };
    }
    return undefined;
  })();

  const cancelledToday = todays.find((s) => isCancelled(s, today) && minute < minutes(s.to));
  if (cancelledToday) return { kind: "cancelledToday", slot: cancelledToday, ...(next ? { next } : {}) };
  return next ? { kind: "next", ...next } : null;
}

/** „09:00” → „9:00”, jak piszemy godziny w tekstach strony. */
export function shortTime(hhmm: string): string {
  return hhmm.replace(/^0(\d)/, "$1");
}
