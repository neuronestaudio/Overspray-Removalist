"""Static site generator for The Overspray Removalist.

Emits one real HTML file per route (no client-side rendering, no empty shells),
with per-page title, description, canonical, Open Graph and JSON-LD. Run:

    python build/build.py
"""
import os, re, glob, shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(ROOT, "web")
IMG_DIR = os.path.join(WEB, "assets", "images")
ICON_DIR = os.path.join(WEB, "assets", "icons")

SITE = "https://oversprayremovalists.com.au"
BRAND = "The Overspray Removalist"
PHONE_RENNY = "0412 107 464"
PHONE_ADRIANUS = "0410 939 700"
EMAIL = "info@overspray.com.au"
SUBURB = "Epping"
STATE = "VIC"
POSTCODE = "3076"

# ---------------------------------------------------------------- helpers

_icons = {}
for p in glob.glob(os.path.join(ICON_DIR, "*.svg")):
    name = os.path.splitext(os.path.basename(p))[0]
    _icons[name] = open(p, encoding="utf-8").read().strip()


def icon(name, cls=""):
    """Inline a Phosphor icon. aria-hidden: these are always beside real text."""
    svg = _icons.get(name)
    if not svg:
        raise KeyError(f"icon '{name}' not downloaded")
    svg = svg.replace("<svg ", f'<svg aria-hidden="true" focusable="false" ', 1)
    if cls:
        svg = svg.replace("<svg ", f'<svg class="{cls}" ', 1)
    return svg


_variants = {}
for p in sorted(glob.glob(os.path.join(IMG_DIR, "*.webp"))):
    base = os.path.basename(p)
    m = re.match(r"^(.*)-(\d+)\.webp$", base)
    if not m:
        continue
    _variants.setdefault(m.group(1), []).append((int(m.group(2)), base))
for k in _variants:
    _variants[k].sort()


def img(stem, alt, sizes="100vw", cls="", eager=False, ratio=None):
    """Responsive <img> with srcset, intrinsic size and explicit alt text."""
    if stem not in _variants:
        raise KeyError(f"no image variants for '{stem}'")
    vs = _variants[stem]
    largest = vs[-1][1]
    with Image.open(os.path.join(IMG_DIR, largest)) as im:
        w, h = im.size
    srcset = ", ".join(f"/assets/images/{n} {v}w" for v, n in vs)
    attrs = [
        f'src="/assets/images/{largest}"',
        f'srcset="{srcset}"',
        f'sizes="{sizes}"',
        f'width="{w}" height="{h}"',
        f'alt="{esc(alt)}"',
    ]
    if cls:
        attrs.append(f'class="{cls}"')
    attrs.append('fetchpriority="high" decoding="async"' if eager
                 else 'loading="lazy" decoding="async"')
    return "<img " + " ".join(attrs) + ">"


def src(stem, width=None):
    """Single URL for a stem, for JS-swapped images and meta tags.
    Falls back to an un-versioned file (the logo) when there are no variants."""
    vs = _variants.get(stem)
    if not vs:
        plain = f"{stem}.webp"
        if os.path.exists(os.path.join(IMG_DIR, plain)):
            return f"/assets/images/{plain}"
        raise KeyError(f"no image for '{stem}'")
    if width:
        for v, n in vs:
            if v >= width:
                return f"/assets/images/{n}"
    return f"/assets/images/{vs[-1][1]}"


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;")
             .replace(">", "&gt;").replace('"', "&quot;"))


NAV = [
    ("Services", "/services"),
    ("Gallery", "/gallery"),
    ("Pricing", "/pricing"),
    ("About", "/about"),
    ("Contact", "/contact"),
]

SERVICES = [
    ("/overspray-removal", "Paint Overspray Removal"),
    ("/cement-splatter-removal", "Cement &amp; Concrete Splatter"),
    ("/graffiti-removal", "Graffiti Removal"),
    ("/industrial-fallout", "Industrial Fallout &amp; Acid Rain"),
    ("/fleet-and-construction", "Fleet &amp; Construction Sites"),
    ("/insurance-claims", "Insurance Claims Management"),
]

# ---------------------------------------------------------------- chrome


def head(page):
    canonical = SITE + (page["path"] if page["path"] != "/" else "/")
    og_img = SITE + src(page.get("og", "job-splatter-2"), 1200)
    schema = page.get("schema", "")
    return f"""<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(page['title'])}</title>
<meta name="description" content="{esc(page['desc'])}">
<link rel="canonical" href="{canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#080b16">
<meta name="author" content="{BRAND}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:locale" content="en_AU">
<meta property="og:title" content="{esc(page['title'])}">
<meta property="og:description" content="{esc(page['desc'])}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og_img}">
<meta property="og:image:alt" content="{esc(page.get('og_alt', 'Vehicle covered in paint overspray being restored'))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(page['title'])}">
<meta name="twitter:description" content="{esc(page['desc'])}">
<meta name="twitter:image" content="{og_img}">

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/bebas-neue-400.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/dm-sans-400.woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
{schema}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""


def header(active):
    links = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{t}</a>'
        for t, h in NAV)
    drawer_links = "".join(f'<a href="{h}">{t}</a>' for t, h in NAV)
    return f"""<header class="hdr">
  <div class="shell hdr-row">
    <a class="hdr-logo" href="/" aria-label="{BRAND} home">
      <img src="{src('logo')}" alt="{BRAND}" width="260" height="125">
    </a>
    <nav class="nav" aria-label="Primary">{links}</nav>
    <div class="hdr-cta">
      <a class="hdr-call" href="tel:0412107464">{icon('phone')}{PHONE_RENNY}</a>
      <a class="btn btn-primary" href="/quote">Get a Quote</a>
    </div>
    <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">
      {icon('list')}
    </button>
  </div>
</header>

<div class="drawer" id="drawer" aria-hidden="true">
  <div class="shell drawer-top" style="padding-inline:0">
    <a class="hdr-logo" href="/"><img src="{src('logo')}" alt="{BRAND}" width="260" height="125"></a>
    <button class="burger drawer-close" type="button" aria-label="Close menu" style="display:block">{icon('x')}</button>
  </div>
  <nav aria-label="Mobile">{drawer_links}</nav>
  <a class="btn btn-primary btn-lg" href="/quote">Get a Quote</a>
  <a class="btn btn-ghost" href="tel:0412107464" style="margin-top:.6rem;justify-content:center">
    {icon('phone')}Call {PHONE_RENNY}
  </a>
</div>
"""


def footer():
    svc = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in SERVICES)
    nav = "".join(f'<li><a href="{h}">{t}</a></li>' for t, h in NAV)
    return f"""<footer class="ftr">
  <div class="shell">
    <div class="ftr-grid">
      <div>
        <div class="ftr-logo"><img src="{src('logo')}" alt="{BRAND}" width="260" height="125"></div>
        <p class="ftr-blurb">Australia's overspray and industrial fallout specialists. Over 30 years
        removing paint, cement and fallout from vehicles, fleets and property without abrasives.</p>
      </div>
      <div>
        <h5>Services</h5>
        <ul>{svc}</ul>
      </div>
      <div>
        <h5>Company</h5>
        <ul>{nav}<li><a href="/quote">Get a Quote</a></li></ul>
      </div>
      <div>
        <h5>Contact</h5>
        <ul class="ftr-contact">
          <li>{icon('phone')}<span>Renny<br><a href="tel:0412107464">{PHONE_RENNY}</a></span></li>
          <li>{icon('phone')}<span>Adrianus<br><a href="tel:0410939700">{PHONE_ADRIANUS}</a></span></li>
          <li>{icon('envelope-simple')}<a href="mailto:{EMAIL}">{EMAIL}</a></li>
          <li>{icon('map-pin')}<span>{SUBURB} {STATE} {POSTCODE}<br>Servicing Australia wide</span></li>
          <li>{icon('clock')}<span>Mon to Fri, 8:00am to 5:00pm</span></li>
        </ul>
      </div>
    </div>
    <div class="ftr-bottom">
      <span>&copy; {{year}} {BRAND}. All rights reserved.</span>
      <span><a href="/privacy">Privacy</a></span>
    </div>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
