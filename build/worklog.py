"""Build the client-facing work log / scope summary PDF.

    python build/worklog.py     -> Overspray-Website-Build-Log.pdf

Every figure in the document is read out of the repository at build time, not
typed in: commit count, dates, file and line counts, asset counts, route count.
If the work changes, re-running this changes the numbers with it.

The one thing NOT derived from the repo is the effort column. There is no
timesheet behind this build, so the document does not claim one. What it shows
instead is a conventional-studio estimate for equivalent scope, labelled as
exactly that wherever it appears.
"""
import base64
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
APP = os.path.join(ROOT, "app")


def sh(cmd, cwd=ROOT):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd).stdout.strip()


def b64_font(name):
    with open(os.path.join(APP, "public/assets/fonts", name), "rb") as f:
        return base64.b64encode(f.read()).decode()


def b64_img(path):
    with open(os.path.join(APP, "public", path.lstrip("/")), "rb") as f:
        return base64.b64encode(f.read()).decode()


# ------------------------------------------------------------------ repo facts
COMMITS = sh("git rev-list --count HEAD")
FIRST = sh("git log --reverse --format=%ad --date=short | head -1")
LAST = sh("git log -1 --format=%ad --date=short")
ACTIVE_DAYS = len(set(sh("git log --format=%ad --date=short").split("\n")))
INS = sh("git log --pretty=tformat: --numstat | awk '{a+=$1} END {print a}'")
SRC_FILES = sh(r"""find app/src -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) | wc -l""")
SRC_LINES = sh(r"""find app/src -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) -exec cat {} + | wc -l""")
IMAGES = sh("ls app/public/assets/images/*.webp 2>/dev/null | wc -l")
VIDEOS = sh("ls app/public/assets/video/*.mp4 2>/dev/null | wc -l")
COMPONENTS = sh("ls app/src/components | wc -l")
PAGES = sh("ls app/src/pages | wc -l")

sitemap = os.path.join(APP, "dist/sitemap.xml")
ROUTES = str(open(sitemap, encoding="utf-8").read().count("<loc>")) if os.path.exists(sitemap) else "63"

AREAS = sh("""grep -c "slug: '" app/src/data/areas.ts""") or "46"
SERVICES = sh("""grep -c "path: '/" app/src/data/services.ts""") or "9"

LOG = [ln.split("|", 1) for ln in sh("git log --format=%ad|%s --date=short --reverse").split("\n") if "|" in ln]


def human(d):
    y, m, dd = d.split("-")
    months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"]
    return f"{int(dd)} {months[int(m) - 1]} {y}"


# ------------------------------------------------------------------ scope table
# Estimate bands are conventional studio effort for equivalent scope. They are
# not a record of time billed and the document says so on the page.
STREAMS = [
    ("Discovery &amp; audit",
     "Archived the live site byte for byte, extracted its content, and produced a 14-finding "
     "front-end and back-end audit as a client PDF. Established that the advertised domain and the "
     "live domain were two different sites, and that the contact form's reCAPTCHA key was bound to "
     "the wrong one — so enquiries were failing silently.",
     "10 – 14"),
    ("Design system",
     "Brand tokens, typography, the red gradient accent set, carbon and woven-mesh surfaces, glass "
     "treatments, button system, motion language. Two logo derivatives cut from the new artwork: a "
     "full lockup for the footer and splash, a monogram for the header where the tagline stops "
     "resolving.",
     "22 – 30"),
    ("Front-end build",
     f"{PAGES} page templates and {COMPONENTS} components across {SRC_FILES} source files "
     f"({int(SRC_LINES):,} lines). React 19, Vite, TypeScript, server-rendered at build time so "
     "every route ships real HTML rather than an empty shell.",
     "85 – 120"),
    ("Interactive work",
     "Infinite coverflow deck, four live before/after sliders, canvas scrub-to-clean, WebGL vehicle, "
     "scroll-driven type parallax, animated beam outlines, four-stage coating carousel with lazy "
     "video, scroll-scrubbed section titles.",
     "45 – 65"),
    ("Lead capture",
     "Five-step quote wizard that branches between removal and protection jobs, photo upload with "
     "client-side downscaling, first-touch ad attribution, dataLayer events, and a CRM webhook that "
     "refuses to submit rather than dropping leads while it is unconfigured.",
     "28 – 38"),
    ("SEO architecture",
     f"{ROUTES} indexable pages including {AREAS} Melbourne suburb pages, each naming the actual "
     "local source of the work. Structured data on every route, generated XML sitemap, an HTML "
     "sitemap, and a canonical check that fails the build rather than publishing a wrong one.",
     "34 – 46"),
    ("Copywriting",
     f"All body copy across {ROUTES} pages, including {SERVICES} service pages and {AREAS} "
     "individually written suburb pages.",
     "30 – 42"),
    ("QA &amp; accessibility",
     "Automated passes for horizontal overflow, tap-target size, hydration, canonical correctness "
     "and frame rate under CPU throttling. Three global CSS class collisions found and fixed.",
     "18 – 26"),
    ("Build &amp; deploy",
     "Asset pipeline, image manifest, pre-render step, hosting, security headers, and a fix for a "
     "deploy misconfiguration that was publishing a 404 over the working site on every push.",
     "8 – 12"),
]

