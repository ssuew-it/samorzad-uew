import { describe, expect, it } from "vitest";
import { matchAudience } from "./audience-match";

const fir1 = { mode: "S1", program: "FIR", year: "1" };
const fir3 = { mode: "S1", program: "FIR", year: "3" };
const ziip3 = { mode: "S1", program: "ZIIP", year: "3" };
const ziip4 = { mode: "S1", program: "ZIIP", year: "4" };

describe("matchAudience", () => {
  it("rok i kierunek z harmonogramu", () => {
    expect(matchAudience("IV rok ZIiP", ziip4)).toBe("match");
    expect(matchAudience("IV rok ZIiP", ziip3)).toBe("nomatch");
    expect(matchAudience("IV rok ZIiP", fir1)).toBe("nomatch");
  });

  it("wykluczenie kierunku", () => {
    expect(matchAudience("III rok I stopnia (bez ZIiP)", fir3)).toBe("match");
    expect(matchAudience("III rok I stopnia (bez ZIiP)", ziip3)).toBe("nomatch");
    expect(matchAudience("III rok I stopnia (bez ZIiP)", fir1)).toBe("nomatch");
  });

  it("stopień i tryb", () => {
    expect(matchAudience("II stopnia, II rok", { mode: "S2", program: "FIR", year: "2" })).toBe("match");
    expect(matchAudience("II stopnia, II rok", { mode: "S1", program: "FIR", year: "2" })).toBe("nomatch");
    expect(matchAudience("II rok, niestacjonarne", { mode: "S1", program: "FIR", year: "2" })).toBe("nomatch");
  });

  it("niepotwierdzony skrót kierunku i tekst bez rozpoznanych cech to „nie wiem”", () => {
    expect(matchAudience("RiP II stopnia, II rok, niestacjonarne", { mode: "N2", program: "RP", year: "2" })).toBe("unknown");
    expect(matchAudience("Koło naukowe X", fir1)).toBe("unknown");
  });
});