</body>
</html>
"""


def page(p, body):
    html = head(p) + header(p["path"]) + f'<main id="main">{body}</main>' + footer()
    html = html.replace("{year}", "2026")
    out = WEB if p["path"] == "/" else os.path.join(WEB, p["path"].strip("/"))
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    return len(html)


# ---------------------------------------------------------------- schema

LOCALBIZ = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "@id": "{SITE}/#business",
  "name": "{BRAND}",
  "description": "Specialist removal of paint overspray, cement splatter, graffiti and industrial fallout from vehicles, fleets, boats, aircraft and buildings. Over 30 years experience.",
  "url": "{SITE}/",
  "telephone": "+61412107464",
  "email": "{EMAIL}",
  "address": {{
    "@type": "PostalAddress",
    "addressLocality": "{SUBURB}",
    "addressRegion": "{STATE}",
    "postalCode": "{POSTCODE}",
    "addressCountry": "AU"
  }},
  "areaServed": {{ "@type": "Country", "name": "Australia" }},
  "openingHoursSpecification": [{{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "08:00", "closes": "17:00"
  }}],
  "image": "{SITE}{src('job-splatter-2', 1200)}",
  "priceRange": "$$"
}}
</script>"""


def service_schema(name, desc, path):
    return f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{esc(name)}",
  "description": "{esc(desc)}",
  "url": "{SITE}{path}",
  "provider": {{ "@id": "{SITE}/#business" }},
  "areaServed": {{ "@type": "Country", "name": "Australia" }}
}}
</script>"""


def breadcrumb(trail):
    items = "".join(
        f'{{"@type":"ListItem","position":{i+1},"name":"{esc(n)}","item":"{SITE}{h}"}}'
        + ("," if i < len(trail) - 1 else "")
        for i, (n, h) in enumerate(trail))
    return f"""<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{items}]}}
</script>"""


# ---------------------------------------------------------------- blocks


def pbanner(title, lede, trail):
    crumbs = " / ".join(
        f'<a href="{h}">{n}</a>' if i < len(trail) - 1 else f"<span>{n}</span>"
        for i, (n, h) in enumerate(trail))
    return f"""<section class="pbanner">
  <div class="shell">
    <p class="crumb">{crumbs}</p>
    <h1 class="display">{title}</h1>
    <p class="lede" style="margin-top:1rem">{lede}</p>
  </div>
</section>"""


def cta_panel(heading, body, primary=("Get a quote", "/quote")):
    return f"""<section class="band">
  <div class="shell">
    <div class="cta-panel">
      <div>
        <h2 class="display">{heading}</h2>
        <p class="body-muted">{body}</p>
      </div>
      <div class="cta-side">
        <a class="btn btn-primary btn-lg" href="{primary[1]}">{primary[0]}</a>
        <a class="btn btn-ghost btn-lg" href="tel:0412107464">{icon('phone')}Call {PHONE_RENNY}</a>
        <p style="font-size:.85rem;color:var(--muted-dim);margin-top:.2rem">
          Send photos with your enquiry and we can price most jobs the same day.</p>
      </div>
    </div>
  </div>
</section>"""


# ---------------------------------------------------------------- pages

built = []

# ---- HOME ----------------------------------------------------------------

COMPARE_JOBS = [
    dict(label="Paint overspray", before="job-tarago-before", after="job-tarago-after",
         alt_b="Toyota van covered in dark paint overspray across the driver side",
         alt_a="The same Toyota van after overspray removal, paint clean and undamaged",
         cap="Paint overspray across the full driver side. Removed by hand, no abrasives, factory paint untouched."),
    dict(label="Industrial fallout", before="job-ute-1", after="job-ute-after-1",
         alt_b="Blue Holden ute covered in industrial fallout speckling",
         alt_a="The same blue Holden ute after fallout removal, paint restored to gloss",
         cap="Industrial fallout bonded across a blue duco. Decontaminated panel by panel."),
    dict(label="Fallout on white", before="job-merc-1", after="job-merc-after",
         alt_b="White Mercedes A-Class showing heavy fallout contamination on the rear quarter",
         alt_a="The same white Mercedes A-Class after restoration, paint clean",
         cap="Fallout on white duco, where contamination shows worst. Restored without respraying."),
    dict(label="Graffiti", before="job-audi-2", after="job-audi-after",
         alt_b="Silver Audi sedan sprayed with red graffiti paint across the doors and boot",
         alt_a="The same silver Audi after graffiti removal, original paint intact",
         cap="Red aerosol graffiti over a silver Audi. Removed without damaging the clear coat."),
]


def home():
    thumbs = "".join(
        f'<button type="button" aria-pressed="{"true" if i == 0 else "false"}" '
        f'data-before="{src(j["before"], 1200)}" data-after="{src(j["after"], 1200)}" '
        f'data-alt-before="{esc(j["alt_b"])}" data-alt-after="{esc(j["alt_a"])}" '
        f'data-caption="{esc(j["cap"])}">{j["label"]}</button>'
        for i, j in enumerate(COMPARE_JOBS))
    j0 = COMPARE_JOBS[0]

    MARQUEE = [
        ("ram", "Restored white RAM pickup after overspray removal"),
        ("landcruiser", "Toyota Landcruiser ute cleaned of industrial fallout"),
        ("audi", "Audi front grille after decontamination"),
        ("challenger", "Dodge Challenger in green after paint restoration"),
        ("suv-black", "Black SUV restored to gloss after fallout removal"),
        ("wheel-a", "Alloy wheel and guard cleaned of overspray"),
        ("van-wash", "Commercial van being treated during a fallout job"),
        ("wheel-b", "Wheel arch detail after overspray removal"),
    ]
    figs = "".join(
        f'<figure>{img(s, a, sizes="(max-width:620px) 80vw, 320px")}</figure>'
        for s, a in MARQUEE)
    figs_clone = "".join(
        f'<figure>{img(s, "", sizes="(max-width:620px) 80vw, 320px")}</figure>'
        for s, _ in MARQUEE)

    body = f"""
<section class="hero">
  <div class="hero-media">
    {img('job-splatter-2', 'Black sedan covered in orange paint overspray being pressure rinsed by a technician', sizes='100vw', eager=True)}
  </div>
  <div class="shell hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">Overspray &amp; industrial fallout specialists</p>
      <h1 class="display">We take the paint off.<br><span class="hl">Not your paint.</span></h1>
      <p class="lede">Australia's only specialist in overspray and fallout removal. Thirty years,
      no abrasives, no respray, factory finish intact.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="/quote">Get a quote</a>
        <a class="btn btn-ghost btn-lg" href="tel:0412107464">{icon('phone')}Call {PHONE_RENNY}</a>
      </div>
    </div>
  </div>
</section>

