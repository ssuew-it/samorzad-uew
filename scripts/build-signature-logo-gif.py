"""
Animowane logo do kompaktowej stopki: public/sig/logo-h.gif (432×136, w stopce 216×68).

Uruchom: python scripts/build-signature-logo-gif.py   (Python 3 + Pillow)
Najpierw node scripts/build-signature-assets.mjs - robi z logo-dark.svg płytkę
i samo białe logo (scripts/sig-src/logo-plytka.png, logo-znak.png).

ANIMACJA (ok. 1,2 s, odtwarzana raz - GIF bez rozszerzenia pętli)
1. Gotowe logo na płytce. Outlook na komputerze pokazuje TYLKO pierwszą
   klatkę GIF-a, więc ona sama jest pełnym obrazem - dlatego logo nie
   „wlatuje” z pustej płytki (w Outlooku zostałaby pusta płytka).
2. Wejście: pasmo światła przechodzi po skosie (ten sam kąt co paski płytki)
   przez całą płytkę, a logo rozjaśnia się, gdy pasmo je mija.
3. Ostatnia klatka = logo-h.png i zostaje na stałe.
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "sig-src"
OUT = ROOT / "public" / "sig"
W, H = 432, 136
SLOPE = H * 0.466  # skos pasków płytki


def ease_in_out(t: float) -> float:
    return 3 * t * t - 2 * t * t * t


def band(pos: float) -> Image.Image:
    """Miękkie pasmo światła; pos 0..1 = od lewej krawędzi do prawej."""
    layer = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(layer)
    cx = -SLOPE - 40 + pos * (W + SLOPE + 80)
    for k, a in ((34, 70), (16, 140), (5, 255)):
        d.polygon([(cx - k, H), (cx + k, H), (cx + k + SLOPE, 0), (cx - k + SLOPE, 0)], fill=a)
    return layer.filter(ImageFilter.GaussianBlur(6))


def frame(plate: Image.Image, mark_layer: Image.Image, glow_src: Image.Image, pos: float | None) -> Image.Image:
    img = plate.copy()
    if pos is not None:
        b = band(pos)
        # Pasmo na płytce - delikatne, żeby nie zgasić gradientu.
        light = Image.new("RGBA", (W, H), (255, 255, 255, 0))
        light.putalpha(b.point(lambda v: round(v * 0.34)))
        img = Image.alpha_composite(img, light)
        # Poświata logo tam, gdzie akurat jest pasmo.
        glow = Image.new("RGBA", (W, H), (215, 236, 255, 0))
        glow.putalpha(ImageChops.multiply(glow_src, b))
        img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, mark_layer)
    # Płytka ma zaokrąglone rogi - alfa z płytki, nie z dorysowanego światła.
    img.putalpha(plate.getchannel("A"))
    return img


def build():
    plate = Image.open(SRC / "logo-plytka.png").convert("RGBA")
    mark = Image.open(SRC / "logo-znak.png").convert("RGBA")
    mark_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mark_layer.paste(mark, ((W - mark.width) // 2, (H - mark.height) // 2), mark)
    glow_src = mark_layer.getchannel("A").filter(ImageFilter.GaussianBlur(7)).point(lambda v: min(255, v * 2))

    frames, durations = [frame(plate, mark_layer, glow_src, None)], [600]  # 1. gotowe logo (Outlook)
    steps = 11
    for i in range(steps):  # 2. pasmo światła
        frames.append(frame(plate, mark_layer, glow_src, ease_in_out((i + 1) / (steps + 1))))
        durations.append(45)
    frames.append(frame(plate, mark_layer, glow_src, None)); durations.append(3000)  # 3. zostaje

    # Jedna wspólna paleta, indeks 255 = przezroczysty róg płytki.
    hard = plate.getchannel("A").point(lambda v: 255 if v >= 128 else 0)
    src = Image.new("RGB", (W, H * len(frames)))
    for k, f in enumerate(frames):
        src.paste(f.convert("RGB"), (0, H * k))
    pal = src.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    gif = []
    for f in frames:
        # Rozproszenie błędu tylko w klatkach z pasmem - pierwsza i ostatnia są
        # identyczne co do piksela, więc delta między nimi a resztą zostaje mała.
        q = f.convert("RGB").quantize(palette=pal, dither=Image.Dither.FLOYDSTEINBERG if 0 < len(gif) < len(frames) - 1 else Image.Dither.NONE)
        q.paste(255, mask=ImageChops.invert(hard))
        gif.append(q)
    # Klatki różnicowe (jak w build-signature-gif.py): piksel bez zmian = przezroczysty.
    full = [g.tobytes() for g in gif]
    for k in range(1, len(gif)):
        delta = bytes(255 if a == b else b for a, b in zip(full[k - 1], full[k]))
        d = Image.frombytes("P", (W, H), delta)
        d.putpalette(gif[k].getpalette())
        gif[k] = d
    gif[0].save(
        OUT / "logo-h.gif",
        save_all=True,
        append_images=gif[1:],
        duration=durations,
        transparency=255,
        disposal=1,
        optimize=False,
    )
    p = OUT / "logo-h.gif"
    print(f"logo-h.gif: {Image.open(p).size}, {len(frames)} klatek, {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    build()
