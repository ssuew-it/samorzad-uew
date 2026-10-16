import { describe, expect, it } from "vitest";
import {
  PROGI_SOCJALNE,
  MAX_AMOUNT,
  MAX_PEOPLE,
  classify,
  formatAmountInput,
  formatPln,
  meterFraction,
  meterMax,
  monthlyPerPerson,
  parseAmount,
  parsePeople,
  progiSaNieaktualne,
  yearlyToMonthly,
} from "./stypendia-progi";

// Intl wstawia twarde spacje; porównujemy po normalizacji.
const plain = (s: string) => s.replace(/[  ]/g, " ");

describe("PROGI_SOCJALNE (zał. 4 do ZR 123/2025)", () => {
  it("trzyma kwoty z roku 2025/2026", () => {
    expect(PROGI_SOCJALNE.academicYear).toBe("2025/2026");
    expect(PROGI_SOCJALNE.incomeYear).toBe(2024);
    expect(PROGI_SOCJALNE.threshold).toBe(1908.9);
    expect(PROGI_SOCJALNE.opsAmount).toBe(823);
    expect(PROGI_SOCJALNE.independence).toBe(1696.8);
    expect(PROGI_SOCJALNE.source).toContain("123/2025");
  });
});

describe("parseAmount", () => {
  it.each([
    ["1234,56", 1234.56],
    ["1 234,56", 1234.56],
    ["1 234,56", 1234.56],
    ["1 234,56", 1234.56],
    ["1234.56", 1234.56],
    ["1.234,56", 1234.56],
    ["1,234.56", 1234.56],
    ["60.000", 60000],
    ["60 000", 60000],
    ["1.234.567", 1234567],
    ["1,5", 1.5],
    ["0", 0],
    ["  2500 zł ", 2500],
    ["1234,567", 1234.567],
  ])("„%s” → %d", (raw, expected) => {
    expect(parseAmount(raw)).toEqual({ ok: true, value: expected });
  });

  it("pusty wpis to brak danych, nie błąd formatu", () => {
    expect(parseAmount("")).toEqual({ ok: false, error: "empty" });
    expect(parseAmount("   ")).toEqual({ ok: false, error: "empty" });
  });

  it("odrzuca wartości ujemne", () => {
    expect(parseAmount("-100")).toEqual({ ok: false, error: "negative" });
    expect(parseAmount("-1 234,50")).toEqual({ ok: false, error: "negative" });
  });

  it.each(["abc", "12a", ",", "1,2,3,4,5,6x", "--5", "-abc", "1e5", "∞"])("„%s” to błąd formatu", (raw) => {
    expect(parseAmount(raw)).toEqual({ ok: false, error: "invalid" });
  });

  it("odrzuca kwoty powyżej limitu", () => {
    expect(parseAmount(String(MAX_AMOUNT + 1))).toEqual({ ok: false, error: "tooLarge" });
    expect(parseAmount("9".repeat(400))).toEqual({ ok: false, error: "invalid" });
  });
});

describe("parsePeople", () => {
  it("przyjmuje liczby całkowite od 1", () => {
    expect(parsePeople("1")).toEqual({ ok: true, value: 1 });
    expect(parsePeople(" 4 ")).toEqual({ ok: true, value: 4 });
  });
  it("0 osób to osobny błąd", () => {
    expect(parsePeople("0")).toEqual({ ok: false, error: "zero" });
  });
  it("puste, ujemne, ułamkowe i za duże", () => {
    expect(parsePeople("")).toEqual({ ok: false, error: "empty" });
    expect(parsePeople("-2")).toEqual({ ok: false, error: "negative" });
    expect(parsePeople("2,5")).toEqual({ ok: false, error: "invalid" });
    expect(parsePeople("dwa")).toEqual({ ok: false, error: "invalid" });
    expect(parsePeople(String(MAX_PEOPLE + 1))).toEqual({ ok: false, error: "tooLarge" });
  });
});

