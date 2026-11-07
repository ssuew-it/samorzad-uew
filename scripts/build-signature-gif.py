"""
Grafika stopki mailowej: animowany GIF i jego nieruchome wersje.

Uruchom: python scripts/build-signature-gif.py   (Python 3 + Pillow)

ŹRÓDŁA (scripts/sig-src/)
- panorama.jpg - panorama Wrocławia w niebieskim duotonie, odtworzona
  w Higgsfieldzie (GPT Image 2.6, 7.11.2026) na podstawie dawnej grafiki
  stopki public/sig/banner.jpg: ta sama perspektywa, ostrzejsza i bez napisu.
  To nie jest nowe zdjęcie z aparatu. Prawdziwej panoramy Uczelni na wolnej
  licencji (CC0) w Wikimedia Commons nie było - są tam tylko pojedyncze budynki.
- brama.png - brama z sygnetu Samorządu jako szklano-metaliczny obiekt 3D
  (Higgsfield, przezroczyste tło). Bez ludzi, bez zmyślonych wydarzeń.
- scripts/fonts/Montserrat-wght.ttf - krój hasła (licencja OFL obok pliku).

WYNIKI (public/sig/)
- grafika.gif 400×270 - wersja codzienna, w stopce 200×135.
- grafika.png 400×270 i grafika-mala.png 240×162 - ostatnia klatka bez ruchu.

ANIMACJA (ok. 2 s, odtwarzana raz - GIF bez rozszerzenia pętli)
1. Pełna panorama z hasłem. Outlook na komputerze pokazuje TYLKO pierwszą
   klatkę GIF-a, więc ona sama musi być gotowym obrazem.
2. Pasma światła przelatują po skosie przez kadr.
3. Brama wyrasta zza miasta i rozjaśnia się.
4. Ostatnia klatka zostaje na stałe: panorama, brama, hasło.
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "sig-src"
OUT = ROOT / "public" / "sig"
W, H = 400, 270
SLOGAN = ["DZIAŁAMY", "WSPIERAMY", "INSPIRUJEMY"]
BLUE = (20, 119, 181)


def cover(img: Image.Image, w: int, h: int) -> Image.Image:
    """Przycięcie „cover” zakotwiczone od prawej - tam stoi wieżowiec."""
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    left = img.width - w
    top = (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


def shape_mask(w: int, h: int, r: int, scale: int = 4) -> Image.Image:
    """Ścięty skosem lewy brzeg i zaokrąglone rogi - jak w statycznych kadrach."""
    big = Image.new("L", (w * scale, h * scale), 0)
    d = ImageDraw.Draw(big)
    d.rounded_rectangle((0, 0, w * scale - 1, h * scale - 1), r * scale, fill=255)
    cut = Image.new("L", big.size, 0)
    ImageDraw.Draw(cut).polygon([(round(w * 0.22) * scale, 0), (w * scale, 0), (w * scale, h * scale), (0, h * scale)], fill=255)
    return ImageChops.multiply(big, cut).resize((w, h), Image.LANCZOS)


def stripes(w: int, h: int, offset: float = 0, alpha: int = 255, width_frac: float = 0.34) -> Image.Image:
    """Białe paski 115°, wygaszane ku prawej, tylko w lewej części kadru."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    step, band, slope = round(w / 8), max(3, round(w / 130)), h * 0.466
    x = -h + offset
    while x < w * width_frac + h:
        d.polygon([(x, h), (x + band, h), (x + band + slope, 0), (x + slope, 0)], fill=(255, 255, 255, alpha))
        x += step
    fade = Image.linear_gradient("L").rotate(90).resize((w, h))  # 255 z lewej → 0 z prawej
    limit = Image.new("L", (w, h), 0)
    limit.paste(255, (0, 0, round(w * width_frac), h))
    fade = ImageChops.multiply(ImageChops.invert(fade).point(lambda v: min(255, int((255 - v) * 2.2))), limit)
    layer.putalpha(ImageChops.multiply(layer.getchannel("A"), fade))
    return layer


def slogan_layer(w: int, h: int, opacity: float = 1.0) -> Image.Image:
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    font = ImageFont.truetype(str(ROOT / "scripts" / "fonts" / "Montserrat-wght.ttf"), 19)
    font.set_variation_by_name("SemiBold")
    d = ImageDraw.Draw(layer)
    tracking, line_h, right, bottom = 4.2, 26, w - 26, h - 22
    widths = [sum(font.getlength(ch) + tracking for ch in line) - tracking for line in SLOGAN]
    a = round(255 * opacity)
    for i, line in enumerate(SLOGAN):
        y = bottom - (len(SLOGAN) - i) * line_h
        x = right - widths[i]
        for ch in line:
            d.text((x, y), ch, font=font, fill=(255, 255, 255, a))
            x += font.getlength(ch) + tracking
    # Niebieska kreska przy środkowej linii, jak na dawnej grafice.
    mid_y = bottom - 2 * line_h + 12
    d.rectangle((right - max(widths) - 104, mid_y, right - max(widths) - 14, mid_y + 3), fill=(*BLUE, a))
    return layer


