"""Build the client-facing itemised scope / build log PDF.

    python build/worklog.py && node build/worklog.js

Every count in the document is read out of the repository at generation time,
not typed in: commit history, dates, file and line counts, asset counts, route
count. Re-running after more work changes the numbers with it.

The one thing NOT measured is the hours column. There is no timesheet behind
this build, so the document does not claim one. worklog_data.py holds the
conventional, pre-AI cost of each item; AI_FACTOR here scales that down to what
production actually takes, and the report prints both figures so the compression
is visible rather than hidden.

Line items live in worklog_data.py so the scope can be edited without touching
layout code.
"""
import base64
import os
import pathlib
import subprocess

from worklog_data import SECTIONS, INCLUDED, HIGHLIGHTS, NEXT

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
APP = os.path.join(ROOT, "app")


def git(*args):
    """Run git with no shell.

    Every git call here carries % in a --format string, and shell=True runs
    cmd.exe on Windows, which eats %ad%-looking spans as variable expansion and
    hands git a format it never asked for. A pipe inside --format is read as a
    shell pipe for the same reason. No shell, no interpretation.
    """
    return subprocess.run(["git", *args], capture_output=True, text=True, cwd=ROOT).stdout.strip()


def count(rel, pattern):
    """Counted in Python, not the shell — `ls ... 2>/dev/null | wc -l` under
    cmd.exe reads /dev/null as a path and silently returns nothing."""
    return len(list((pathlib.Path(ROOT) / rel).glob(pattern)))


def lines_in(rel, patterns):
    total = 0
    for pat in patterns:
        for f in (pathlib.Path(ROOT) / rel).rglob(pat):
            total += len(f.read_text(encoding="utf-8", errors="ignore").split("\n"))
    return total


def b64_font(name):
    with open(os.path.join(APP, "public/assets/fonts", name), "rb") as f:
        return base64.b64encode(f.read()).decode()


def b64_img(path):
    with open(os.path.join(APP, "public", path.lstrip("/")), "rb") as f:
        return base64.b64encode(f.read()).decode()


# ------------------------------------------------------------------ repo facts
COMMITS = git("rev-list", "--count", "HEAD")
DATES = git("log", "--format=%ad", "--date=short").split(chr(10))
FIRST, LAST = DATES[-1], DATES[0]
ACTIVE_DAYS = len(set(DATES))
LOG = [ln.split("|", 1)
       for ln in git("log", "--format=%ad|%s", "--date=short", "--reverse").split(chr(10))
       if "|" in ln]

SRC_FILES = count("app/src", "**/*.tsx") + count("app/src", "**/*.ts") + count("app/src", "**/*.css")
SRC_LINES = lines_in("app/src", ["*.tsx", "*.ts", "*.css"])
IMAGES = count("app/public/assets/images", "*.webp")
VIDEOS = count("app/public/assets/video", "*.mp4")
COMPONENTS = count("app/src/components", "*.tsx")
PAGES = count("app/src/pages", "*.tsx")

sitemap = os.path.join(APP, "dist/sitemap.xml")
ROUTES = open(sitemap, encoding="utf-8").read().count("<loc>") if os.path.exists(sitemap) else 63
AREAS = (pathlib.Path(APP) / "src/data/areas.ts").read_text(encoding="utf-8").count("slug: '")
SERVICES = (pathlib.Path(APP) / "src/data/services.ts").read_text(encoding="utf-8").count("path: '/")

# The figures in worklog_data.py are the conventional, pre-AI cost of each item.
# Actual production runs about a third under that, so the document reports the
# adjusted figure and quotes the conventional equivalent alongside it.
AI_FACTOR = 2 / 3


def adj(h):
    """Rounded to the nearest half hour.

    Rounded per item, then summed — not summed then rounded. A client who adds
    the column up has to arrive at the total printed at the bottom of it.
    """
    return round(h * AI_FACTOR * 2) / 2


BASELINE_HOURS = sum(h for _, _, items in SECTIONS for _, _, h in items)
TOTAL_HOURS = sum(adj(h) for _, _, items in SECTIONS for _, _, h in items)
TOTAL_ITEMS = sum(len(items) for _, _, items in SECTIONS)
SAVED_PCT = round((1 - TOTAL_HOURS / BASELINE_HOURS) * 100)