<section class="stats" style="padding-block:0">
  <div class="shell">
    <div class="stat">
      <div class="stat-n"><span data-count="30" data-suffix="+">30+</span></div>
      <div class="stat-l">Years removing overspray</div>
    </div>
    <div class="stat">
      <div class="stat-n">Australia</div>
      <div class="stat-l">Wide, all suburbs, on site</div>
    </div>
    <div class="stat">
      <div class="stat-n">Zero</div>
      <div class="stat-l">Abrasives, sanding or respray</div>
    </div>
    <div class="stat">
      <div class="stat-n">Fleet</div>
      <div class="stat-l">Volume pricing for whole lots</div>
    </div>
  </div>
</section>

<section>
  <div class="shell">
    <div class="head">
      <h2 class="display">What we take off</h2>
      <p class="lede">Epoxy, urethane, polyurethane foam, soot, iron filings, cement, concrete sealers
      and spray paint. Off vehicles, trucks, boats, aircraft and buildings.</p>
    </div>
    <div class="bento">
      <a class="cell cell-wide cell-tall" href="/overspray-removal">
        <div class="cell-img">{img('svc-overspray', 'Technician removing paint overspray from a vehicle panel by hand', sizes='(max-width:1024px) 100vw, 640px')}</div>
        <h3 class="display">Paint overspray</h3>
        <p>Airborne paint can travel five hundred metres in wind. We take it off the duco, glass,
        trims and lenses without touching the finish underneath.</p>
        <span class="cell-link">See the process <span>{icon('arrow-right')}</span></span>
      </a>
      <a class="cell cell-wide" href="/cement-splatter-removal">
        <div class="cell-img">{img('svc-cement', 'Cement splatter being removed from a vehicle bonnet', sizes='(max-width:1024px) 100vw, 620px')}</div>
        <h3 class="display">Cement &amp; concrete</h3>
        <p>Slab pours throw splatter over the fence line. We handle the lime staining that follows too.</p>
        <span class="cell-link">See the process <span>{icon('arrow-right')}</span></span>
      </a>
      <a class="cell" href="/graffiti-removal">
        <div class="cell-img">{img('svc-graffiti', 'Graffiti paint being lifted from a painted surface', sizes='(max-width:1024px) 50vw, 310px')}</div>
        <h3 class="display">Graffiti</h3>
        <p>Aerosol off vehicles, plant and property.</p>
        <span class="cell-link">See the process <span>{icon('arrow-right')}</span></span>
      </a>
      <a class="cell cell-mesh" href="/industrial-fallout">
        <h3 class="display">Industrial fallout</h3>
        <p>Iron filings, soot, acid rain and chemical fallout, bonded into the clear coat.</p>
        <span class="cell-link">See the process <span>{icon('arrow-right')}</span></span>
      </a>
    </div>
  </div>
</section>

<section class="band">
  <div class="shell">
    <div class="head">
      <p class="eyebrow">Real jobs, real vehicles</p>
      <h2 class="display">Drag the handle</h2>
      <p class="lede">Every pair below is the same vehicle, photographed before and after. No respray,
      no panel work, no filler.</p>
    </div>
    <div class="compare-wrap" data-compare>
      <div class="compare" role="slider" tabindex="0"
           aria-label="Before and after comparison. Use arrow keys to reveal the restored vehicle."
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" style="--split:50%">
        <img class="before-layer" src="{src(j0['before'], 1200)}" alt="{esc(j0['alt_b'])}" loading="lazy" decoding="async">
        <img class="after-layer" src="{src(j0['after'], 1200)}" alt="{esc(j0['alt_a'])}" loading="lazy" decoding="async">
        <span class="compare-tag tag-before">Before</span>
        <span class="compare-tag tag-after">After</span>
        <div class="compare-handle"><div class="compare-knob">{icon('arrows-horizontal')}</div></div>
      </div>
      <div class="compare-thumbs" role="group" aria-label="Choose a job">{thumbs}</div>
      <p class="compare-cap">{j0['cap']}</p>
    </div>
  </div>
</section>

<section>
  <div class="shell">
    <div class="split">
      <div>
        <h2 class="display">Who calls us first</h2>
        <p class="body-muted">Most of our work arrives from the people who caused the damage or who
        carry the claim, not from the vehicle owner. We can handle the whole incident, including the
        authorisation and release forms and the public relations on your behalf.</p>
        <ul class="who">
          <li>
            <span class="who-ico">{icon('buildings')}</span>
            <div><h4>Construction &amp; concreting</h4>
            <p>Our biggest clients. Splatter travels over the site boundary onto every car parked below.</p></div>
          </li>
          <li>
            <span class="who-ico">{icon('shield-check')}</span>
            <div><h4>Insurers &amp; assessors</h4>
            <p>Restoration instead of a respray, with the paperwork managed end to end.</p></div>
          </li>
          <li>
            <span class="who-ico">{icon('truck')}</span>
            <div><h4>Fleet &amp; dealership</h4>
            <p>Volume pricing when a whole lot is affected in one location.</p></div>
          </li>
          <li>
            <span class="who-ico">{icon('car')}</span>
            <div><h4>Vehicle owners</h4>
            <p>One car, one incident. Same process, same care.</p></div>
          </li>
        </ul>
        <a class="btn btn-primary" href="/fleet-and-construction" style="margin-top:1.8rem">Fleet and site work</a>
      </div>
      <div class="split-media">
        {img('job-splatter-3', 'Technician rinsing orange overspray from the side of a black sedan', sizes='(max-width:860px) 100vw, 560px')}
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="shell">
    <div class="head">
      <h2 class="display">How a job runs</h2>
    </div>
    <div class="rail">
      <div class="step">
        <div class="step-dot">1</div>
        <h4>Send photos</h4>
        <p>Photos tell us the fallout type and how hard it has bonded. Most jobs are priced from them.</p>
      </div>
      <div class="step">
        <div class="step-dot">2</div>
        <h4>Site assessment</h4>
        <p>Heavy or full-coverage damage gets sighted and assessed in person before we commit to a price.</p>
      </div>
      <div class="step">
        <div class="step-dot">3</div>
        <h4>Removal by hand</h4>
        <p>Our own non-abrasive process. Duco, glass, trims, lenses, roof racks and accessories.</p>
      </div>
      <div class="step">
        <div class="step-dot">4</div>
        <h4>Sign off</h4>
        <p>Vehicle inspected and released. On claim work we handle authorisations and release forms.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding-bottom:clamp(3rem,6vw,5rem)">
  <div class="shell">
    <div class="head" style="margin-bottom:2rem">
      <h2 class="display">Off the tools</h2>
      <p class="lede">A sample of vehicles restored and released.
        <a href="/gallery" style="color:var(--accent-hot);font-weight:700">See the full gallery</a></p>
    </div>
  </div>
  <div class="marquee">
    <!-- the track is doubled so the loop is seamless; the clone is hidden from
         assistive tech so each photo is announced once -->
    <div class="marquee-track">{figs}<span aria-hidden="true" style="display:contents">{figs_clone}</span></div>
  </div>
</section>

{cta_panel("Got a car covered in something that should not be there?",
           "Send us photos and the location. If a whole lot of vehicles is affected in one place, "
           "tell us how many and we will price the lot.")}
