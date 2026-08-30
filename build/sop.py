"""Build the SSG+SPA build SOP to HTML, ready for build/sop.js to render.

    python build/sop.py && node build/sop.js

Content lives in sop_data.py. This file is layout only.
"""
import base64
import os

from sop_data import SUBTITLE, INTRO, WHY, STACK, STEPS, VERIFY, TRAPS, PROMPT, NOTES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
FONTS = os.path.join(ROOT, "app", "public", "assets", "fonts")


def b64_font(name):
    with open(os.path.join(FONTS, name), "rb") as f:
        return base64.b64encode(f.read()).decode()


css = f"""
@font-face {{ font-family:'Bebas Neue'; font-weight:400; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('bebas-neue-400.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:300; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-300.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:400; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-400.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:700; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-700.woff2')}) format('woff2'); }}

/* margin 0 so the cover bleeds; the body pass sets its own margins. */
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin:0; font-family:'DM Sans',system-ui,sans-serif; font-size:9pt;
  line-height:1.62; color:#1a1d24; background:#fff; -webkit-print-color-adjust:exact; }}
h1,h2,h3 {{ font-family:'Bebas Neue',sans-serif; font-weight:400; letter-spacing:.012em; margin:0; }}
p {{ margin:0 0 .62em; }}
code {{ font-family:'Consolas','Courier New',monospace; font-size:.88em;
  background:#eef1f6; padding:.1em .35em; border-radius:3px; }}

/* ---- cover ---- */
.cover {{ width:210mm; height:297mm; position:relative; overflow:hidden;
  background:linear-gradient(158deg,#0d1220 0%,#080b16 58%,#111a2e 100%);
  color:#fff; padding:26mm 20mm 20mm; display:flex; flex-direction:column; }}
.cover::after {{ content:''; position:absolute; inset:0;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 42px),
    repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 1px 42px);
}}
.cover > * {{ position:relative; z-index:1; }}
.ckicker {{ font-size:8pt; letter-spacing:.3em; text-transform:uppercase; color:#7fd1ff;
  font-weight:700; margin-bottom:auto; }}
.ceyebrow {{ font-size:8pt; letter-spacing:.28em; text-transform:uppercase; color:#8fa2c4; font-weight:700; }}
.cover h1 {{ font-size:44pt; line-height:.94; margin:5mm 0 4mm; max-width:15ch; }}
.csub {{ font-weight:300; letter-spacing:.14em; text-transform:uppercase; font-size:10pt;
  color:#cdd6e6; margin:0 0 8mm; }}
.cmeta {{ font-size:8.6pt; color:#93a0b8; border-top:1px solid rgba(255,255,255,.18); padding-top:5mm; }}

/* ---- body ---- */
.page {{ padding:0 18mm; }}
h2 {{ font-size:18pt; margin:0 0 1.5mm; color:#0d1220; break-after:avoid; page-break-after:avoid; }}
.rule {{ height:2px; width:20mm; background:linear-gradient(90deg,#2d7ff9,#0d1220); margin-bottom:4mm; }}
.sub {{ color:#5a6376; font-size:8.4pt; margin:-1mm 0 4.5mm; }}
.newpage {{ break-before:page; page-break-before:always; }}
h3 {{ break-after:avoid; page-break-after:avoid; }}
.rule, .sub {{ break-after:avoid; page-break-after:avoid; }}
p, li, td {{ orphans:3; widows:3; }}

.lead {{ font-size:10pt; line-height:1.7; color:#2b3242; margin-bottom:5mm; }}

table {{ width:100%; border-collapse:collapse; }}
td {{ padding:2.6mm 0; border-bottom:1px solid #eef1f6; vertical-align:top; font-size:8.9pt; }}
td.k {{ width:44mm; font-weight:700; color:#0d1220; padding-right:5mm; }}
tr {{ break-inside:avoid; page-break-inside:avoid; }}

.step {{ display:grid; grid-template-columns:11mm 1fr; gap:0 4mm; margin:0 0 5mm;
  break-inside:avoid; page-break-inside:avoid; }}
.step-n {{ font-family:'Bebas Neue',sans-serif; font-size:19pt; line-height:1; color:#2d7ff9; }}
.step h3 {{ font-size:12.5pt; margin:0 0 1.4mm; color:#0d1220; }}
.step p {{ margin:0 0 1.6mm; }}
.step .why {{ font-size:8.3pt; color:#5a6376; border-left:2px solid #dbe2ee; padding-left:3.5mm; }}

.trap {{ margin:0 0 5mm; padding:4mm 5mm; border-radius:2mm; background:#f7f9fc;
  border-left:3px solid #d0392b; break-inside:avoid; page-break-inside:avoid; }}
.trap h3 {{ font-size:12pt; margin:0 0 1.6mm; color:#0d1220; }}
.trap .cost {{ font-size:8.3pt; color:#7b2018; margin:1.6mm 0 0; }}
.trap .cost b {{ color:#a12b1e; }}

ol.check {{ margin:0; padding-left:5mm; font-size:9pt; }}
ol.check li {{ margin-bottom:2.2mm; break-inside:avoid; }}

pre {{ background:#0d1220; color:#e7edf7; padding:6mm; border-radius:2.5mm;
  font-family:'Consolas','Courier New',monospace; font-size:7.6pt; line-height:1.55;
  white-space:pre-wrap; word-break:break-word; }}

.note {{ background:#eef4ff; border-left:3px solid #2d7ff9; padding:4mm 5mm; margin:5mm 0 0;
  font-size:8.6pt; color:#2b3242; break-inside:avoid; }}
.foot {{ margin-top:8mm; padding-top:4mm; border-top:1px solid #e4e8f0; font-size:7.8pt; color:#7b8397; }}
"""

