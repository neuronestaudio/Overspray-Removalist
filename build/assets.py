"""Asset pipeline: source images from site/images -> optimised WebP in web/assets/images.

Several archive images are multi-panel composites (before01 is three photos side by
side). Those get split so each panel becomes its own gallery item.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "site", "images")
OUT = os.path.join(ROOT, "web", "assets", "images")
os.makedirs(OUT, exist_ok=True)

# Composite archive photos, split into their panels.
# source -> (output stem, columns, rows)
SPLIT = {
    "gallery/before01.jpg": ("job-splatter", 3, 1),
    "gallery/before02.jpg": ("job-merc", 2, 1),
    "gallery/before03.jpg": ("job-ute", 2, 2),      # 2x2 contact sheet
    "gallery/before04.jpg": ("job-audi", 2, 1),
    "gallery/after03.jpg": ("job-ute-after", 2, 1),
}

# straight conversions: source -> output stem
SINGLE = {
    "gallery/after01.jpg": "job-splatter-after",
    "gallery/after02.jpg": "job-merc-after",
    "gallery/after04.jpg": "job-audi-after",
    "gallery/before05.jpg": "job-tarago-before",
    "gallery/after05.jpg": "job-tarago-after",
    "gallery/8.jpg": "ram",
    "gallery/9.jpg": "wheel-a",
    "gallery/10.jpg": "wheel-b",
    "gallery/11.jpg": "landcruiser",
    "gallery/12.jpg": "challenger",
    "gallery/13.jpg": "suv-black",
    "gallery/14.jpg": "audi",
    "gallery/15.jpg": "van-wash",
    "service01.jpg": "svc-overspray",
    "service02.jpg": "svc-cement",
    "service03.jpg": "svc-graffiti",
    "service04.jpg": "svc-fallout",
    "welcome.jpg": "workshop",
    "sub-banner.jpg": "texture-wide",
}

WIDTHS = [640, 1200, 1920]


def emit(im, stem):
    """Write responsive WebP widths, always including the source's native width
    so nothing is upscaled and nothing is capped below what the source offers."""
    im = im.convert("RGB")
    targets = sorted({w for w in WIDTHS if w < im.width} | {im.width})
    written = []
    for w in targets:
        h = round(im.height * w / im.width)
        r = im if w == im.width else im.resize((w, h), Image.LANCZOS)
        name = f"{stem}-{w}.webp"
        r.save(os.path.join(OUT, name), "WEBP", quality=82, method=6)
        written.append((name, w, h))
    return written


manifest = {}
total_before = total_after = 0

for rel, (stem, cols, rows) in SPLIT.items():
    path = os.path.join(SRC, *rel.split("/"))
    if not os.path.exists(path):
        print("MISSING", rel)
        continue
    total_before += os.path.getsize(path)
    im = Image.open(path)
    pw, ph = im.width // cols, im.height // rows
    n = 0
    for r in range(rows):
        for c in range(cols):
            n += 1
            panel = im.crop((c * pw, r * ph, (c + 1) * pw, (r + 1) * ph))
            s = f"{stem}-{n}"
            manifest[s] = emit(panel, s)
            print(f"split  {rel} panel {n} -> {s} ({panel.width}x{panel.height})")

for rel, stem in SINGLE.items():
    path = os.path.join(SRC, *rel.split("/"))
    if not os.path.exists(path):
        print("MISSING", rel)
        continue
    total_before += os.path.getsize(path)
    manifest[stem] = emit(Image.open(path), stem)
    print(f"conv   {rel} -> {stem}")

# logo keeps transparency, so it stays PNG
logo_src = os.path.join(SRC, "logo.png")
if os.path.exists(logo_src):
    lg = Image.open(logo_src).convert("RGBA")
    lg.thumbnail((520, 520), Image.LANCZOS)
    lg.save(os.path.join(OUT, "logo.webp"), "WEBP", quality=90, method=6)
    print("conv   logo.png -> logo.webp")

for f in os.listdir(OUT):
    total_after += os.path.getsize(os.path.join(OUT, f))

print(f"\nsource {total_before/1024/1024:.2f} MB  ->  output {total_after/1024/1024:.2f} MB")
print(f"variants written: {len(os.listdir(OUT))}")