"""
    built.append(page(dict(
        path="/",
        title=f"Overspray Removal Australia | Paint, Cement &amp; Fallout | {BRAND}",
        desc=("Specialist paint overspray, cement splatter, graffiti and industrial fallout removal "
              "from vehicles, fleets and property. Over 30 years, non-abrasive, Australia wide. "
              f"Call {PHONE_RENNY}."),
        og="job-splatter-2",
        og_alt="Black sedan covered in orange paint overspray being restored",
        schema=LOCALBIZ,
    ), body))


# ---- SERVICE PAGES -------------------------------------------------------

SERVICE_PAGES = [
    dict(
        path="/overspray-removal",
        nav="Paint Overspray Removal",
        h1="Paint overspray removal",
        title=f"Paint Overspray Removal | Vehicles, Fleets &amp; Property | {BRAND}",
        desc=("Non-abrasive paint overspray removal from vehicles, trucks, boats, aircraft and "
              "buildings. Epoxy, urethane and two pack. Over 30 years, Australia wide."),
        lede=("Spray painting, roller work, poor booth filtration or a wind change on an outdoor job. "
              "The paint lands on everything downwind and bonds to the clear coat."),
        hero="svc-overspray",
        hero_alt="Technician removing paint overspray from a vehicle panel by hand",
        blocks=[
            ("How far it travels",
             "<p>Paint overspray is usually caused by spray painting, but roller and brush painting "
             "cause it too, and poor filtration in a spray booth is a common factor. Most of the damage "
             "we see was accidental: outdoor work, a wind change, or high altitude work on a building. "
             "Airborne emissions can travel up to five hundred metres in windy conditions and cause "
             "widespread damage across every vehicle and surface in the path.</p>"),
            ("What we remove it from",
             "<p>Vehicles, trucks, boats, aircraft and affected buildings. On a fully covered vehicle "
             "that includes the moulds, plastics, glass, window trims, lenses, roof racks and every "
             "external accessory, not just the painted panels.</p>"
             "<ul><li>Epoxy, urethane and polyurethane</li><li>Two pack epoxy, cured with a hardener</li>"
             "<li>Spray paint and aerosol</li><li>Polyurethane foam</li></ul>"),
            ("Why the paint type changes the job",
             "<p>Different paints bond differently to a vehicle, which changes the process needed to "
             "remove them. Two pack epoxy is a very hard paint cured through adding a hardener, and it "
             "behaves nothing like a light dusting of water based paint. Light coverage that does not "
             "reach the whole vehicle is a different job again. That is why heavy or full-coverage "
             "damage is sighted and assessed before we price it.</p>"),
        ],
        pair=("job-tarago-before", "job-tarago-after",
              "Toyota van covered in dark paint overspray",
              "The same Toyota van after overspray removal"),
    ),
    dict(
        path="/cement-splatter-removal",
        nav="Cement &amp; Concrete Splatter",
        h1="Cement &amp; concrete splatter removal",
        title=f"Cement &amp; Concrete Splatter Removal from Vehicles | {BRAND}",
        desc=("Cement, concrete and lime stain removal from vehicles and property damaged by slab "
              "pours and construction work. Volume pricing for affected lots. Australia wide."),
        lede=("Slab pours throw splatter over the site boundary onto everything parked below. Left on "
              "the duco it etches, and lime staining often appears once the cement itself comes off."),
        hero="svc-cement",
        hero_alt="Cement splatter being removed from a vehicle bonnet",
        blocks=[
            ("Where it comes from",
             "<p>Our biggest clients are construction companies pouring their slabs. Concrete splatter "
             "travels over the edge of the building site and onto the vehicles below. It is rarely one "
             "car. It is usually every car on the street that morning.</p>"),
            ("Lime staining",
             "<p>Vehicles affected by cement or concrete splatter depend on many factors that determine "
             "what it takes to repair. If the car is fully covered, including moulds, plastics, glass, "
             "window trims, lenses, roof racks and external accessories, and especially if lime staining "
             "appears after the cement is removed off the duco, we can deal with that situation. Those "
             "vehicles need to be sighted and assessed.</p>"),
            ("If a whole street is affected",
             "<p>When a high volume of cars is affected in one place and we can work through the entire "
             "lot in a single location, we price the lot rather than each car. We can also handle the "
             "authorisation and release forms and the public relations on your behalf.</p>"),
        ],
        pair=None,
    ),
    dict(
        path="/graffiti-removal",
        nav="Graffiti Removal",
        h1="Graffiti removal",
        title=f"Graffiti Removal from Vehicles, Plant &amp; Property | {BRAND}",
        desc=("Aerosol graffiti removed from vehicles, plant, equipment and property without damaging "
              "the finish underneath. Non-abrasive process, over 30 years experience."),
        lede=("Aerosol on a vehicle is a paint bond like any other. The difference is it is usually "
              "deliberate, usually urgent, and usually attached to an insurance claim."),
        hero="svc-graffiti",
        hero_alt="Graffiti paint being lifted from a painted surface",
        blocks=[
            ("What we work on",
             "<p>Vehicles, trucks, plant and equipment, and affected buildings. The same non-abrasive "
             "process we use for overspray applies here: the aerosol comes off, the finish underneath "
             "stays.</p>"),
            ("Why not just respray",
             "<p>A respray means colour matching, blend panels, and a repair history on the vehicle. "
             "Removing the graffiti instead keeps the factory finish, which matters on a late model "
             "vehicle, a fleet livery or anything heading back to a lease.</p>"),
        ],
        pair=("job-audi-2", "job-audi-after",
              "Silver Audi sprayed with red graffiti across the doors",
              "The same silver Audi after graffiti removal"),
    ),
    dict(
        path="/industrial-fallout",
        nav="Industrial Fallout &amp; Acid Rain",
        h1="Industrial fallout &amp; acid rain",
        title=f"Industrial Fallout, Iron Filings &amp; Acid Rain Removal | {BRAND}",
        desc=("Removal of industrial fallout, iron filings, soot, acid rain and chemical fallout "
              "bonded into vehicle paint. Non-abrasive decontamination, Australia wide."),
        lede=("Rail dust, foundry fallout, soot and acid rain all bond into the clear coat and keep "
              "working. Most of it is invisible at ten paces and obvious under your palm."),
        hero="svc-fallout",
        hero_alt="Industrial fallout contamination across a vehicle panel",
        blocks=[
            ("What counts as fallout",
             "<p>The same principle applies to most types of fallout: acid rain, industrial fallout and "
             "chemical fallout. Each one affects vehicles differently, which is why these vehicles need "
             "to be sighted and evaluated rather than quoted blind.</p>"
             "<ul><li>Iron filings and rail dust</li><li>Soot and carbon</li>"
             "<li>Acid rain etching</li><li>Chemical and industrial fallout</li></ul>"),
            ("Why it gets worse",
             "<p>Metallic fallout keeps oxidising once it is embedded. What starts as a rough feel "
             "across the duco becomes a rust-coloured speckle, and then a permanent etch into the "
             "clear coat. Early removal is the difference between decontamination and a respray.</p>"),
        ],
        pair=("job-ute-1", "job-ute-after-1",
              "Blue Holden ute covered in industrial fallout",
              "The same blue Holden ute after fallout removal"),
    ),
    dict(
        path="/fleet-and-construction",
        nav="Fleet &amp; Construction Sites",
        h1="Fleet &amp; construction site work",
        title=f"Fleet &amp; Construction Site Overspray Damage | Volume Pricing | {BRAND}",
        desc=("Whole-lot overspray and cement splatter remediation for construction sites, fleets and "
              "dealerships. Volume pricing, on site, with authorisation and release forms handled."),
        lede=("When one incident hits fifty cars, you do not need fifty quotes. You need one number, "
              "one crew and one set of paperwork."),
        hero="job-splatter-1",
        hero_alt="Multiple vehicles affected by paint overspray at a work site",
        blocks=[
            ("One price for the lot",
             "<p>If a high volume of cars is affected in one place, and we can work on the entire lot in "
             "the one location, we give a price on a volume lot rather than pricing car by car. That is "
             "the difference between a manageable remediation and an unbounded claim.</p>"),
            ("We come to the site",
             "<p>We work on site, across all suburbs and Australia wide. Vehicles do not need to be "
             "driven to a workshop, which matters when the affected cars belong to residents, staff or "
             "customers who did not ask to be involved.</p>"),
            ("The paperwork and the public relations",
             "<p>We offer a service which includes the authorisation and release forms, and we handle "
             "the public relations on your behalf. On a street full of affected vehicle owners, that "
             "part is often harder than the removal.</p>"),
        ],
        pair=None,
    ),
    dict(
        path="/insurance-claims",
        nav="Insurance Claims Management",
        h1="Insurance claims management",
        title=f"Overspray Insurance Claims Management &amp; Assessment | {BRAND}",
        desc=("Overspray and fallout claims handled end to end: assessment, restoration instead of "
              "respray, authorisation and release forms, and owner liaison. Over 30 years."),
        lede=("We have been doing overspray claims for thirty years. Restoration keeps the factory "
              "finish and keeps the claim smaller than a respray."),
        hero="workshop",
        hero_alt="Vehicle being assessed in the workshop before restoration",
        blocks=[
            ("Assessment first",
             "<p>Photos give us the fallout type and how hard it has bonded, which is enough to price "
             "most jobs. Where the vehicle is fully covered, including moulds, plastics, glass, trims, "
             "lenses and accessories, it is sighted and assessed before a figure is committed.</p>"),
            ("Restoration instead of respray",
             "<p>Removing the contamination keeps the original factory paint. There is no colour match, "
             "no blend panel and no repair history attached to the vehicle. On late model and fleet "
             "vehicles that difference carries real value at resale or lease return.</p>"),
            ("Forms and owner liaison",
             "<p>We can offer a service which includes authorisation and release forms and handle the "
             "public relations on your behalf, which keeps the affected owners informed and keeps the "
             "claim moving.</p>"),
        ],
        pair=("job-merc-1", "job-merc-after",
              "White Mercedes A-Class with heavy fallout contamination",
              "The same white Mercedes A-Class after restoration"),
    ),
]


def service_page(s):
    blocks = "".join(f"<h3 class='display'>{t}</h3>{b}" for t, b in s["blocks"])
    pair_html = ""
    if s["pair"]:
        b, a, ab, aa = s["pair"]
        pair_html = f"""
