# The Overspray Removalist — Website Audit

**Site:** https://oversprayremovalists.com.au
**Audited:** 2 August 2026
**Method:** full crawl of all 10 pages and 55 assets, HTTP header inspection, endpoint probing,
source review. Passive only — no forms were submitted, no intrusive testing performed.

---

## The one-line version

The business has genuine authority — 30 years, a specialist process, real before/after proof, and
strong B2B work in construction and insurance claims. The website converts almost none of it. The
primary quote form is broken, nothing on the site is measured, and the site is close to invisible
to search. This is not a design problem. It is a lead-capture problem.

---

## Severity 1 — Actively losing money right now

### 1.1 The quote form cannot be submitted

`quote.php` is the destination of the site's most prominent CTA — the red **GET A QUOTE NOW**
button in the header of every page. The form has a mandatory field:

> `Enter code*:` with `<img src="verimages/image-verify.php">`

That endpoint returns **HTTP 500 Internal Server Error** with a zero-byte body. The CAPTCHA image
never renders. There is no code for a visitor to read, and the field is marked mandatory.

Every person who clicks the site's main call to action lands on a form they cannot complete.

```
GET /verimages/image-verify.php  →  500 Internal Server Error, Content-Length: 0
```

This is the single highest-value fix on the site and it is also the cheapest.

### 1.2 Nothing is measured — at all

No Google Analytics, no Google Tag Manager, no Meta Pixel, no call tracking, no conversion events.
Checked across all 10 pages: zero tracking of any kind.

Consequences:

- No one knows how many people visit, what they look at, or where they leave
- No one knows the quote form is broken, or for how long it has been
- Paid advertising cannot be run profitably — there is no conversion signal to optimise against
- There is no baseline, which means no rebuild can be proven to have worked

### 1.3 Two identical websites competing with each other

`overspray.com.au` serves **byte-identical content** to `oversprayremovalists.com.au` — same MD5
hash, same server IP (`192.185.161.245`). Neither redirects to the other. Neither has a canonical
tag. Google is being shown two copies of the same site and asked to choose.

The result is split ranking authority and diluted backlink value. Compounding it: the email address
used everywhere on the site is `info@overspray.com.au` — the *other* domain — so the brand's
contact identity and its web presence point at different places.

---

## Severity 2 — Structurally blocking growth

### 2.1 The site is effectively invisible to search

For a local-and-national service business, the on-page SEO is not weak — it is absent.

| Check | All 10 pages |
|---|---|
| Unique `<title>` | ✗ — every page is `The Overspray Removalist` |
| Meta description | ✗ — zero |
| `<h1>` heading | ✗ — **zero H1 tags on the entire site** |
| Canonical tag | ✗ — zero |
| Open Graph / social cards | ✗ — zero |
| `robots.txt` | ✗ — 404 |
| `sitemap.xml` | ✗ — 404 |
| Schema.org LocalBusiness / Service | ✗ — zero |

Ten pages sharing one title tag means Google has no way to tell the cement splatter page from the
graffiti page from the pricing page. Sharing a link on Facebook or LinkedIn produces a bare grey
box with no image, title or description.

### 2.2 The content is too thin to rank

**1,836 words across the entire site** — an average of 183 per page.

| Page | Words |
|---|---|
| index | 408 |
| pricing | 352 |
| overspray-removal | 273 |
| cement-splatter-removals | 240 |
| graffiti-removals | 197 |
| environmental-damage | 188 |
| about | 99 |
| gallery | 57 |
| quote | 14 |
| contact | **8** |

Service pages at 200–270 words will not compete for "overspray removal Melbourne" or any
suburb-qualified variant. The contact page has eight words on it.

The copy that does exist is good — it is written by someone who clearly knows the trade. There just
isn't enough of it, and none of it is structured for search.

### 2.3 No content management

Every page is hand-coded PHP. There is no CMS, no admin login, no way for the business to change a
price, add a gallery photo, or update an opening hour without paying a developer to edit raw HTML.

This is why the footer still reads **"Copyright © 2021"** — the site reads as abandoned to any
visitor who scrolls to the bottom.

---

## Severity 3 — Technical debt and risk

### 3.1 End-of-life front-end stack

