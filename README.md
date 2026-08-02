# The Overspray Removalist — Rebuild

Rebuild of **oversprayremovalists.com.au**, on the infrastructure and design language of the
Premier Mobile Detailing build. The original site was captured on **2 August 2026** and is kept
here in full so nothing is lost in the transfer.

**The new site is in [`web/`](web/). Run it with `python -m http.server 8080` from that folder.**

## Repo layout

| Path | What it is |
|---|---|
| `web/` | **The new site.** 15 rendered pages, all assets local, ready to deploy to Vercel |
| `build/` | Generator: `build.py` emits the pages, `assets.py` processes the images |
| `site/` | Byte-for-byte mirror of the old live site, 10 pages and 55 assets, structure preserved |
| `content/` | Old page copy extracted to markdown, chrome stripped |
| `AUDIT.md` | Front-end, back-end, SEO and conversion audit of the old site, with severity ranking |

## Building

```bash
python build/assets.py    # source photos -> responsive WebP (only needed when images change)
python build/build.py     # page data -> web/**/index.html + sitemap + robots + vercel.json
cd web && python -m http.server 8080
```

Pages are generated rather than hand-copied so the header, footer, SEO tags, schema and nav stay
consistent across all 15 routes. Copy lives in `build/build.py`; editing it and re-running the
build is the whole workflow.

## What changed from the old site

Every Severity 1 and 2 item in [`AUDIT.md`](AUDIT.md) is addressed:

| Old site | New site |
|---|---|
| Quote form CAPTCHA returned HTTP 500, form uncompletable | Working quote form with drag-and-drop photo upload, inline validation, and a real send endpoint |
| No image upload, despite the pricing page asking for photos | Up to 8 photos, downscaled client-side to ~1600px before upload |
| Zero H1 tags across the whole site | One H1 per page, all 15 |
| One identical `<title>` on all 10 pages | Unique title, meta description and canonical per page |
| No Open Graph, no schema, no sitemap, no robots.txt | Full OG and Twitter cards, `AutoRepair` + `Service` + `BreadcrumbList` JSON-LD, sitemap, robots |
| 4.7 MB page weight, no modern formats | 355 KB above the fold, WebP with responsive `srcset`, lazy loading below the fold |
| 12 dead image requests per page from an unfinished template | Zero broken requests, verified across all routes |
| 48 of 79 images with missing or empty alt | Every image has descriptive alt text |
| 0 of 15 form labels bound to inputs | Every label bound, errors announced with `role="alert"` |
| jQuery 1.12.4 with known XSS CVEs, Bootstrap 3 | No framework, no third-party runtime dependencies at all |
| Zero security headers | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via `vercel.json` |
| No redirects, old `.php` URLs would 404 | 301s from every old `.php` URL to its new route |
| Volume/fleet and insurance-claims work buried mid-paragraph | Dedicated `/fleet-and-construction` and `/insurance-claims` landing pages |

## Still to do

- **Set `RESEND_API_KEY`** in Vercel so `/api/quote` can send. Without it the form shows the
  fallback message with the phone number rather than failing silently. See [`web/api/quote.js`](web/api/quote.js).
- **Add GA4 or Plausible.** Deliberately not added yet: the tracking choice is the client's, and
  the audit recommends installing it on the *old* site first to get a genuine baseline.
- **301 `overspray.com.au`** to the primary domain. It still serves byte-identical content.
- **Testimonials and reviews.** No social proof exists to publish yet, and none has been invented.
  The layout has room for a reviews section once real ones are collected.

---

# The archive (`site/`)

Everything below describes the **old** site as captured on 2 August 2026, kept for reference and
for anything still to be migrated.

## What the old site was

- **Stack:** hand-coded PHP pages (no CMS), Bootstrap 3.3.7, jQuery 1.12.4, SimpleLightbox
- **Host:** Apache on shared cPanel hosting, IP `192.185.161.245` (US-based, not Australian)
- **Built by:** Pixel Design (`pixeldesignau.com`), footer copyright still reads 2021
- **Pages:** index, about, overspray-removal, cement-splatter-removals, graffiti-removals,
  environmental-damage, pricing, gallery, contact, quote
- **Forms:** `contact.php` → `response.php` (Google reCAPTCHA v2),
  `quote.php` → `response1.php` (custom image CAPTCHA — **currently returning HTTP 500**)
- **Total weight:** 4.7 MB, of which 4.1 MB is un-optimised JPG/PNG

## Assets captured from the old site

```
site/
├── *.php               10 pages
├── css/                bootstrap.min.css, style.css, responsive.css
├── js/                 bootstrap.min.js
├── dist/               simplelightbox (css + js)
├── fonts/              glyphicons
└── images/             35 jpg · 8 png · 1 svg
    ├── gallery/        23 before/after job photos — the most valuable asset here
    ├── slider/         3 hero banners
    └── header/         phone / location / mail icons
```

The `images/gallery/` before-and-after set is the genuinely valuable material — it is proof of work
that competitors can't fabricate, and it is currently buried behind a lightbox on one page.

## Not captured from the old site (server-side)

These ran on the old server and can't be pulled over HTTP. Only needed if you want the
original form submissions or redirect rules:

- `response.php` / `response1.php` — form handlers, and wherever they send mail
- `verimages/image-verify.php` — the broken CAPTCHA generator
- `.htaccess` — redirect and bot-wall rules
- DNS, cPanel and domain registrar access for both `oversprayremovalists.com.au`
  and `overspray.com.au`

## How the capture was made

`site/` was mirrored with a crawler that walked every internal link and every asset reference
including those inside CSS. `content/` was generated from the mirror. Both are reproducible;
scripts are in the commit history of this repo's tooling notes.

One page (`contact.php`) sits behind a JavaScript cookie wall (`humans_21909`) and returns
HTTP 409 to plain clients — it was retrieved by setting that cookie. Worth noting because it
means some crawlers and link checkers cannot see that page either.
