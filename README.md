# The Overspray Removalist — Site Archive & Rebuild Base

Full capture of the live site at **https://oversprayremovalists.com.au** taken **2 August 2026**.
This repo is the transfer base for the rebuild: everything the current site is made of, plus the
content extracted into a portable format, plus an audit of what's wrong with it.

## Repo layout

| Path | What it is |
|---|---|
| `site/` | Byte-for-byte mirror of the live site — 10 pages, 55 assets, original folder structure preserved |
| `content/` | Page copy extracted to markdown, header/footer chrome stripped — the source of truth for the rebuild |
| `AUDIT.md` | Front-end, back-end, SEO and conversion audit with severity ranking |

## What the current site is

- **Stack:** hand-coded PHP pages (no CMS), Bootstrap 3.3.7, jQuery 1.12.4, SimpleLightbox
- **Host:** Apache on shared cPanel hosting, IP `192.185.161.245` (US-based, not Australian)
- **Built by:** Pixel Design (`pixeldesignau.com`), footer copyright still reads 2021
- **Pages:** index, about, overspray-removal, cement-splatter-removals, graffiti-removals,
  environmental-damage, pricing, gallery, contact, quote
- **Forms:** `contact.php` → `response.php` (Google reCAPTCHA v2),
  `quote.php` → `response1.php` (custom image CAPTCHA — **currently returning HTTP 500**)
- **Total weight:** 4.7 MB, of which 4.1 MB is un-optimised JPG/PNG

## Assets captured

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

## Not captured (server-side, needs client access)

These run on the server and can't be pulled over HTTP. Required for a complete migration:

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