| Library | Version | Status |
|---|---|---|
| Bootstrap | 3.3.7 | End of life since 2019 |
| jQuery | 1.12.4 | Released 2016 — **known XSS vulnerabilities** (CVE-2020-11022, CVE-2020-11023, both affect < 3.5.0) |
| Font Awesome | 4.5.0 | Superseded, served from the deprecated MaxCDN endpoint |

All three load from third-party CDNs with **no Subresource Integrity hashes** — if any of those
CDNs is compromised, arbitrary JavaScript executes on the site with no protection.

### 3.2 Zero security headers

Every one of the standard protective headers is absent:

```
MISSING  Strict-Transport-Security     MISSING  Referrer-Policy
MISSING  Content-Security-Policy       MISSING  Permissions-Policy
MISSING  X-Frame-Options               MISSING  X-Content-Type-Options
```

The site is clickjackable and offers no defence-in-depth against script injection. HTTPS is at
least enforced — both `http://` and `www.` correctly 301 to the canonical host.

*Credit where due:* directory listing is properly denied (403 on `/images/`, `/css/`, `/verimages/`)
and no exposed config, backup or `.git` files were found. The server-side hygiene is better than
the front-end's.

### 3.3 Performance

- **TTFB 684 ms** — slow. The server is in the United States serving an Australian market.
- **4.7 MB total page weight**, 4.1 MB of it images
- **No WebP or AVIF** — 35 JPG and 8 PNG, no modern formats
- **No `srcset`, no lazy loading** — mobile visitors download full desktop images
- **No cache headers** on static assets — every asset is re-fetched on every visit
- Heaviest single images ~290 KB; the gallery page alone pushes well past 2 MB

Gzip is enabled on CSS, which is the one performance measure in place.

### 3.4 The template was never finished

The site is a repurposed **handyman** template. The CSS still references images from that original
theme which were never replaced and do not exist:

```
images/serv1.png … serv8.png        404
images/handyman-1.png               404
images/left-lady.png                404
images/right-man.png                404
images/home-services/bottom-img.png 404
```

That is **12 failed image requests on every page load** — wasted requests, and visible gaps where
backgrounds and icons were meant to be.

### 3.5 Accessibility

- **Zero `<h1>` elements** — screen reader users get no page structure
- **48 of 79 images** have missing or empty `alt` text
- **0 of 15 form labels** use `for=` — labels are not programmatically bound to their inputs
- No skip-to-content link, no visible focus management

Beyond being a barrier to users with disabilities, this carries legal exposure under the
Disability Discrimination Act for a business serving corporate and government clients.

---

## Severity 4 — Conversion and trust

### 4.1 Dead links and wrong information

- **Social icons go nowhere.** Facebook and YouTube icons appear in the header and footer of every
  page, linking to `""` and `#x`. They are dead on all 10 pages.
- **The map shows the wrong place.** The Google Maps embed on the contact page is centred on *all of
  Australia* at continent zoom level, not the Epping VIC 3076 address. The embed URL still carries
  `!2snp` — the Nepal locale parameter left in by whoever originally built it.
- **Copyright 2021** in the footer of every page.

### 4.2 The quote form doesn't ask for what the business says it needs

The pricing page states plainly:

> "Emailing images to us will give us a much better understanding of a problem and knowing the
> type of fallout it is."

The quote form has **no image upload field**. The business has told visitors exactly what it needs
to quote accurately, then built a form that cannot accept it.

### 4.3 No social proof anywhere

No testimonials. No reviews. No client or insurer logos. No case studies. No accreditations. For a
service where the buyer is handing over a damaged vehicle or an insurance claim, and where the
purchase is high-trust and often high-value, there is nothing on the site that answers "why should
I believe you."

The before/after gallery is the exception — it is strong, credible proof. It is also stuck behind a
lightbox on a single page with 57 words of context and no captions explaining what happened, what
was done, or how long it took.

### 4.4 The most valuable offers are buried

Read the body copy and there are three genuinely strong B2B propositions hidden in it:

1. **Volume / fleet work** — *"If there are a high volume amount of cars effected in one place… we
   can give a price on a volume lot"*
2. **Insurance claims management** — *"We can offer a service which includes authorisation and
   release forms and handle the public relations on your behalf"*
3. **Construction sector specialisation** — *"Our biggest clients are construction companies when
   they are pouring their slabs"*