<section class="band">
  <div class="shell">
    <div class="head"><h2 class="display">Same vehicle, both frames</h2></div>
    <div class="compare-wrap" data-compare>
      <div class="compare" role="slider" tabindex="0"
           aria-label="Before and after comparison. Use arrow keys to reveal the restored vehicle."
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" style="--split:50%">
        <img class="before-layer" src="{src(b, 1200)}" alt="{esc(ab)}" loading="lazy" decoding="async">
        <img class="after-layer" src="{src(a, 1200)}" alt="{esc(aa)}" loading="lazy" decoding="async">
        <span class="compare-tag tag-before">Before</span>
        <span class="compare-tag tag-after">After</span>
        <div class="compare-handle"><div class="compare-knob">{icon('arrows-horizontal')}</div></div>
      </div>
    </div>
  </div>
</section>"""

    others = "".join(
        f'<li><a href="{h}">{t}</a></li>' for h, t in SERVICES if h != s["path"])

    body = f"""
{pbanner(s['h1'], s['lede'], [("Home", "/"), ("Services", "/services"), (re.sub('&amp;', '&', s['nav']), s['path'])])}

<section style="padding-top:0">
  <div class="shell">
    <div class="split">
      <div class="prose">{blocks}</div>
      <div class="split-media">
        {img(s['hero'], s['hero_alt'], sizes="(max-width:860px) 100vw, 560px")}
      </div>
    </div>
  </div>
</section>

{pair_html}

<section>
  <div class="shell">
    <div class="head" style="margin-bottom:1.4rem"><h2 class="display">Other services</h2></div>
    <ul class="who" style="margin-top:0;max-width:44rem">{"".join(
        f'<li><span class="who-ico">{icon("drop")}</span><div><h4><a href="{h}">{t}</a></h4></div></li>'
        for h, t in SERVICES if h != s["path"])}</ul>
  </div>
</section>

{cta_panel("Send photos, get a price",
           "Photos tell us the fallout type and how hard it has bonded. That is usually enough to "
           "quote. Heavy or full-coverage jobs get sighted first.")}
"""
    built.append(page(dict(
        path=s["path"],
        title=s["title"],
        desc=s["desc"],
        og=s["hero"],
        og_alt=s["hero_alt"],
        schema=service_schema(re.sub("&amp;", "&", s["nav"]), s["desc"], s["path"])
                + breadcrumb([("Home", "/"), ("Services", "/services"),
                              (re.sub("&amp;", "&", s["nav"]), s["path"])]),
    ), body))


# ---- SERVICES INDEX ------------------------------------------------------

def services_index():
    cards = ""
    meta = {
        "/overspray-removal": ("svc-overspray", "Technician removing paint overspray by hand",
                               "Epoxy, urethane, two pack and aerosol, off duco, glass, trims and lenses."),
        "/cement-splatter-removal": ("svc-cement", "Cement splatter on a vehicle bonnet",
                                     "Slab pour splatter and the lime staining that follows it."),
        "/graffiti-removal": ("svc-graffiti", "Graffiti being lifted from a painted surface",
                              "Aerosol off vehicles, plant, equipment and property."),
        "/industrial-fallout": ("svc-fallout", "Industrial fallout across a vehicle panel",
                                "Iron filings, soot, acid rain and chemical fallout."),
        "/fleet-and-construction": ("job-splatter-1", "Multiple vehicles affected at a work site",
                                    "Whole-lot pricing, on site, with the paperwork handled."),
        "/insurance-claims": ("workshop", "Vehicle assessed in the workshop",
                              "Assessment, restoration instead of respray, forms and owner liaison."),
    }
    for i, (h, t) in enumerate(SERVICES):
        stem, alt, blurb = meta[h]
        wide = " cell-wide" if i in (0, 3) else ""
        cards += f"""<a class="cell{wide}" href="{h}">
        <div class="cell-img">{img(stem, alt, sizes='(max-width:620px) 100vw, 50vw')}</div>
        <h3 class="display">{t}</h3><p>{blurb}</p>
        <span class="cell-link">Read more <span>{icon('arrow-right')}</span></span></a>"""

    body = f"""
{pbanner("Services",
         "One trade, done properly: taking contamination off a finish without damaging what is "
         "underneath. We are the only company in Australia that focuses solely on overspray and "
         "fallout removal.",
         [("Home", "/"), ("Services", "/services")])}

<section style="padding-top:0">
  <div class="shell">
    <div class="bento">{cards}</div>
  </div>
</section>

{cta_panel("Not sure which one it is?",
           "Send photos. Half the enquiries we get are described as one thing and turn out to be "
           "another, and the photos settle it in a minute.")}