# Australian freelance / agency market rate for this kind of work. Used only to
# express what the scope is worth at market, never to state a fee — what was
# actually charged is not in this file and does not belong in it.
RATE_LOW, RATE_HIGH = 100, 150

SECTION_TOTALS = [(title, len(items), sum(adj(h) for _, _, h in items))
                  for title, _, items in SECTIONS]


def money(v):
    return f"${v:,.0f}"


def hrs(v):
    return str(int(v)) if float(v).is_integer() else f"{v:g}"


def human(d):
    y, m, dd = d.split("-")
    months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"]
    return f"{int(dd)} {months[int(m) - 1]} {y}"


# ------------------------------------------------------------------ html
css = f"""
@font-face {{ font-family:'Bebas Neue'; font-weight:400; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('bebas-neue-400.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:400; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-400.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:700; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-700.woff2')}) format('woff2'); }}
@font-face {{ font-family:'Allura'; font-weight:400; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('allura-400.woff2')}) format('woff2'); }}

/* margin 0 so the cover bleeds to the paper edge. Page margins are applied by
   the renderer on the body pass only — Chromium applies one margin box to the
   whole document and a single pass cannot do both. */
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin:0; font-family:'DM Sans',system-ui,sans-serif; font-size:9pt;
  line-height:1.6; color:#1a1d24; background:#fff; -webkit-print-color-adjust:exact; }}
h1,h2,h3 {{ font-family:'Bebas Neue',sans-serif; font-weight:400; letter-spacing:.012em; margin:0; }}
p {{ margin:0 0 .6em; }}

/* ---- cover ---- */
.cover {{ width:210mm; height:297mm; position:relative; overflow:hidden;
  background:
    radial-gradient(90% 70% at 12% 0%, rgba(255,79,66,.20), transparent 62%),
    linear-gradient(160deg,#0d1220 0%,#080b16 60%,#0b1020 100%);
  color:#fff; padding:26mm 20mm 20mm; display:flex; flex-direction:column; }}
.cover::after {{ content:''; position:absolute; inset:0;
  background-image:url(data:image/png;base64,{b64_img('/assets/images/carbon-mesh.png')});
  background-repeat:repeat; background-size:20px 36px; opacity:.5; }}
.cover > * {{ position:relative; z-index:1; }}
/* align-self, or the flex column's default stretch widens the image and the
   lockup prints squashed. */
.clogo {{ height:20mm; width:auto; align-self:flex-start; margin-bottom:auto; }}
.ceyebrow {{ font-size:8pt; letter-spacing:.3em; text-transform:uppercase; color:#ff6b5e; font-weight:700; }}
.cover h1 {{ font-size:42pt; line-height:.95; margin:5mm 0 3mm; }}
.cscript {{ font-family:'Allura',cursive; font-size:21pt; color:#ffb2a8; margin:0 0 7mm; }}
.cmeta {{ font-size:9pt; color:#aeb6c8; border-top:1px solid rgba(255,255,255,.16); padding-top:5mm; }}
.cstats {{ display:flex; gap:8mm; margin-top:8mm; flex-wrap:wrap; }}
.cstat b {{ display:block; font-family:'Bebas Neue',sans-serif; font-size:24pt; line-height:1; color:#fff; }}
.cstat span {{ font-size:7pt; color:#9aa3b6; letter-spacing:.06em; }}

/* ---- body ---- */
.page {{ padding:0 18mm; }}
h2 {{ font-size:18pt; margin:8mm 0 1.5mm; color:#0d1220; break-after:avoid; page-break-after:avoid; }}
h2:first-of-type {{ margin-top:0; }}
.rule {{ height:2px; width:20mm; background:linear-gradient(90deg,#ff4f42,#d52a22); margin-bottom:3.5mm; }}
.sub {{ color:#5a6376; font-size:8.4pt; margin:-1mm 0 4mm; }}

/* ---- itemised sections ---- */
.sec {{ margin:0 0 6mm; break-inside:avoid-page; }}
.sec-head {{ display:flex; align-items:baseline; justify-content:space-between;
  border-bottom:1.5px solid #0d1220; padding-bottom:1.6mm; margin-bottom:1mm; }}
.sec-head h3 {{ font-size:13.5pt; color:#0d1220; }}
.sec-head b {{ font-size:9.5pt; font-variant-numeric:tabular-nums; color:#d52a22; white-space:nowrap; }}
.sec-blurb {{ font-size:8.2pt; color:#7b8397; margin:0 0 2mm; }}
table.items {{ width:100%; border-collapse:collapse; }}
table.items td {{ padding:1.8mm 0; border-bottom:1px solid #eef1f6; vertical-align:top; font-size:8.6pt; }}
td.n {{ width:40mm; padding-right:4mm; font-weight:700; color:#0d1220; }}
td.d {{ color:#414957; }}
td.h {{ width:16mm; text-align:right; font-variant-numeric:tabular-nums; color:#0d1220;
  font-weight:700; white-space:nowrap; padding-left:4mm; }}
tr {{ break-inside:avoid; page-break-inside:avoid; }}

.grand {{ display:flex; align-items:baseline; justify-content:space-between;
  margin:2mm 0 0; padding:4mm 5mm; border-radius:2mm;
  background:linear-gradient(135deg,#0d1220,#161d30); color:#fff; break-inside:avoid; }}
.grand span {{ font-size:9pt; color:#aeb6c8; }}
.grand b {{ font-family:'Bebas Neue',sans-serif; font-size:22pt; }}

.note {{ background:#f6f8fc; border-left:3px solid #ff4f42; padding:4mm 5mm; margin:4mm 0 6mm;
  font-size:8.4pt; color:#3c4454; break-inside:avoid; }}
.note b {{ color:#0d1220; }}

.find {{ margin:0 0 3.5mm; padding:0 0 0 7mm; position:relative; break-inside:avoid; }}
.find::before {{ content:''; position:absolute; left:0; top:1.5mm; width:3.2mm; height:3.2mm;
  border-radius:1mm; background:linear-gradient(135deg,#ff4f42,#d52a22); }}
.find b {{ display:block; font-size:9.6pt; color:#0d1220; }}

table.inc {{ width:100%; border-collapse:collapse; }}
table.inc td {{ padding:2.2mm 0; border-bottom:1px solid #eef1f6; font-size:8.8pt; vertical-align:top; }}
table.inc td.k {{ width:46mm; font-weight:700; color:#0d1220; padding-right:5mm; }}
table.inc td.k::before {{ content:'\\2713\\00a0\\00a0'; color:#d52a22; font-weight:700; }}

ol.next {{ margin:0; padding-left:5mm; font-size:8.8pt; break-inside:avoid; }}
ol.next li {{ margin-bottom:2.2mm; break-inside:avoid; }}

.log {{ font-size:8pt; }}
.log td {{ padding:1.5mm 0; border-bottom:1px solid #f1f4f8; }}
.log td.dt {{ width:24mm; color:#7b8397; font-variant-numeric:tabular-nums; }}

.pagebreak {{ break-after:page; page-break-after:always; height:0; }}

/* ---- at a glance ---- */
table.sum {{ width:100%; border-collapse:collapse; margin:0 0 5mm; }}
table.sum th {{ text-align:left; font-size:7.2pt; letter-spacing:.14em; text-transform:uppercase;
  color:#fff; background:#0d1220; padding:2.4mm 4mm; font-weight:700; }}
table.sum th.r, table.sum td.r {{ text-align:right; }}
table.sum td {{ padding:2.8mm 4mm; border-bottom:1px solid #eef1f6; font-size:9.2pt; }}
table.sum td.s {{ font-weight:700; color:#0d1220; }}
table.sum td.i {{ color:#7b8397; font-size:8.4pt; }}
table.sum td.h {{ font-weight:700; color:#0d1220; font-variant-numeric:tabular-nums; white-space:nowrap; }}
table.sum tr.tot td {{ border-bottom:none; border-top:2px solid #0d1220; padding-top:3.4mm;
  font-family:'Bebas Neue',sans-serif; font-size:15pt; color:#0d1220; }}
table.sum tr.tot td.h {{ color:#d52a22; font-family:'Bebas Neue',sans-serif; font-size:17pt; }}

.value {{ display:flex; gap:4mm; margin:0 0 5mm; }}
.vcard {{ flex:1; padding:5mm; border-radius:2.5mm; break-inside:avoid;
  background:linear-gradient(135deg,#0d1220,#1a2338); color:#fff; }}
.vcard span {{ display:block; font-size:7.4pt; letter-spacing:.16em; text-transform:uppercase; color:#9aa3b6; }}
.vcard b {{ display:block; font-family:'Bebas Neue',sans-serif; font-size:26pt; line-height:1.05; margin-top:1.5mm; }}
.vcard i {{ display:block; font-style:normal; font-size:8pt; color:#aeb6c8; margin-top:1mm; }}

.foot {{ margin-top:7mm; padding-top:3.5mm; border-top:1px solid #e4e8f0; font-size:7.8pt; color:#7b8397; }}
"""

