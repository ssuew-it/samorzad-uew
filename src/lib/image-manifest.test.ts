import { describe, expect, it } from "vitest";
import { imageSize, pickImage } from "./image-manifest";

const manifest = { "/photos/sciana/01.webp": [1600, 1067], "/photos/russ/a.webp": [300, 375] } as const;

describe("imageSize", () => {
  it("zwraca wymiary zdjęcia z manifestu", () => {
    expect(imageSize("/photos/sciana/01.webp", manifest)).toEqual({ width: 1600, height: 1067 });
  });

  it("dla pliku spoza manifestu rzuca błąd z nazwą pliku - literówka w ścieżce ma wyjść przy budowaniu", () => {
    expect(() => imageSize("/photos/brak.webp", manifest)).toThrow("/photos/brak.webp");
  });
});

describe("pickImage", () => {
  it("podaje najmniejszy gotowy wariant nie węższy od żądanego", () => {
    expect(pickImage("/photos/sciana/01.webp", 700, manifest)).toBe("/_img/photos/sciana/01.828.webp");
    expect(pickImage("/photos/sciana/01.webp", 640, manifest)).toBe("/_img/photos/sciana/01.640.webp");
  });

  it("powyżej najszerszego wariantu podaje oryginał, nie powiększa", () => {
    expect(pickImage("/photos/sciana/01.webp", 1600, manifest)).toBe("/photos/sciana/01.webp");
    expect(pickImage("/photos/sciana/01.webp", 2048, manifest)).toBe("/photos/sciana/01.webp");
  });

  it("mały oryginał bez wariantów zostaje oryginałem", () => {
    expect(pickImage("/photos/russ/a.webp", 384, manifest)).toBe("/photos/russ/a.webp");
    expect(pickImage("/photos/russ/a.webp", 256, manifest)).toBe("/_img/photos/russ/a.256.webp");
  });

  it("pliki spoza manifestu (SVG, adresy zewnętrzne) zostawia bez zmian", () => {
    expect(pickImage("/logo-dark.svg", 640, manifest)).toBe("/logo-dark.svg");
    expect(pickImage("https://i.ytimg.com/vi/x/hqdefault.jpg", 640, manifest)).toBe(
      "https://i.ytimg.com/vi/x/hqdefault.jpg",
    );
  });

  it("zawsze kieruje do WebP, także dla oryginału w JPG", () => {
    expect(pickImage("/photos/a.jpg", 640, { "/photos/a.jpg": [2000, 1333] })).toBe("/_img/photos/a.640.webp");
  });
});