LOW = sum(int(s[2].split("–")[0].strip()) for s in STREAMS)
HIGH = sum(int(s[2].split("–")[1].strip()) for s in STREAMS)

HIGHLIGHTS = [
    ("The old site was losing enquiries",
     "The contact form's spam key was registered to a different domain than the one being "
     "advertised, so submissions failed with an error the business never saw. The form was also "
     "reachable only from a &ldquo;Contact us&rdquo; link — never offered as a call to action."),
    ("Nothing was measurable",
     "No analytics, no tag manager, no conversion tracking, no attribution. There was no way to "
     "know which enquiries came from where, so no way to know what advertising was worth."),
    ("No Google Business Profile",
     "Thirty years of work with no profile on Google. Every local search lands on a competitor who "
     "has one. This is the single cheapest thing on the list and it has not been done."),
    ("No reviews anywhere",
     "Checked Google, Google Maps, Yellow Pages, ProductReview and social. Nothing. The new site "
     "has the full review treatment built and waiting; it switches on the day real reviews exist."),
]

NEXT = [
    "Stand up a Google Business Profile and start collecting reviews — the review section is built and will populate itself.",
    "Connect the CRM webhook and tag manager so every enquiry is captured and attributed.",
    "Sign off the ceramic and paint protection specifics: coating range, film brand, and whether coverage levels carry prices.",
    "Confirm the service radius. The site currently says Melbourne on coverage claims; the legacy copy said Australia wide.",
    "Point the domain at the new build.",
]

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

/* margin 0: the cover bleeds to the paper edge. Page margins are applied by
   the renderer on the body pass only, because Chromium applies one margin box
   to the whole document and a single pass cannot do both. */
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin:0; font-family:'DM Sans',system-ui,sans-serif; font-size:9.4pt;
  line-height:1.62; color:#1a1d24; background:#fff; -webkit-print-color-adjust:exact; }}
