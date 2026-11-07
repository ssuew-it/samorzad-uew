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
  (Higgsfield, przezroczyste tło, ujęcie z przodu). Bez ludzi, bez zmyślonych
  wydarzeń.
- scripts/fonts/Montserrat-wght.ttf - krój hasła (licencja OFL obok pliku).

WYNIKI (public/sig/)
- grafika.gif 500×380 - wersja codzienna, w stopce 250×190 (wysokość kolumny
  danych - grafika sięga od góry do dołu karty).
- grafika.png 500×380 - ostatnia klatka bez ruchu.
- grafika-pas.png 128×400 - pionowy pas do masówek (w stopce 64×200): brama
  u góry, trzy słowa hasła poziomo, na przemian przy lewej i prawej krawędzi. Mieści się obok danych także na telefonie.
- grafika-mala.png 220×380 - dawny pas do masówek (110×190); zostaje dla
  stopek już wklejonych w skrzynkach.

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
W, H = 500, 380
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
    k = 1.0 if w >= 400 else 0.84  # wąski pas do masówek - hasło trochę mniejsze, ciaśniej
    font = ImageFont.truetype(str(ROOT / "scripts" / "fonts" / "Montserrat-wght.ttf"), round(19 * k))
    font.set_variation_by_name("SemiBold")
    d = ImageDraw.Draw(layer)
    tracking = 4.2 if w >= 400 else 1.6
    line_h, right, bottom = round(26 * k), w - round(18 * k), h - round(22 * k)
    widths = [sum(font.getlength(ch) + tracking for ch in line) - tracking for line in SLOGAN]
    a = round(255 * opacity)
    for i, line in enumerate(SLOGAN):
        y = bottom - (len(SLOGAN) - i) * line_h
        x = right - widths[i]
        for ch in line:
            d.text((x, y), ch, font=font, fill=(255, 255, 255, a))
            x += font.getlength(ch) + tracking
    # Niebieska kreska przy środkowej linii, jak na dawnej grafice.
    mid_y = bottom - 2 * line_h + round(12 * k)
    if w >= 400:
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
    # Wąski pas: brama większa i na środku pola nad hasłem (widoczna część kadru
    # zaczyna się za ściętym lewym brzegiem, stąd środek na ok. 57% szerokości).
    gh = round(min(h * 0.44, w * 0.42)) if w >= 400 else round(w * 0.6)
    gate = gate.resize((round(gate.width * gh / gate.height), gh), Image.LANCZOS)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gx = round(w * (0.56 if w >= 400 else 0.57)) - gate.width // 2
    gy_final = round(h * 0.1) if w >= 400 else round(h * 0.39) - gh // 2
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



def pas(w: int = 128, h: int = 400) -> Image.Image:
    """Pionowy pas do masówek: panorama, brama u góry, hasło poziomo po szachownicy."""
    img = cover(Image.open(SRC / "panorama.jpg").convert("RGB"), w, h).convert("RGBA")
    dark = Image.new("RGBA", (w, h), (6, 18, 52, 255))
    dark.putalpha(Image.linear_gradient("L").resize((w, h)).point(lambda v: round(40 + v * 0.5)))
    img = Image.alpha_composite(img, dark)
    gate = Image.open(SRC / "brama.png").convert("RGBA")
    gw = round(w * 0.6)
    gate = gate.resize((gw, round(gate.height * gw / gate.width)), Image.LANCZOS)
    img.alpha_composite(gate, ((w - gw) // 2, 16))
    # Hasło „po szachownicy”: trzy słowa poziomo, na przemian przy lewej
    # i prawej krawędzi (DZIAŁAMY z lewej, WSPIERAMY z prawej, INSPIRUJEMY
    # z lewej), rozłożone równo pod bramą. Wielkość liter dobrana tak, żeby
    # najdłuższe słowo zmieściło się w szerokości pasa.
    tracking = 1.0
    margines = 9
    slowa = ("DZIAŁAMY", "WSPIERAMY", "INSPIRUJEMY")
    rozmiar = 20
    while True:
        font = ImageFont.truetype(str(ROOT / "scripts" / "fonts" / "Montserrat-wght.ttf"), rozmiar)
        font.set_variation_by_name("Bold")
        szer = [sum(font.getlength(c) + tracking for c in t) - tracking for t in slowa]
        if max(szer) <= w - 2 * margines or rozmiar <= 10:
            break
        rozmiar -= 1
    d = ImageDraw.Draw(img)
    gora = 16 + gate.height + 22
    dol = h - 22 - rozmiar
    for i, (t, sz) in enumerate(zip(slowa, szer)):
        y = round(gora + i * (dol - gora) / 2)
        x = margines if i % 2 == 0 else w - margines - sz
        for c in t:
            d.text((x, y), c, font=font, fill=(255, 255, 255, 255))
            x += font.getlength(c) + tracking
    m = Image.new("L", (w * 4, h * 4), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * 4 - 1, h * 4 - 1), 16 * 4, fill=255)
    img.putalpha(m.resize((w, h), Image.LANCZOS))
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
    for i in range(2):  # 2. pasmo światła
        frames.append(frame(base, sweep=(i + 1) / 3)); durations.append(120)
    for i in range(6):  # 3. brama wyrasta
        t = ease_out((i + 1) / 6)
        frames.append(frame(base, rise=t, glow=t)); durations.append(90)
    final = frame(base, rise=1, glow=0.55)
    frames.append(final); durations.append(4000)  # 4. ostatnia klatka zostaje

    mask = shape_mask(W, H, 20)
    final_rgba = final.copy()
    final_rgba.putalpha(mask)
    final_rgba.save(OUT / "grafika.png", optimize=True)
    # Wąski pas do masówek składany osobno (z obciętego kadru zostałaby połowa hasła).
    sw, sh = 220, H
    small_base = cover(Image.open(SRC / "panorama.jpg").convert("RGB"), sw, sh).convert("RGBA")
    sdark = Image.new("RGBA", (sw, sh), (6, 18, 52, 255))
    sdark.putalpha(Image.linear_gradient("L").resize((sw, sh)).point(lambda v: round(v * 0.55)))
    small = frame(Image.alpha_composite(small_base, sdark), rise=1, glow=0.55, w=sw, h=sh)
    small.putalpha(shape_mask(sw, sh, 16))
    # Paleta 256 kolorów z kanałem alfa: masówki mają być lekkie (136 KB → ok. 40 KB).
    small.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(OUT / "grafika-mala.png", optimize=True)
    pas().quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(OUT / "grafika-pas.png", optimize=True)

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
    for name in ("grafika.gif", "grafika.png", "grafika-mala.png", "grafika-pas.png"):
        p = OUT / name
        print(f"{name}: {Image.open(p).size}, {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    build()