"""
    built.append(page(dict(
        path="/services",
        title=f"Services | Overspray, Cement, Graffiti &amp; Fallout Removal | {BRAND}",
        desc=("Paint overspray, cement splatter, graffiti, industrial fallout, fleet and construction "
              "site remediation, and insurance claims management. Australia wide, over 30 years."),
        og="svc-overspray",
        og_alt="Technician removing paint overspray by hand",
        schema=breadcrumb([("Home", "/"), ("Services", "/services")]),
    ), body))


# ---- GALLERY -------------------------------------------------------------

GALLERY = [
    ("job-splatter-1", "Black sedan covered in orange paint overspray before removal"),
    ("job-splatter-2", "Orange overspray being rinsed from the roof and boot of a black sedan"),
    ("job-splatter-3", "Orange overspray down the side of a black sedan before treatment"),
    ("job-splatter-after", "The sedan after full overspray removal"),
    ("job-tarago-before", "Toyota van covered in dark paint overspray along the driver side"),
    ("job-tarago-after", "The same Toyota van restored, paint clean and undamaged"),
    ("job-ute-1", "Blue Holden ute showing industrial fallout across the panels"),
    ("job-ute-2", "Rear of the blue Holden ute with fallout contamination"),
    ("job-ute-3", "Blue Holden ute in the yard before decontamination"),
    ("job-ute-4", "Fallout detail across the ute tray and tailgate"),
    ("job-ute-after-1", "The blue Holden ute after fallout removal, gloss restored"),
    ("job-ute-after-2", "Second angle of the restored blue Holden ute"),
    ("job-merc-1", "White Mercedes A-Class with heavy fallout on the rear quarter"),
    ("job-merc-2", "Fallout detail across the Mercedes tail light and panel"),
    ("job-merc-after", "The white Mercedes A-Class after restoration"),
    ("job-audi-1", "Red graffiti sprayed across the boot of a silver Audi"),
    ("job-audi-2", "Red graffiti along the side of the silver Audi"),
    ("job-audi-after", "The silver Audi after graffiti removal, original paint intact"),
    ("ram", "Restored white RAM pickup after overspray removal"),
    ("landcruiser", "Toyota Landcruiser ute cleaned of industrial fallout"),
    ("challenger", "Dodge Challenger in green after paint restoration"),
    ("suv-black", "Black SUV restored to gloss after fallout removal"),
    ("audi", "Audi front grille after decontamination"),
    ("wheel-a", "Alloy wheel and guard cleaned of overspray"),
    ("wheel-b", "Wheel arch detail after overspray removal"),
    ("van-wash", "Commercial van being treated during a fallout job"),
]


def gallery():
    figs = "".join(
        f'<figure>{img(s, a, sizes="(max-width:620px) 100vw, (max-width:1024px) 50vw, 400px")}'
        f'<figcaption>{a}</figcaption></figure>'
        for s, a in GALLERY)
    body = f"""
{pbanner("Gallery",
         "Real jobs, photographed on the day. Where a before and an after appear together, it is the "
         "same vehicle in both frames.",
         [("Home", "/"), ("Gallery", "/gallery")])}
<section style="padding-top:0">
  <div class="shell"><div class="gal">{figs}</div></div>
</section>
{cta_panel("Yours will look like the second frame",
           "Send photos of the damage and where the vehicle is. We work on site, Australia wide.")}
"""
    built.append(page(dict(
        path="/gallery",
        title=f"Gallery | Before &amp; After Overspray Removal | {BRAND}",
        desc=("Before and after photographs of real overspray, cement splatter, graffiti and "
              "industrial fallout jobs on vehicles restored without respraying."),
        og="job-tarago-before",
        og_alt="Toyota van covered in paint overspray before restoration",
        schema=breadcrumb([("Home", "/"), ("Gallery", "/gallery")]),
    ), body))


# ---- PRICING -------------------------------------------------------------

def pricing():
    body = f"""
{pbanner("Pricing",
         "The best way to price a problem is to view the vehicle, but we can give estimates over the "
         "phone. Emailing images gives us a much better understanding of the problem and the type of "
         "fallout it is.",
         [("Home", "/"), ("Pricing", "/pricing")])}

<section style="padding-top:0">
  <div class="shell">
    <div class="prose">
      <h3 class="display">Paint overspray</h3>
      <p>Quoting an overspray issue depends on many factors that determine the price to repair the
      problem. In some cases the paint is very light and does not cover the entire vehicle, and that
      may cost <strong>from $600</strong>.</p>
      <p>Different types of paint bond differently to the vehicle, which can change the process needed
      to remove the overspray. Two pack epoxy is a very hard paint, cured through adding a hardener. If
      the car is fully covered, including the moulds, plastics, glass, window trims, lenses, roof racks
      and all external accessories, the vehicle has to be sighted and assessed.</p>

      <div class="pricing-note">
        <strong>Whole lots.</strong> If a high volume of cars is affected in one place and we can work
        on the entire lot in the one location, we price the lot rather than each vehicle. We can also
        include the authorisation and release forms and handle the public relations on your behalf.
      </div>

      <h3 class="display">Cement splatter</h3>
      <p>Vehicles affected by cement or concrete splatter depend on many different factors that
      determine the price to repair the problem. If the car is fully covered, including the moulds,
      plastics, glass, window trims, lenses, roof racks and all external accessories, and especially if
      lime staining occurs after the cement is removed off the duco, we can deal with the situation.
      Those vehicles need to be sighted and assessed.</p>
      <p>Our biggest clients are construction companies pouring their slabs, where concrete splatter
      travels over the edge of the building site onto the vehicles below.</p>

      <h3 class="display">Other types of fallout</h3>
      <p>The same applies to most types of fallout: acid rain, industrial fallout and chemical fallout.
      All of these problems affect vehicles differently, and those vehicles need to be sighted and
      evaluated.</p>

      <h3 class="display">What makes a quote fast</h3>
      <ul>
        <li>Photos of the affected panels, taken in daylight</li>
        <li>What the contamination is, if you know, and roughly when it happened</li>
        <li>Where the vehicle is, and whether it can be worked on where it sits</li>
        <li>How many vehicles are affected in the same location</li>
      </ul>
    </div>
  </div>
</section>

{cta_panel("Send photos and get a real number",
           "Photos are the fastest path to an accurate price. The quote form takes them directly.")}
"""
    built.append(page(dict(
        path="/pricing",
        title=f"Overspray Removal Pricing &amp; Estimates | From $600 | {BRAND}",
        desc=("How overspray, cement splatter and fallout removal is priced. Light overspray from "
              "$600. Volume pricing for whole lots. Send photos for a fast, accurate estimate."),
        og="workshop",
        og_alt="Vehicle assessed in the workshop before restoration",
        schema=breadcrumb([("Home", "/"), ("Pricing", "/pricing")]),
    ), body))


# ---- ABOUT ---------------------------------------------------------------

def about():
    body = f"""
{pbanner("About us",
         "For over thirty years, The Overspray Removalist has been Australia's overspray removal and "
         "claims management specialist.",
         [("Home", "/"), ("About", "/about")])}