def light_sweep(w: int, h: int, pos: float) -> Image.Image:
    """Pasmo światła po skosie; pos 0..1 to położenie od lewej do prawej."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx = -0.3 * w + pos * 1.6 * w
    slope = h * 0.466
    for k, a in ((26, 40), (12, 80), (4, 140)):
        d.polygon([(cx - k, h), (cx + k, h), (cx + k + slope, 0), (cx - k + slope, 0)], fill=(255, 255, 255, a))
    return layer.filter(ImageFilter.GaussianBlur(3))


def gate_layer(w: int, h: int, rise: float, glow: float) -> Image.Image:
    """Brama nad miastem; rise 0..1 - jak wysoko wyrosła, glow 0..1 - poświata."""
    gate = Image.open(SRC / "brama.png").convert("RGBA")
    gh = round(h * 0.46)
    gate = gate.resize((round(gate.width * gh / gate.height), gh), Image.LANCZOS)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gx = round(w * 0.53) - gate.width // 2
    gy_final = round(h * 0.08)
    gy = round(gy_final + (1 - rise) * (h - gy_final))
    if glow > 0:
        halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        hd = ImageDraw.Draw(halo)
        cx, cy = gx + gate.width // 2, gy + gate.height // 2
        hd.ellipse((cx - 62, cy - 56, cx + 62, cy + 56), fill=(120, 190, 255, round(100 * glow)))
        layer = Image.alpha_composite(layer, halo.filter(ImageFilter.GaussianBlur(18)))
    # Brama „wyrasta zza miasta”: wszystko poniżej jej docelowej podstawy jest
    # ucięte, więc wysuwa się spod tej linii - i nigdy nie wchodzi na hasło.
    clip = Image.new("L", (w, h), 0)
    clip.paste(255, (0, 0, w, gy_final + gh))
    g = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    g.paste(gate, (gx, gy), gate)
    g.putalpha(ImageChops.multiply(g.getchannel("A"), clip))
    return Image.alpha_composite(layer, g)


def ease_out(t: float) -> float:
    return 1 - (1 - t) ** 3


def frame(base: Image.Image, *, rise=0.0, glow=0.0, sweep=None, slogan=1.0, w=W, h=H) -> Image.Image:
    img = base.copy()
    if rise > 0:
        img = Image.alpha_composite(img, gate_layer(w, h, rise, glow))
    if sweep is not None:
        img = Image.alpha_composite(img, light_sweep(w, h, sweep))
    img = Image.alpha_composite(img, stripes(w, h))
    img = Image.alpha_composite(img, slogan_layer(w, h, slogan))
    return img


def build():
    pano = cover(Image.open(SRC / "panorama.jpg").convert("RGB"), W, H).convert("RGBA")
    # Lekkie przyciemnienie dołu - hasło musi być czytelne na jasnych oknach.
    shade = Image.linear_gradient("L").resize((W, H)).point(lambda v: round(v * 0.55))
    dark = Image.new("RGBA", (W, H), (6, 18, 52, 255))
    dark.putalpha(shade)
    base = Image.alpha_composite(pano, dark)

    frames, durations = [], []
    frames.append(frame(base)); durations.append(500)  # 1. gotowy obraz (Outlook)
    for i in range(4):  # 2. pasmo światła
        frames.append(frame(base, sweep=(i + 1) / 5)); durations.append(80)
    for i in range(8):  # 3. brama wyrasta
        t = ease_out((i + 1) / 8)
        frames.append(frame(base, rise=t, glow=t)); durations.append(80)
    final = frame(base, rise=1, glow=0.55)
    frames.append(final); durations.append(4000)  # 4. ostatnia klatka zostaje

    mask = shape_mask(W, H, 20)
    final_rgba = final.copy()
    final_rgba.putalpha(mask)
    final_rgba.save(OUT / "grafika.png", optimize=True)
    small = cover(final.convert("RGB"), 240, 162).convert("RGBA")
    small.putalpha(shape_mask(240, 162, 12))
    small.save(OUT / "grafika-mala.png", optimize=True)

    # GIF: jedna wspólna paleta (mniejsze różnice między klatkami), indeks 255
    # zarezerwowany na przezroczystość ściętego rogu.
    hard = mask.point(lambda v: 255 if v >= 128 else 0)
    palette_src = Image.new("RGB", (W, H * 3))
    for k, f in enumerate((frames[0], frames[len(frames) // 2], final)):
        palette_src.paste(f.convert("RGB"), (0, H * k))
    pal = palette_src.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    gif_frames = []
    for f in frames:
        q = f.convert("RGB").quantize(palette=pal, dither=Image.Dither.NONE)
        q.paste(255, mask=ImageChops.invert(hard))
        gif_frames.append(q)
    # Klatki różnicowe: piksel taki sam jak w poprzedniej klatce zapisujemy jako
    # przezroczysty (disposal=1 zostawia pod nim poprzedni obraz). Długie ciągi
    # jednego indeksu kompresują się prawie do zera - bez tego GIF ważył 700 KB.
    full = [g.tobytes() for g in gif_frames]
    for k in range(1, len(gif_frames)):
        prev, cur = full[k - 1], full[k]
        delta = bytes(255 if a == b else b for a, b in zip(prev, cur))
        d = Image.frombytes("P", (W, H), delta)
        d.putpalette(gif_frames[k].getpalette())
        gif_frames[k] = d
    gif_frames[0].save(
        OUT / "grafika.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        transparency=255,
        disposal=1,
        optimize=False,
    )
    for name in ("grafika.gif", "grafika.png", "grafika-mala.png"):
        p = OUT / name
        print(f"{name}: {Image.open(p).size}, {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    build()
