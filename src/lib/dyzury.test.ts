import { describe, expect, it } from "vitest";
import { dutyStatus, shortTime, type Dyzur } from "./dyzury";

// 3.11.2026 to wtorek. Czas zimowy: Polska = UTC+1.
const at = (iso: string, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)), h - 1, m));
};

const tue: Dyzur = { person: "turowska", weekday: 2, from: "09:00", to: "10:00", building: "A", room: "121" };
const thu: Dyzur = { person: "turowska", weekday: 4, from: "12:00", to: "13:00" };

describe("dutyStatus", () => {
  it("przed dyżurem tego dnia: „dziś”", () => {
    expect(dutyStatus([tue, thu], at("2026-11-03", "08:15"))).toMatchObject({ kind: "today", slot: tue });
  });

  it("w trakcie dyżuru: „trwa”, a po nim następny termin", () => {
    expect(dutyStatus([tue, thu], at("2026-11-03", "09:30"))).toMatchObject({ kind: "now", slot: tue });
    expect(dutyStatus([tue, thu], at("2026-11-03", "10:00"))).toMatchObject({ kind: "next", slot: thu, date: "2026-11-05", inDays: 2 });
  });

  it("w inny dzień: najbliższy termin, także przez weekend", () => {
    expect(dutyStatus([tue], at("2026-11-06", "12:00"))).toMatchObject({ kind: "next", date: "2026-11-10", inDays: 4 });
  });

  it("odwołany dziś: mówi o tym i podaje następny termin", () => {
    const s = dutyStatus([{ ...tue, cancelled: ["2026-11-03"] }], at("2026-11-03", "08:00"));
    expect(s).toMatchObject({ kind: "cancelledToday", next: { date: "2026-11-10", inDays: 7 } });
  });

  it("odwołany termin w przyszłości jest pomijany", () => {
    const s = dutyStatus([{ ...tue, cancelled: ["2026-11-10"] }], at("2026-11-06", "12:00"));
    expect(s).toMatchObject({ kind: "next", date: "2026-11-17" });
  });

  it("liczy w czasie polskim, nie UTC", () => {
    // 23:30 UTC w poniedziałek to już wtorek 0:30 w Polsce.
    expect(dutyStatus([tue], new Date(Date.UTC(2026, 10, 2, 23, 30)))).toMatchObject({ kind: "today" });
  });

  it("bez dyżurów: null", () => {
    expect(dutyStatus([], at("2026-11-03", "09:00"))).toBeNull();
  });
});

describe("shortTime", () => {
  it("usuwa zero na początku godziny", () => {
    expect(shortTime("09:00")).toBe("9:00");
    expect(shortTime("13:15")).toBe("13:15");
  });
});