<section style="padding-top:0">
  <div class="shell">
    <div class="split">
      <div class="prose">
        <h3 class="display">One trade, done properly</h3>
        <p>We are the only company in Australia that focuses and specialises solely on overspray and
        fallout removal. Not detailing with overspray on the side. Not panel work. This, and only
        this, for over thirty years.</p>
        <p>We have developed a unique overspray removal process that no other company provides. Our
        non-abrasive methods, used by hand, are the safest way to remove overspray debris from
        vehicles, trucks, boats, aircraft and affected buildings.</p>

        <h3 class="display">What we have taken off</h3>
        <p>Epoxy, urethane, polyurethane foam, soot, iron filings, industrial fallout, graffiti,
        cement, concrete sealers, cement and concrete splatters, and spray paint, to name a few. We
        remove all of these without causing damage to your property.</p>

        <h3 class="display">Claims and incidents</h3>
        <p>Alongside the removal itself we handle overspray claims management, including authorisation
        and release forms and the public relations on your behalf. When one incident affects a whole
        street or a whole lot, that side of the job matters as much as the process.</p>
      </div>
      <div class="split-media">
        {img('workshop', 'The Overspray Removalist workshop with a vehicle under assessment', sizes='(max-width:860px) 100vw, 560px')}
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="shell">
    <div class="head"><h2 class="display">Where we work</h2>
    <p class="lede">Based in {SUBURB} {STATE} {POSTCODE}, working across all suburbs and Australia wide.
    We come to the vehicles, which matters when they belong to residents, staff or customers who did
    not ask to be involved.</p></div>
    <div class="rail">
      <div class="step"><div class="step-dot">{icon('map-pin')}</div><h4>On site</h4>
        <p>We work where the vehicles are, including active construction sites and car parks.</p></div>
      <div class="step"><div class="step-dot">{icon('truck')}</div><h4>Whole lots</h4>
        <p>Volume pricing when many vehicles are affected in one location.</p></div>
      <div class="step"><div class="step-dot">{icon('shield-check')}</div><h4>Claims</h4>
        <p>Authorisation and release forms, and owner liaison, handled on your behalf.</p></div>
      <div class="step"><div class="step-dot">{icon('clock')}</div><h4>Mon to Fri</h4>
        <p>8:00am to 5:00pm. For an active incident, call and we will work out the timing.</p></div>
    </div>
  </div>
</section>

{cta_panel("Thirty years of this exact problem",
           "If something has landed on a vehicle that should not be there, we have almost certainly "
           "taken it off before.")}
"""
    built.append(page(dict(
        path="/about",
        title=f"About | Australia's Overspray Removal Specialists | {BRAND}",
        desc=("Over 30 years specialising solely in overspray and industrial fallout removal. A "
              "unique non-abrasive process, plus full overspray claims management. Based in Epping VIC."),
        og="workshop",
        og_alt="The Overspray Removalist workshop",
        schema=breadcrumb([("Home", "/"), ("About", "/about")]),
    ), body))


# ---- QUOTE ---------------------------------------------------------------

def quote():
    opts = "".join(f'<option value="{re.sub("&amp;", "&", t)}">{t}</option>' for _, t in SERVICES)
    body = f"""
{pbanner("Get a quote",
         "Photos are the fastest path to an accurate price. Attach them below and we will come back "
         "with a number or a time to come and look.",
         [("Home", "/"), ("Get a quote", "/quote")])}

<section style="padding-top:0">
  <div class="shell">
    <div class="split" style="align-items:start">
      <form id="quote-form" action="/api/quote" method="post" enctype="multipart/form-data" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="name">Your name <span class="req" aria-hidden="true">*</span></label>
            <input id="name" name="name" type="text" autocomplete="name" required aria-describedby="name-err">
            <p class="field-err" id="name-err" role="alert"></p>
          </div>
          <div class="field">
            <label for="phone">Contact number <span class="req" aria-hidden="true">*</span></label>
            <input id="phone" name="phone" type="tel" autocomplete="tel" required aria-describedby="phone-err">
            <p class="field-err" id="phone-err" role="alert"></p>
          </div>
          <div class="field">
            <label for="email">Email <span class="req" aria-hidden="true">*</span></label>
            <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-err">
            <p class="field-err" id="email-err" role="alert"></p>
          </div>
          <div class="field">
            <label for="service">What happened</label>
            <select id="service" name="service">
              <option value="">Not sure yet</option>{opts}
            </select>
          </div>
          <div class="field wide">
            <label for="location">Where is the vehicle <span class="hint">Suburb is enough</span></label>
            <input id="location" name="location" type="text" autocomplete="address-level2"
                   placeholder="Suburb, or the site address">
          </div>
          <div class="field">
            <label for="vehicles">How many vehicles affected</label>
            <input id="vehicles" name="vehicles" type="number" min="1" step="1" value="1">
          </div>
          <div class="field">
            <label for="vehicle">Vehicle <span class="hint">Make and model</span></label>
            <input id="vehicle" name="vehicle" type="text" placeholder="e.g. Toyota Hilux, white">
          </div>
          <div class="field wide">
            <label for="message">Tell us about it <span class="req" aria-hidden="true">*</span></label>
            <textarea id="message" name="message" required aria-describedby="message-err"
              placeholder="What landed on it, roughly when, and whether it can be worked on where it sits."></textarea>
            <p class="field-err" id="message-err" role="alert"></p>
          </div>
          <div class="field wide">
            <label for="photos">Photos of the damage <span class="hint">Up to 8 images, 10MB each</span></label>
            <div class="drop" tabindex="0" role="button" aria-controls="photos"
                 aria-label="Add photos. Click to browse, or drag images here.">
              {icon('upload-simple')}
              <p class="drop-title">Drag photos here, or click to browse</p>
              <p class="drop-sub">Daylight shots of the affected panels tell us the most</p>
              <input id="photos" name="photos" type="file" accept="image/*" multiple>
            </div>
            <div class="thumbs" aria-live="polite"></div>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" type="submit" style="margin-top:1.5rem;width:100%">
          Send my quote request
        </button>
        <p class="form-status" role="status" aria-live="polite"></p>
        <p class="form-note">We use your details to quote this job and nothing else.
        Prefer to talk? Call <a href="tel:0412107464" style="color:var(--accent-hot)">{PHONE_RENNY}</a>.</p>
      </form>

      <aside>
        <div class="split-media">
          {img('job-splatter-2', 'Orange overspray being rinsed from a black sedan', sizes='(max-width:860px) 100vw, 520px')}
        </div>
        <div class="pricing-note" style="margin-top:1.5rem">
          <strong>Whole lot affected?</strong>
          <p class="body-muted" style="margin-top:.5rem;font-size:.93rem">Tell us how many vehicles and
          where they are. If we can work through the lot in one location we price the lot, not each car,
          and we can handle the authorisation and release forms.</p>
        </div>
        <ul class="who" style="margin-top:1.5rem">
          <li><span class="who-ico">{icon('check-circle')}</span><div>
            <h4>No abrasives</h4><p>Removal by hand. The factory finish stays on the car.</p></div></li>
          <li><span class="who-ico">{icon('check-circle')}</span><div>
            <h4>We come to you</h4><p>On site, all suburbs, Australia wide.</p></div></li>
          <li><span class="who-ico">{icon('check-circle')}</span><div>
            <h4>Thirty years</h4><p>Overspray and fallout only. It is the whole business.</p></div></li>
        </ul>
      </aside>
    </div>
  </div>
</section>
"""
    built.append(page(dict(
        path="/quote",
        title=f"Get a Quote | Send Photos for a Fast Estimate | {BRAND}",
        desc=("Request an overspray, cement splatter, graffiti or fallout removal quote. Attach photos "
              "of the damage for a fast, accurate estimate. Australia wide, volume pricing available."),
        og="job-splatter-2",
        og_alt="Overspray being removed from a black sedan",
        schema=breadcrumb([("Home", "/"), ("Get a quote", "/quote")]),
    ), body))


# ---- CONTACT -------------------------------------------------------------

def contact():
    body = f"""
{pbanner("Contact",
         "Two of us take the calls. If one does not pick up, try the other, or send photos through the "
         "quote form and we will come back to you.",
         [("Home", "/"), ("Contact", "/contact")])}