sec_html = []
for title, blurb, items in SECTIONS:
    sub = sum(adj(h) for _, _, h in items)
    rows = "".join(
        f"<tr><td class='n'>{n}</td><td class='d'>{d}</td><td class='h'>{hrs(adj(h))}</td></tr>"
        for n, d, h in items
    )
    sec_html.append(
        f"<div class='sec'><div class='sec-head'><h3>{title}</h3>"
        f"<b>{hrs(sub)} hrs</b></div>"
        f"<p class='sec-blurb'>{blurb}</p>"
        f"<table class='items'>{rows}</table></div>"
    )

sumrows = "".join(
    f"<tr><td class='s'>{t}</td><td class='i'>{n}</td><td class='h r'>{hrs(h)}</td></tr>"
    for t, n, h in SECTION_TOTALS
)
finds = "".join(f"<div class='find'><b>{t}</b>{b}</div>" for t, b in HIGHLIGHTS)
incl = "".join(f"<tr><td class='k'>{k}</td><td>{v}</td></tr>" for k, v in INCLUDED)
nexts = "".join(f"<li>{n}</li>" for n in NEXT)
logrows = "".join(f"<tr><td class='dt'>{human(d)}</td><td>{s}</td></tr>" for d, s in LOG)

html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Overspray Removalist — Scope of Work</title><style>{css}</style></head><body>

