import { describe, expect, it } from "vitest";
import { radioKeyIndex } from "./radio-keys";

describe("radioKeyIndex - strzałki w grupie radiowej (wzorzec ARIA)", () => {
  it("w prawo i w dół idą do następnej opcji, z końca na początek", () => {
    expect(radioKeyIndex(0, 3, "ArrowRight")).toBe(1);
    expect(radioKeyIndex(1, 3, "ArrowDown")).toBe(2);
    expect(radioKeyIndex(2, 3, "ArrowRight")).toBe(0);
  });

  it("w lewo i w górę cofają, z początku na koniec", () => {
    expect(radioKeyIndex(2, 3, "ArrowLeft")).toBe(1);
    expect(radioKeyIndex(1, 3, "ArrowUp")).toBe(0);
    expect(radioKeyIndex(0, 3, "ArrowLeft")).toBe(2);
  });

  it("inne klawisze nic nie zmieniają", () => {
    expect(radioKeyIndex(1, 3, "Enter")).toBeNull();
    expect(radioKeyIndex(1, 3, "a")).toBeNull();
  });
});