<section style="padding-top:0">
  <div class="shell">
    <div class="split" style="align-items:start">
      <div>
        <ul class="who" style="margin-top:0">
          <li><span class="who-ico">{icon('phone')}</span><div>
            <h4>Renny</h4><p><a href="tel:0412107464" style="color:var(--accent-hot);font-weight:700">{PHONE_RENNY}</a></p></div></li>
          <li><span class="who-ico">{icon('phone')}</span><div>
            <h4>Adrianus</h4><p><a href="tel:0410939700" style="color:var(--accent-hot);font-weight:700">{PHONE_ADRIANUS}</a></p></div></li>
          <li><span class="who-ico">{icon('envelope-simple')}</span><div>
            <h4>Email</h4><p><a href="mailto:{EMAIL}" style="color:var(--accent-hot);font-weight:700">{EMAIL}</a></p></div></li>
          <li><span class="who-ico">{icon('map-pin')}</span><div>
            <h4>Based in</h4><p>{SUBURB} {STATE} {POSTCODE}. We work on site across all suburbs and Australia wide.</p></div></li>
          <li><span class="who-ico">{icon('clock')}</span><div>
            <h4>Hours</h4><p>Monday to Friday, 8:00am to 5:00pm.</p></div></li>
        </ul>
        <a class="btn btn-primary btn-lg" href="/quote" style="margin-top:1.8rem">Send photos and get a quote</a>
      </div>
      <div>
        <div class="split-media" style="aspect-ratio:4/3">
          <iframe
            title="Map showing The Overspray Removalist service base in {SUBURB} {STATE} {POSTCODE}"
            src="https://www.google.com/maps?q={SUBURB}+{STATE}+{POSTCODE}+Australia&output=embed"
            width="100%" height="100%" style="border:0;display:block;min-height:340px"
            loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <p class="form-note">We are a mobile operation, so the workshop is a base rather than a
        showroom. For a job, tell us where the vehicles are and we come to them.</p>
      </div>
    </div>
  </div>
</section>
"""
    built.append(page(dict(
        path="/contact",
        title=f"Contact | Overspray &amp; Fallout Removal, Epping VIC | {BRAND}",
        desc=(f"Call Renny on {PHONE_RENNY} or Adrianus on {PHONE_ADRIANUS}, or email {EMAIL}. "
              "Based in Epping VIC, working on site across Australia. Mon to Fri, 8am to 5pm."),
        og="workshop",
        og_alt="The Overspray Removalist workshop",
        schema=LOCALBIZ + breadcrumb([("Home", "/"), ("Contact", "/contact")]),
    ), body))


# ---- THANK YOU + PRIVACY -------------------------------------------------

def thankyou():
    body = f"""
<section class="pbanner" style="min-height:62dvh;display:flex;align-items:center">
  <div class="shell" style="text-align:left;max-width:46rem">
    <p class="eyebrow">Request received</p>
    <h1 class="display" style="margin:.8rem 0 1rem">Thanks. We have got it.</h1>
    <p class="lede">We will come back to you with a price or a time to come and look. If it is urgent,
    call Renny on <a href="tel:0412107464" style="color:var(--accent-hot);font-weight:700">{PHONE_RENNY}</a>.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="/gallery">See recent jobs</a>
      <a class="btn btn-ghost btn-lg" href="/">Back to home</a>
    </div>
  </div>
</section>
"""
    built.append(page(dict(
        path="/thank-you",
        title=f"Quote request received | {BRAND}",
        desc="Your quote request has been received. We will respond with a price or an assessment time.",
        schema='<meta name="robots" content="noindex, follow">',
    ), body))


def privacy():
    body = f"""
{pbanner("Privacy", "How we handle the information you send us.", [("Home", "/"), ("Privacy", "/privacy")])}
<section style="padding-top:0"><div class="shell"><div class="prose">
<h3 class="display">What we collect</h3>
<p>When you submit the quote or contact form we collect your name, contact number, email, the location
of the vehicle, the details you give us about the damage, and any photos you attach.</p>
<h3 class="display">What we do with it</h3>
<p>We use it to quote and carry out the work you have asked about, and to contact you regarding that
job. Where a job forms part of an insurance claim, the relevant details may be shared with the insurer
or assessor handling that claim.</p>
<h3 class="display">What we do not do with it</h3>
<p>We do not sell your information, and we do not pass it to third parties for marketing.</p>
<h3 class="display">Photos</h3>
<p>Photos you send are used to quote and complete the job. We may use before and after photographs of
completed work in our gallery. If you would prefer we did not, tell us and we will not.</p>
<h3 class="display">Getting in touch</h3>
<p>To ask what we hold, or to have it removed, email
<a href="mailto:{EMAIL}" style="color:var(--accent-hot)">{EMAIL}</a> or call {PHONE_RENNY}.</p>
</div></div></section>
"""
    built.append(page(dict(
        path="/privacy",
        title=f"Privacy | {BRAND}",
        desc="How The Overspray Removalist collects, uses and stores the information you send us.",
        schema='<meta name="robots" content="noindex, follow">',
    ), body))


# ---------------------------------------------------------------- run

home()
services_index()
for s in SERVICE_PAGES:
    service_page(s)
gallery()
pricing()
about()
quote()
contact()
thankyou()
privacy()

# ---- sitemap / robots / vercel -------------------------------------------

ROUTES = ["/", "/services"] + [s["path"] for s in SERVICE_PAGES] + \
         ["/gallery", "/pricing", "/about", "/quote", "/contact"]
PRIORITY = {"/": "1.0", "/quote": "0.9", "/services": "0.8"}

urls = "".join(
    f"  <url><loc>{SITE}{r}</loc><changefreq>monthly</changefreq>"
    f"<priority>{PRIORITY.get(r, '0.7')}</priority></url>\n" for r in ROUTES)
with open(os.path.join(WEB, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + urls + "</urlset>\n")

with open(os.path.join(WEB, "robots.txt"), "w", encoding="utf-8") as f:
    f.write(f"User-agent: *\nAllow: /\nDisallow: /thank-you\n\nSitemap: {SITE}/sitemap.xml\n")

VERCEL = """{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/index.php", "destination": "/", "permanent": true },
    { "source": "/about.php", "destination": "/about", "permanent": true },
    { "source": "/overspray-removal.php", "destination": "/overspray-removal", "permanent": true },
    { "source": "/cement-splatter-removals.php", "destination": "/cement-splatter-removal", "permanent": true },
    { "source": "/graffiti-removals.php", "destination": "/graffiti-removal", "permanent": true },
    { "source": "/environmental-damage.php", "destination": "/industrial-fallout", "permanent": true },
    { "source": "/pricing.php", "destination": "/pricing", "permanent": true },
    { "source": "/gallery.php", "destination": "/gallery", "permanent": true },
    { "source": "/contact.php", "destination": "/contact", "permanent": true },
    { "source": "/quote.php", "destination": "/quote", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
"""
with open(os.path.join(WEB, "vercel.json"), "w", encoding="utf-8") as f:
    f.write(VERCEL)

fav = os.path.join(ROOT, "site", "favicon.ico")
if os.path.exists(fav):
    shutil.copy(fav, os.path.join(WEB, "favicon.ico"))

print(f"built {len(built)} pages, {sum(built)//1024} KB of HTML")
for r in ROUTES:
    print("  ", r)
print("  /thank-you  /privacy  (noindex)")