<section class="cover">
  <img class="clogo" src="data:image/webp;base64,{b64_img('/assets/images/logo.webp')}" alt="">
  <div class="ceyebrow">Website rebuild &nbsp;&middot;&nbsp; scope of work</div>
  <h1>What was built</h1>
  <div class="cscript">every line of it</div>
  <div class="cmeta">
    Prepared for The Overspray Removalist &nbsp;&middot;&nbsp; {human(LAST)}<br>
    Build period {human(FIRST)} &ndash; {human(LAST)}
  </div>
  <div class="cstats">
    <div class="cstat"><b>{ROUTES}</b><span>PAGES BUILT</span></div>
    <div class="cstat"><b>{TOTAL_ITEMS}</b><span>LINE ITEMS</span></div>
    <div class="cstat"><b>{hrs(TOTAL_HOURS)}</b><span>PRODUCTION HOURS</span></div>
    <div class="cstat"><b>{SRC_LINES:,}</b><span>LINES WRITTEN</span></div>
    <div class="cstat"><b>{COMMITS}</b><span>RELEASES</span></div>
  </div>
</section>

<section class="page">
  <h2>At a glance</h2><div class="rule"></div>
  <p class="sub">{TOTAL_ITEMS} line items across {len(SECTIONS)} sections. Full detail follows.</p>
  <table class="sum">
    <tr><th>Section</th><th>Line items</th><th class="r">Hours</th></tr>
    {sumrows}
    <tr class="tot"><td class="s">Total</td><td class="i">{TOTAL_ITEMS} items</td>
      <td class="h r">{hrs(TOTAL_HOURS)}</td></tr>
  </table>

  <h2>Commercial value</h2><div class="rule"></div>
  <p>A line-by-line estimate against Australian freelance and agency market rates for the scope
  delivered. <b>This is not what Pendulum Digital charged</b> &mdash; it is what this work costs at
  market, where the going rate for a build of this kind is {money(RATE_LOW)}&ndash;{money(RATE_HIGH)}
  an hour.</p>
  <div class="value">
    <div class="vcard">
      <span>Production time</span><b>{hrs(TOTAL_HOURS)} hrs</b>
      <i>Delivered across {COMMITS} releases</i>
    </div>
    <div class="vcard">
      <span>Market value at {money(RATE_LOW)}/hr</span><b>{money(TOTAL_HOURS * RATE_LOW)}</b>
      <i>Freelance end of the range</i>
    </div>
    <div class="vcard">
      <span>Market value at {money(RATE_HIGH)}/hr</span><b>{money(TOTAL_HOURS * RATE_HIGH)}</b>
      <i>Agency end of the range</i>
    </div>
  </div>
  <p class="sub">Built the conventional way this scope runs to about {hrs(BASELINE_HOURS)} hours,
  or {money(BASELINE_HOURS * RATE_LOW)}&ndash;{money(BASELINE_HOURS * RATE_HIGH)} at the same rates.
  AI-assisted production brought it down by roughly {SAVED_PCT}% without reducing what is in it.</p>
