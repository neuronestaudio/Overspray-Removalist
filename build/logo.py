"""Turn the TOR lockup into a transparent, site-ready logo.

The source is a square render on a dark textured card. Pasted as-is it shows a
grey box against the site's near-black navy, so the background has to come out.

Keying on luminance alone would half-erase the orange, which is a mid-tone.
Instead alpha is distance from the sampled background colour: white marks are
far in luminance, orange is far in hue, and the card's grain sits close enough
to zero out. The original RGB is kept, so the grunge texture in the letterforms
survives.

Run: python build/logo.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "brand", "tor-logo-source.png")
OUT_DIR = os.path.join(ROOT, "app", "public", "assets", "images")

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()

# Background colour, sampled from the corners rather than assumed.
corner = []
for cx, cy in ((6, 6), (w - 7, 6), (6, h - 7), (w - 7, h - 7)):
    for dx in range(0, 24, 4):
        for dy in range(0, 24, 4):
            x = min(max(cx + dx - 12, 0), w - 1)
            y = min(max(cy + dy - 12, 0), h - 1)
            corner.append(px[x, y])
br = sum(c[0] for c in corner) / len(corner)
bg = sum(c[1] for c in corner) / len(corner)
bb = sum(c[2] for c in corner) / len(corner)

# Anything within FLOOR of the card colour is background; FULL and above is
# solid ink. Between them alpha ramps, which keeps the edges from stair-stepping.
FLOOR, FULL = 26.0, 78.0

out = Image.new("RGBA", (w, h))
op = out.load()
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        d = ((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2) ** 0.5
        if d <= FLOOR:
            a = 0
        elif d >= FULL:
            a = 255
        else:
            a = int(255 * (d - FLOOR) / (FULL - FLOOR))
        op[x, y] = (r, g, b, a)

bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)

out.thumbnail((900, 900), Image.LANCZOS)
os.makedirs(OUT_DIR, exist_ok=True)
out.save(os.path.join(OUT_DIR, "logo.webp"), "WEBP", quality=94, method=6, lossless=False)

# Monogram only, for the header: at 46px tall the tagline under the letters is
# unreadable, so the header gets TOR alone and the wordmark lives in the footer
# and splash where there is room for it.
#
# The split is measured, not a guessed fraction: an 0.74 crop sliced through the
# letterforms. Walk the alpha row profile up from the bottom, skip the tagline,
# then stop at the gap above it.
ap = out.load()
rows = []
for y in range(out.height):
    n = 0
    for x in range(0, out.width, 2):
        if ap[x, y][3] > 40:
            n += 1
    rows.append(n)

y = out.height - 1
while y > 0 and rows[y] < 3:
    y -= 1                       # bottom margin
while y > 0 and rows[y] >= 3:
    y -= 1                       # the tagline
gap_bottom = y
while y > 0 and rows[y] < 3:
    y -= 1                       # the gap above it
letters_bottom = y

mark = out.crop((0, 0, out.width, (letters_bottom + gap_bottom) // 2 + 1))
mb = mark.getbbox()
if mb:
    mark = mark.crop(mb)
mark.save(os.path.join(OUT_DIR, "logo-mark.webp"), "WEBP", quality=94, method=6)

print(f"card colour rgb({br:.0f},{bg:.0f},{bb:.0f})")
print(f"logo      {out.size}  {os.path.getsize(os.path.join(OUT_DIR,'logo.webp'))//1024} KB")
print(f"mark      {mark.size}")
