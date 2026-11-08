"""
Animacja zaślepki asystenta AI („Asystent jest w drodze”).

Uruchom: python scripts/build-assistant-soon.py   (Python 3 + Pillow)

Szklana brama z sygnetu (scripts/sig-src/brama.png - render z Higgsfielda,
ta sama co w stopce mailowej) „budzi się”: pulsuje poświata, w górę unoszą
się iskry, raz na pętlę po szkle przechodzi pasmo światła. Pętla bez szwu
(ostatnia klatka przechodzi w pierwszą).

Wyniki (public/asystent/):
- w-drodze.gif 448×256 - animacja,
- w-drodze.png - nieruchomy kadr dla „ogranicz ruch” (prefers-reduced-motion).
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "asystent"
W, H = 448, 256
KLATKI = 24
CZAS_MS = 90


def tlo() -> Image.Image:
    img = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        c = tuple(round(a + (b - a) * t) for a, b in zip((14, 30, 72), (6, 12, 30)))
        d.line([(0, y), (W, y)], fill=c + (255,))
    # Miękka winieta i rozjaśnienie za bramą.
    blask = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(blask).ellipse((W / 2 - 150, H / 2 - 110, W / 2 + 150, H / 2 + 110), fill=(40, 110, 220, 70))
    return Image.alpha_composite(img, blask.filter(ImageFilter.GaussianBlur(40)))


def brama() -> Image.Image:
    g = Image.open(ROOT / "scripts" / "sig-src" / "brama.png").convert("RGBA")
    g = g.crop(g.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox())
    gh = round(H * 0.66)
    return g.resize((round(g.width * gh / g.height), gh), Image.LANCZOS)


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    random.seed(7)
    baza = tlo()
    g = brama()
    gx, gy = (W - g.width) // 2, (H - g.height) // 2 - 4
    # Iskry: stałe tory, przesuwane w górę o pełny cykl - pętla bez szwu.
    iskry = [(random.uniform(W * 0.25, W * 0.75), random.uniform(0, H), random.uniform(0.8, 1.6), random.uniform(0, 1)) for _ in range(14)]

    klatki = []
    for k in range(KLATKI):
        t = k / KLATKI
        puls = 0.5 - 0.5 * math.cos(2 * math.pi * t)  # 0 → 1 → 0
        img = baza.copy()
        # Poświata bramy: rozmyta kopia sylwetki w kolorze, jasność wg pulsu.
        poswiata = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sylwetka = Image.new("RGBA", g.size, (90, 170, 255, 255))
        sylwetka.putalpha(g.getchannel("A"))
        poswiata.alpha_composite(sylwetka, (gx, gy))
        poswiata = poswiata.filter(ImageFilter.GaussianBlur(16))
        poswiata.putalpha(poswiata.getchannel("A").point(lambda v: min(255, round(v * (0.7 + 0.9 * puls)))))
        img = Image.alpha_composite(img, poswiata)
        img.alpha_composite(g, (gx, gy))
        # Pasmo światła po szkle - tylko w drugiej połowie pętli, raz.
        if 0.45 <= t <= 0.85:
            p = (t - 0.45) / 0.4
            x = gx - 60 + p * (g.width + 120)
            maska = Image.new("L", (W, H), 0)
            maska.paste(g.getchannel("A"), (gx, gy))
            pasmo2 = Image.new("L", (W, H), 0)
            ImageDraw.Draw(pasmo2).polygon([(x, gy), (x + 26, gy), (x - 4, gy + g.height), (x - 30, gy + g.height)], fill=170)
            pasmo2 = ImageChops.multiply(pasmo2.filter(ImageFilter.GaussianBlur(6)), maska)
            biel = Image.new("RGBA", (W, H), (255, 255, 255, 255))
            biel.putalpha(pasmo2)
            img = Image.alpha_composite(img, biel)
        # Iskry.
        d = ImageDraw.Draw(img)
        for (x0, y0, r, faza) in iskry:
            y = (y0 - t * H * 0.9) % H
            jas = 0.5 + 0.5 * math.sin(2 * math.pi * (t + faza))
            a = round(40 + 130 * jas)
            d.ellipse((x0 - r, y - r, x0 + r, y + r), fill=(200, 230, 255, a))
        klatki.append(img.convert("RGB"))

    klatki[0].save(OUT / "w-drodze.png", optimize=True)
    # Wspólna paleta (mniejszy plik, bez migotania kolorów między klatkami).
    proba = Image.new("RGB", (W, H * 3))
    for i, f in enumerate((klatki[0], klatki[KLATKI // 2], klatki[KLATKI * 2 // 3])):
        proba.paste(f, (0, H * i))
    pal = proba.quantize(colors=192, method=Image.Quantize.MEDIANCUT)
    gif = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in klatki]
    gif[0].save(OUT / "w-drodze.gif", save_all=True, append_images=gif[1:], duration=CZAS_MS, loop=0, optimize=False)
    for n in ("w-drodze.gif", "w-drodze.png"):
        p = OUT / n
        print(n, Image.open(p).size, p.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    build()