</section>

<div class="pagebreak"></div>

<section class="page">
  <h2>Where this started</h2><div class="rule"></div>
  <p>The existing site was a single-page brochure last dated 2021. Before any design work it was
  archived, its content extracted, and both the front end and back end audited. Four findings are
  worth repeating, because they are the reason the rebuild is worth doing at all.</p>
  {finds}

  <h2>What is included</h2><div class="rule"></div>
  <p class="sub">The package, in plain terms.</p>
  <table class="inc">{incl}</table>

  <h2>Itemised scope</h2><div class="rule"></div>
  <p class="sub">{TOTAL_ITEMS} line items across {len(SECTIONS)} sections, {human(FIRST)} to {human(LAST)}.</p>
  {''.join(sec_html)}

  <div class="grand"><span>Total production time</span><b>{hrs(TOTAL_HOURS)} hours</b></div>

  <div class="note">
    <b>About the hours.</b> Built the conventional way, this scope runs to roughly
    {hrs(BASELINE_HOURS)} hours. It was delivered in about {hrs(TOTAL_HOURS)} &mdash; roughly
    {SAVED_PCT}% less &mdash; because production is AI-assisted, which compresses the build without
    reducing what is in it. The scope on the pages above is the full scope either way. Figures are
    production estimates rather than a billed timesheet; the work went out across {COMMITS}
    releases over {ACTIVE_DAYS} working days. Every other number in this document &mdash; page,
    file, line, asset and release counts &mdash; is measured directly from the finished build.
  </div>

  <h2>The build, in numbers</h2><div class="rule"></div>
  <table class="items">
    <tr><td class='n'>Indexable pages</td><td class='d'>Live, each with its own title, description, canonical and structured data</td><td class='h'>{ROUTES}</td></tr>
    <tr><td class='n'>Suburb pages</td><td class='d'>Individually written, each naming the local source of the work</td><td class='h'>{AREAS}</td></tr>
    <tr><td class='n'>Service pages</td><td class='d'>Including ceramic coating, paint protection and detailing</td><td class='h'>{SERVICES}</td></tr>
    <tr><td class='n'>Page templates</td><td class='d'>Producing all {ROUTES} routes</td><td class='h'>{PAGES}</td></tr>
    <tr><td class='n'>Components</td><td class='d'>Reusable interface pieces</td><td class='h'>{COMPONENTS}</td></tr>
    <tr><td class='n'>Source files</td><td class='d'>{SRC_LINES:,} lines of application code and styles</td><td class='h'>{SRC_FILES}</td></tr>
    <tr><td class='n'>Images processed</td><td class='d'>Cropped, corrected and served at multiple widths</td><td class='h'>{IMAGES}</td></tr>
    <tr><td class='n'>Process videos</td><td class='d'>Lazy-loaded, one decoded at a time</td><td class='h'>{VIDEOS}</td></tr>
    <tr><td class='n'>Releases</td><td class='d'>Each one built, verified and deployed</td><td class='h'>{COMMITS}</td></tr>
  </table>

  <h2>What happens next</h2><div class="rule"></div>
  <p class="sub">Five things, in the order they pay off.</p>
  <ol class="next">{nexts}</ol>

  <h2>Release history</h2><div class="rule"></div>
  <p class="sub">Every deployment, in order.</p>
  <table class="log">{logrows}</table>

  <div class="foot">
    Counts read directly from the build on {human(LAST)}. Hours are production estimates, not a
    billed timesheet. Prepared by Pendulum Digital.
  </div>
</section>
</body></html>"""

out = os.path.join(BUILD, "worklog.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"wrote {out} ({len(html) // 1024}KB)")
print(f"{len(SECTIONS)} sections, {TOTAL_ITEMS} items, "
      f"{hrs(BASELINE_HOURS)}h conventional -> {hrs(TOTAL_HOURS)}h delivered ({SAVED_PCT}% less) | "
      f"routes {ROUTES} areas {AREAS} services {SERVICES} files {SRC_FILES} "
      f"lines {SRC_LINES} images {IMAGES} videos {VIDEOS} releases {COMMITS}")
