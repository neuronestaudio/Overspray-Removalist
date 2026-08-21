"""Crop the URL line out of the logo.

The source lockup carries "www.overspray.com.au" under the wordmark. It reads
as a 2005 business card, it duplicates what the site already is, and it points
at the DUPLICATE domain the audit flagged, so here it is worse than decoration.

The crop line is measured, not eyeballed. Detecting ink alone does not work:
the red "TOR" watermark runs the full height, so every row registers. Detecting
near-WHITE rows instead isolates the three text lines, and the cut goes in the
gap between the last two.

Run: python build/logo.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "site", "images", "logo.png")
OUT = os.path.join(ROOT, "app", "public", "assets", "images", "logo.webp")

im = Image.open(SRC).convert("RGBA")
w, h = im.size
px = im.load()

rows = []
for y in range(h):
    n = 0
    for x in range(0, w, 2):
        r, g, b, a = px[x, y]
        if a > 120 and r > 175 and g > 175 and b > 175:
            n += 1
    rows.append(n)

bands, run = [], None
for y, n in enumerate(rows):
    if n >= 3 and run is None:
        run = y
    elif n < 3 and run is not None:
        if y - run > 4:
            bands.append((run, y - 1))
        run = None
if run is not None:
    bands.append((run, h - 1))

if len(bands) < 2:
    raise SystemExit(f"expected at least two text bands, found {len(bands)}")

# Everything above the final band is the wordmark; the final band is the URL.
cut = (bands[-2][1] + bands[-1][0]) // 2
cropped = im.crop((0, 0, w, cut))

bbox = cropped.getbbox()
if bbox:
    cropped = cropped.crop(bbox)

cropped.thumbnail((560, 560), Image.LANCZOS)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
cropped.save(OUT, "WEBP", quality=92, method=6)

print(f"bands: {bands}")
print(f"cut at y={cut}  ->  {cropped.size}  ({os.path.getsize(OUT)//1024} KB)")