Each of these is a higher-value, lower-competition buyer than a single retail car owner. None has a
landing page. None is in the navigation. All three are mid-paragraph on pages nobody lands on.

### 4.5 Fragmented contact identity

Two mobile numbers (Adrianus and Renny) presented with equal weight and no routing logic, and an
email on a different domain to the website. No form-fill confirmation, no auto-responder visible,
no business hours beyond "Mon–Fri 8:00–5:00" in the footer, and no after-hours path — for a service
where a construction incident or a fresh insurance claim is inherently urgent.

---

## Summary table

| # | Finding | Severity | Effort to fix |
|---|---|---|---|
| 1 | Quote form CAPTCHA returns 500 — primary CTA is broken | Critical | Hours |
| 2 | No analytics or conversion tracking of any kind | Critical | Hours |
| 3 | Duplicate site on second domain, no redirect or canonical | Critical | Hours |
| 4 | Zero H1s, duplicate titles, no meta descriptions sitewide | High | Days |
| 5 | No robots.txt, sitemap, or schema markup | High | Hours |
| 6 | 1,836 words total — content too thin to rank | High | Weeks |
| 7 | No CMS — business can't edit its own site | High | Rebuild |
| 8 | jQuery 1.12.4 with known XSS CVEs, no SRI | Medium | Days |
| 9 | Zero security headers | Medium | Hours |
| 10 | 4.7 MB page weight, no modern image formats, 684 ms TTFB | Medium | Days |
| 11 | 12 broken image requests per page from unfinished template | Medium | Hours |
| 12 | Accessibility failures — alt text, labels, headings | Medium | Days |
| 13 | Dead social links, map pointing at the wrong location | Low | Hours |
| 14 | No social proof — no reviews, testimonials or client logos | High | Days |
| 15 | No image upload on quote form despite pricing page asking for photos | High | Hours |
| 16 | Three B2B offers with no landing pages | High | Weeks |

---

## What this means commercially

The site's problems are not cosmetic. In order of what they cost:

**They cannot capture the demand they already have.** Whatever traffic arrives today hits a broken
quote form. Fixing that single endpoint is likely the highest-ROI hour of work available on this
property, and it can be done before anything else is decided.

**They cannot see anything.** With no analytics, there is no way to know the size of the problem
above, no way to prove a rebuild worked, and no way to run paid acquisition without burning budget
blind. This needs to go in before the rebuild, not after, so there is a genuine before-and-after.

**They cannot be found.** No H1s, one title tag across ten pages, no sitemap, no schema, under 2,000
words, and a duplicate domain splitting whatever authority exists. For a business whose buyers
search "overspray removal Melbourne" or "cement splatter car repair", this is close to being absent
from the market.

**They cannot sell their best work.** The volume/fleet, insurance-claims and construction-sector
propositions are the highest-value things this business does, and they are invisible. A single
construction-industry landing page targeting site managers, with the before/after gallery as proof
and the claims-management service as the differentiator, would likely outperform the entire current
site.

**They look dormant.** A 2021 copyright, dead social icons, a map of the wrong continent, and a
broken form are the signals a corporate procurement officer or insurance assessor reads before
deciding whether to call. The work is 30 years deep. The website makes it look abandoned.

---

## Recommended sequencing

**Immediate (before any rebuild decision)**
Fix or remove the broken CAPTCHA so the quote form works. Install GA4 and conversion tracking to
establish a baseline. 301 `overspray.com.au` to the primary domain. Point the map at Epping.
Update the copyright. These are same-week fixes on the existing site.

**Phase 1 — Foundation**
Modern rebuild on a stack the business can edit itself. Unique titles, meta descriptions and H1s.
Schema markup, sitemap, robots.txt. Image optimisation and modern formats. Australian hosting.
Security headers. Accessibility remediation.

**Phase 2 — Conversion**
Rebuild the quote flow with image upload, since that is what the business says it needs to quote.
Restructure the gallery into captioned case studies. Add reviews and social proof. Clear routing
for the two phone numbers.

**Phase 3 — Growth**
Dedicated landing pages for construction/fleet, insurance claims management, and priority service
areas. Content depth on each service. Then, with tracking finally in place, paid acquisition becomes
viable.