why = "".join(f"<tr><td class='k'>{k}</td><td>{v}</td></tr>" for k, v in WHY)
stack = "".join(f"<tr><td class='k'>{k}</td><td>{v}</td></tr>" for k, v in STACK)
steps = "".join(
    f"<div class='step'><div class='step-n'>{n}</div><div>"
    f"<h3>{t}</h3><p>{d}</p><p class='why'>{w}</p></div></div>"
    for n, t, d, w in STEPS
)
verify = "".join(f"<li>{v}</li>" for v in VERIFY)
traps = "".join(
    f"<div class='trap'><h3>{t}</h3><p>{d}</p><p class='cost'><b>What it cost:</b> {c}</p></div>"
    for t, d, c in TRAPS
)

html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>SOP — Static pages and a single-page app</title><style>{css}</style></head><body>

<section class="cover">
  <div class="ckicker">Pendulum Digital &nbsp;&middot;&nbsp; build standard</div>
  <div class="ceyebrow">Standard operating procedure</div>
  <h1>Two builds, one codebase</h1>
  <p class="csub">{SUBTITLE}</p>
  <div class="cmeta">
    How to build a site that search engines can read and visitors can move through instantly.<br>
    Written from a production build. Includes the seven faults that actually occurred.
  </div>
</section>

<section class="page">
  <h2>What this is</h2><div class="rule"></div>
  <p class="lead">{INTRO}</p>

  <h3 style="font-size:13pt;margin-bottom:2mm">Why it is worth the extra step</h3>
  <table>{why}</table>

  <h2 class="newpage">The stack</h2><div class="rule"></div>
  <p class="sub">Any equivalent will do. The pattern matters, not the libraries.</p>
  <table>{stack}</table>

  <h2 class="newpage">The procedure</h2><div class="rule"></div>
  <p class="sub">Eight steps. Step one is the one everything else depends on.</p>
  {steps}

  <h2 class="newpage">Before you call it done</h2><div class="rule"></div>
  <p class="sub">Seven checks. Each catches a failure that looks like success.</p>
  <ol class="check">{verify}</ol>

  <h2 class="newpage">Traps</h2><div class="rule"></div>
  <p class="sub">Every one of these happened on a real build. None announced itself.</p>
  {traps}

  <h2 class="newpage">Brief for an AI agent</h2><div class="rule"></div>
  <p class="sub">Paste this whole block. The final paragraph is the part most agents skip, so
  leave it in.</p>
  <pre>{PROMPT}</pre>

  <div class="note"><b>When not to use this.</b> {NOTES}</div>

  <div class="foot">
    Pendulum Digital &nbsp;&middot;&nbsp; internal build standard. Derived from a 61-page
    production site.
  </div>
</section>
</body></html>"""

out = os.path.join(BUILD, "sop.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"wrote {out} ({len(html) // 1024}KB) — {len(STEPS)} steps, {len(TRAPS)} traps, {len(VERIFY)} checks")