describe("monthlyPerPerson", () => {
  it("rok → miesiąc → na osobę", () => {
    expect(yearlyToMonthly(12000)).toBe(1000);
    // 60 000 zł / 12 / 4 = 1 250 zł
    expect(monthlyPerPerson(60000, 4, "year")).toBe(1250);
  });
  it("dochód miesięczny dzieli tylko przez osoby", () => {
    expect(monthlyPerPerson(5000, 4, "month")).toBe(1250);
  });
  it("zaokrągla do grosza", () => {
    // 10 000 / 12 / 3 = 277,777… → 277,78
    expect(monthlyPerPerson(10000, 3, "year")).toBe(277.78);
  });
  it("zero dochodu to poprawny wynik", () => {
    expect(monthlyPerPerson(0, 3, "year")).toBe(0);
  });
  it("brak sensownej liczby osób → null", () => {
    expect(monthlyPerPerson(1000, 0, "month")).toBeNull();
    expect(monthlyPerPerson(1000, -1, "month")).toBeNull();
    expect(monthlyPerPerson(1000, 2.5, "month")).toBeNull();
    expect(monthlyPerPerson(1000, Number.NaN, "month")).toBeNull();
  });
  it("ujemny lub nieskończony dochód → null", () => {
    expect(monthlyPerPerson(-1, 2, "month")).toBeNull();
    expect(monthlyPerPerson(Number.POSITIVE_INFINITY, 2, "month")).toBeNull();
  });
  it("duże kwoty nie gubią precyzji", () => {
    expect(monthlyPerPerson(MAX_AMOUNT, 1, "year")).toBe(8333333.33);
  });
});

describe("classify", () => {
  it("poniżej 823 zł → wymaga zaświadczenia z OPS", () => {
    expect(classify(500)).toEqual({ perPerson: 500, status: "belowOps", distance: 1408.9 });
  });
  it("dokładnie 823,00 zł też (§16 ust. 4: „nie przekracza”)", () => {
    expect(classify(823).status).toBe("belowOps");
    expect(classify(823.01).status).toBe("withinThreshold");
  });
  it("w progu z dystansem do progu", () => {
    const a = classify(1596.5);
    expect(a.status).toBe("withinThreshold");
    expect(a.distance).toBe(312.4);
  });
  it("dokładnie na progu wciąż się mieści (§13 ust. 1)", () => {
    expect(classify(1908.9)).toEqual({ perPerson: 1908.9, status: "withinThreshold", distance: 0 });
  });
  it("grosz ponad próg to przekroczenie", () => {
    expect(classify(1908.91)).toEqual({ perPerson: 1908.91, status: "aboveThreshold", distance: 0.01 });
  });
  it("dystans liczony bez błędów float", () => {
    expect(classify(1908.9 - 0.3).distance).toBe(0.3);
    expect(classify(2500).distance).toBe(591.1);
  });
  it("zero dochodu", () => {
    expect(classify(0).status).toBe("belowOps");
  });
});

describe("skala miernika", () => {
  it("koniec skali to 1,5 progu w górę do setki", () => {
    expect(meterMax()).toBe(2900);
  });
  it("ułamek jest przycięty do 0..1", () => {
    expect(meterFraction(1450, 2900)).toBe(0.5);
    expect(meterFraction(99999, 2900)).toBe(1);
    expect(meterFraction(-5, 2900)).toBe(0);
    expect(meterFraction(Number.NaN, 2900)).toBe(0);
    expect(meterFraction(100, 0)).toBe(0);
  });
});

describe("formatowanie", () => {
  it("PLN po polsku grupuje też liczby czterocyfrowe", () => {
    expect(plain(formatPln(1908.9, "pl"))).toBe("1 908,90 zł");
    expect(plain(formatPln(823, "pl"))).toBe("823,00 zł");
  });
  it("PLN po angielsku", () => {
    expect(plain(formatPln(1908.9, "en"))).toMatch(/PLN\s?1,908\.90/);
  });
  it("wartość do pola edycji bez waluty i grupowania", () => {
    expect(formatAmountInput(5000, "pl")).toBe("5000");
    expect(formatAmountInput(60000 / 12 / 7, "pl")).toBe("714,29");
    expect(formatAmountInput(1234.5, "en")).toBe("1234.5");
  });
});

describe("progiSaNieaktualne", () => {
  it("zgłasza progi z innego roku niż bieżący", () => {
    expect(progiSaNieaktualne("2026/2027", { ...PROGI_SOCJALNE, academicYear: "2025/2026" })).toBe(true);
  });
  it("milczy, gdy progi dotyczą bieżącego roku", () => {
    expect(progiSaNieaktualne("2026/2027", { ...PROGI_SOCJALNE, academicYear: "2026/2027" })).toBe(false);
  });
});
