"""Pravi ikonice aplikacije (PNG 192/512 + maskable 512 + SVG) bez spoljnih biblioteka.

Motiv: zelena podloga, bela lopta sa ključaonicom (sport + šifra).
Upotreba:  python -I tools/make_icons.py
"""
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "ikone"
ZELENA = (43, 138, 62)
BELA = (255, 255, 255)
TAMNA = (29, 29, 27)


def boja(x, y, maskable):
    """Boja tačke u jediničnom kvadratu [0,1]²; None = providno."""
    # podloga: zaobljeni kvadrat (maskable: cela površina)
    if not maskable:
        r, m = 0.22, 0.0
        cx, cy = min(max(x, r), 1 - r), min(max(y, r), 1 - r)
        if (x - cx) ** 2 + (y - cy) ** 2 > r * r:
            return None
    s = 0.8 if maskable else 1.0          # maskable: motiv u bezbednoj zoni
    u, v = (x - 0.5) / s + 0.5, (y - 0.5) / s + 0.5
    d = (u - 0.5) ** 2 + (v - 0.5) ** 2
    if d <= 0.30 ** 2:
        # ključaonica: krug + trapez
        if (u - 0.5) ** 2 + (v - 0.44) ** 2 <= 0.075 ** 2:
            return TAMNA
        if 0.47 <= v <= 0.66 and abs(u - 0.5) <= 0.035 + (v - 0.47) * 0.25:
            return TAMNA
        return BELA
    return ZELENA


def png(n, maskable):
    ss = 4                                   # supersampling za glatke ivice
    redovi = []
    for py in range(n):
        red = bytearray([0])
        for px in range(n):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    c = boja((px + (sx + .5) / ss) / n, (py + (sy + .5) / ss) / n, maskable)
                    if c:
                        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += 255
            k = ss * ss
            a = acc[3] // k
            red += bytes([acc[0] // max(1, acc[3] // 255), acc[1] // max(1, acc[3] // 255), acc[2] // max(1, acc[3] // 255), a]) if a else b"\0\0\0\0"
        redovi.append(bytes(red))

    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", n, n, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(b"".join(redovi), 9)) + chunk(b"IEND", b""))


SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="22" fill="#2b8a3e"/>
<circle cx="50" cy="50" r="30" fill="#fff"/>
<circle cx="50" cy="44" r="7.5" fill="#1d1d1b"/>
<path d="M46.5 47 L53.5 47 L58.25 66 L41.75 66 Z" fill="#1d1d1b"/>
</svg>
"""

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    (OUT / "ikona.svg").write_text(SVG, encoding="utf8")
    for n in (192, 512):
        (OUT / f"ikona-{n}.png").write_bytes(png(n, False))
    (OUT / "ikona-maskable-512.png").write_bytes(png(512, True))
    print("ikone:", ", ".join(sorted(p.name for p in OUT.iterdir())))