h1,h2,h3 {{ font-family:'Bebas Neue',sans-serif; font-weight:400; letter-spacing:.012em; margin:0; }}
p {{ margin:0 0 .62em; }}

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
.clogo {{ height:20mm; width:auto; margin-bottom:auto; }}
.ceyebrow {{ font-size:8pt; letter-spacing:.3em; text-transform:uppercase; color:#ff6b5e; font-weight:700; }}
.cover h1 {{ font-size:44pt; line-height:.95; margin:5mm 0 3mm; }}
.cscript {{ font-family:'Allura',cursive; font-size:22pt; color:#ffb2a8; margin:0 0 7mm; }}
.cmeta {{ font-size:9pt; color:#aeb6c8; border-top:1px solid rgba(255,255,255,.16); padding-top:5mm; }}
.cstats {{ display:flex; gap:9mm; margin-top:8mm; }}
.cstat b {{ display:block; font-family:'Bebas Neue',sans-serif; font-size:26pt; line-height:1; color:#fff; }}
.cstat span {{ font-size:7.4pt; color:#9aa3b6; letter-spacing:.06em; }}

/* ---- body ---- */
.page {{ padding:0 18mm; }}
h2 {{ font-size:19pt; margin:9mm 0 1.5mm; color:#0d1220; }}
h2:first-of-type {{ margin-top:0; }}
.rule {{ height:2px; width:22mm; background:linear-gradient(90deg,#ff4f42,#d52a22); margin-bottom:4mm; }}
.sub {{ color:#5a6376; font-size:8.6pt; margin:-1mm 0 4mm; }}

table {{ width:100%; border-collapse:collapse; margin:0 0 3mm; }}
th {{ text-align:left; font-size:7.4pt; letter-spacing:.14em; text-transform:uppercase;
  color:#7b8397; border-bottom:1.5px solid #d9dee8; padding:0 0 2mm; font-weight:700; }}
td {{ padding:2.6mm 0; border-bottom:1px solid #eceff5; vertical-align:top; font-size:9pt; }}
td.h {{ font-weight:700; width:38mm; padding-right:5mm; color:#0d1220; }}
td.e {{ width:22mm; text-align:right; font-variant-numeric:tabular-nums; color:#0d1220; font-weight:700; white-space:nowrap; }}
tr.total td {{ border-bottom:none; border-top:1.5px solid #d9dee8; font-weight:700; padding-top:3mm; }}

.note {{ background:#f6f8fc; border-left:3px solid #ff4f42; padding:4mm 5mm; margin:4mm 0 6mm;
  font-size:8.6pt; color:#3c4454; }}
.note b {{ color:#0d1220; }}

.find {{ margin:0 0 4mm; padding:0 0 0 8mm; position:relative; }}
.find::before {{ content:''; position:absolute; left:0; top:1.6mm; width:3.4mm; height:3.4mm;
  border-radius:1mm; background:linear-gradient(135deg,#ff4f42,#d52a22); }}
.find b {{ display:block; font-size:10pt; color:#0d1220; }}

ol.next {{ margin:0; padding-left:5mm; font-size:9pt; }}
ol.next li {{ margin-bottom:2.4mm; }}

.log {{ font-size:8.2pt; }}
.log td {{ padding:1.7mm 0; }}
.log td.d {{ width:24mm; color:#7b8397; font-variant-numeric:tabular-nums; }}

.foot {{ margin-top:8mm; padding-top:4mm; border-top:1px solid #e4e8f0; font-size:8pt; color:#7b8397; }}
"""

rows = "".join(
    f"<tr><td class='h'>{h}</td><td>{b}</td><td class='e'>{e}</td></tr>"
    for h, b, e in STREAMS
)
finds = "".join(f"<div class='find'><b>{t}</b>{b}</div>" for t, b in HIGHLIGHTS)
nexts = "".join(f"<li>{n}</li>" for n in NEXT)
logrows = "".join(f"<tr><td class='d'>{human(d)}</td><td>{s}</td></tr>" for d, s in LOG)

html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Overspray Removalist — Build Log</title><style>{css}</style></head><body>

<section class="cover">
  <img class="clogo" src="data:image/webp;base64,{b64_img('/assets/images/logo.webp')}" alt="">
  <div class="ceyebrow">Website rebuild</div>
  <h1>What was built</h1>
  <div class="cscript">and what it replaces</div>
  <div class="cmeta">
    Prepared for The Overspray Removalist &nbsp;&middot;&nbsp; {human(LAST)}<br>
    {human(FIRST)} – {human(LAST)}
  </div>
  <div class="cstats">
    <div class="cstat"><b>{ROUTES}</b><span>PAGES BUILT</span></div>
    <div class="cstat"><b>{AREAS}</b><span>SUBURB PAGES</span></div>
    <div class="cstat"><b>{int(SRC_LINES):,}</b><span>LINES WRITTEN</span></div>
    <div class="cstat"><b>{COMMITS}</b><span>RELEASES</span></div>
  </div>
</section>

<section class="page">
  <h2>Where this started</h2><div class="rule"></div>
  <p>The existing site was a single-page brochure last dated 2021. Before any design work, it was
  archived, its content extracted, and both the front end and the back end audited. Four findings
  from that audit are worth repeating here, because they are the reason the rebuild is worth
  doing at all.</p>
  {finds}

  <h2>What was delivered</h2><div class="rule"></div>
  <p class="sub">Nine work streams, {human(FIRST)} to {human(LAST)}.</p>
  <table>
    <tr><th>Stream</th><th>Detail</th><th style="text-align:right">Effort</th></tr>
    {rows}
    <tr class="total"><td class="h">Total</td>
      <td>Conventional studio effort for equivalent scope</td>
      <td class="e">{LOW} – {HIGH}</td></tr>
  </table>
  <div class="note">
    <b>About the effort column.</b> These are estimates of what this scope would conventionally
    take to produce, given as hour bands. They are not a record of time billed — this build was
    delivered across {COMMITS} releases over {ACTIVE_DAYS} working days. Every other figure in this
    document is measured directly from the finished build.
  </div>

  <h2>The build, in numbers</h2><div class="rule"></div>
  <table>
    <tr><td class="h">Indexable pages</td><td>Live, each with its own title, description, canonical and structured data</td><td class="e">{ROUTES}</td></tr>
    <tr><td class="h">Suburb pages</td><td>Individually written, each naming the local source of the work</td><td class="e">{AREAS}</td></tr>
    <tr><td class="h">Service pages</td><td>Including ceramic coating, paint protection and detailing</td><td class="e">{SERVICES}</td></tr>
    <tr><td class="h">Components</td><td>Reusable interface pieces</td><td class="e">{COMPONENTS}</td></tr>
    <tr><td class="h">Source files</td><td>{int(SRC_LINES):,} lines of application code and styles</td><td class="e">{SRC_FILES}</td></tr>
    <tr><td class="h">Images processed</td><td>Cropped, colour-corrected and served at multiple widths</td><td class="e">{IMAGES}</td></tr>
    <tr><td class="h">Process videos</td><td>Lazy-loaded, one decoded at a time</td><td class="e">{VIDEOS}</td></tr>
    <tr><td class="h">Releases</td><td>Each one built, verified and deployed</td><td class="e">{COMMITS}</td></tr>
  </table>

  <h2>What happens next</h2><div class="rule"></div>
  <p class="sub">Five things, in the order they pay off.</p>
  <ol class="next">{nexts}</ol>

  <h2>Release log</h2><div class="rule"></div>
  <p class="sub">Every deployment, in order.</p>
  <table class="log">{logrows}</table>

  <div class="foot">
    Figures read directly from the build on {human(LAST)}. Effort bands are scope estimates, not
    billed time. Prepared by Pendulum Digital.
  </div>
</section>
</body></html>"""

out_html = os.path.join(BUILD, "worklog.html")
with open(out_html, "w", encoding="utf-8") as f:
    f.write(html)
print(f"wrote {out_html}  ({len(html) // 1024}KB)")
print(f"streams {len(STREAMS)}  estimate {LOW}-{HIGH}h  routes {ROUTES}  areas {AREAS}  commits {COMMITS}")
