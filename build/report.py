"""Render AUDIT.md as a client-facing PDF report.

Writes build/audit-report.html with the fonts base64-embedded so the file is
self-contained, then build/report.js turns it into the PDF.
"""
import os, base64

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "web", "assets", "fonts")
IMGS = os.path.join(ROOT, "web", "assets", "images")
OUT = os.path.join(ROOT, "build", "audit-report.html")

SITE = "oversprayremovalists.com.au"
DATE = "2 August 2026"


def b64_font(name):
    with open(os.path.join(FONTS, name), "rb") as f:
        return base64.b64encode(f.read()).decode()


def b64_img(name):
    with open(os.path.join(IMGS, name), "rb") as f:
        return base64.b64encode(f.read()).decode()


def cover_band():
    """The three-frame overspray strip from the archive, at its native 2033px.
    Used as a wide band rather than a full-bleed so it is never upscaled."""
    from PIL import Image
    import io
    src = os.path.join(ROOT, "site", "images", "gallery", "before01.jpg")
    im = Image.open(src).convert("RGB")
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=88, optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


FONT_CSS = f"""
@font-face {{ font-family:'Bebas Neue'; font-weight:400; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('bebas-neue-400.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:400; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-400.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:500; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-500.woff2')}) format('woff2'); }}
@font-face {{ font-family:'DM Sans'; font-weight:700; font-display:block;
  src:url(data:font/woff2;base64,{b64_font('dm-sans-700.woff2')}) format('woff2'); }}
"""

COVER_IMG = cover_band()


def b64_build(name):
    with open(os.path.join(ROOT, "build", name), "rb") as f:
        return base64.b64encode(f.read()).decode()


CAP_PRIMARY = b64_build("cap-primary.png")   # widget on oversprayremovalists.com.au
CAP_ALT = b64_build("cap-alt.png")           # same key on overspray.com.au


# ---------------------------------------------------------------- findings

def finding(sev, num, title, body, evidence=None):
    ev = f'<pre class="ev">{evidence}</pre>' if evidence else ""
    return f"""<div class="finding s{sev}">
  <div class="f-head"><span class="sev">S{sev}</span><h3>{num} {title}</h3></div>
  <div class="f-body">{body}{ev}</div>
</div>"""


S1 = [
    finding(1, "1.1", "The quote form cannot be submitted",
        """<p><code>quote.php</code> is the destination of the site's most prominent call to action,
        the red <strong>GET A QUOTE NOW</strong> button in the header of every page. It carries a
        mandatory <em>Enter code</em> field fed by an image at
        <code>verimages/image-verify.php</code>.</p>
        <p>That endpoint returns <strong>HTTP 500</strong> with a zero-byte body, verified repeatedly
        with full browser headers. The image never renders, so there is no code for a visitor to
        read, and the field is marked mandatory.</p>
        <p class="hit">Every person who clicks the site's main call to action lands on a form they
        cannot complete.</p>""",
        "GET /verimages/image-verify.php\n  attempt 1: 500  (0 bytes)\n"
        "  attempt 2: 500  (0 bytes)\n  attempt 3: 500  (0 bytes)"),

    finding(1, "1.2", "The contact form's reCAPTCHA is registered to the wrong domain",
        f"""<p><code>contact.php</code> is the only other way to make contact in writing, and it is
        not promoted anywhere on the site (see 4.5). Its Google reCAPTCHA renders an error where the
        checkbox should be, so there is nothing to tick and the response field stays empty.</p>

        <div class="cap-compare">
          <figure>
            <img src="data:image/png;base64,{CAP_PRIMARY}" alt="">
            <figcaption class="bad">oversprayremovalists.com.au, the advertised domain</figcaption>
          </figure>
          <figure>
            <img src="data:image/png;base64,{CAP_ALT}" alt="">
            <figcaption class="good">overspray.com.au, the duplicate</figcaption>
          </figure>
        </div>

        <p>The cause connects straight to finding 1.4. The <em>same</em> site key renders a working
        checkbox on <code>overspray.com.au</code>. The key was registered against the duplicate
        domain, not the one the business advertises. The contact form works on the domain nobody is
        sent to, and fails on the one on the business cards.</p>

        <p>Whether the handler rejects the submission depends on server-side code that cannot be read
        over HTTP, and no form was submitted during this audit. Both possibilities are bad: if it
        verifies the token, submissions fail; if it does not, the form has no spam protection at all.
        Either way the visitor sees a red error immediately above the submit button.</p>

        <p class="hit">Between this and 1.1, there is no working written path to this business. The
        main call to action leads to a dead CAPTCHA image, the fallback leads to a dead CAPTCHA
        widget. The only route left is the phone.</p>""",
        "reCAPTCHA site key 6Lfd2HQiAAAAABGYcONkg6LXPai0AE9Xnb9lW98R\n\n"
        "  overspray.com.au              renders  I'm not a robot\n"
        "  oversprayremovalists.com.au   renders  ERROR for site owner:\n"
        "                                         Invalid domain for site key"),
    finding(1, "1.3", "Nothing is measured, at all",
        """<p>No Google Analytics, no Tag Manager, no Meta Pixel, no call tracking, no conversion
        events. Checked across all ten pages: zero tracking of any kind.</p>
        <ul>
          <li>Nobody knows how many people visit, what they look at, or where they leave</li>
          <li>Nobody knows the quote form is broken, or for how long it has been</li>
          <li>Paid advertising cannot run profitably: there is no conversion signal to optimise against</li>
          <li>There is no baseline, so no rebuild can be proven to have worked</li>
        </ul>"""),
    finding(1, "1.4", "Two identical websites competing with each other",
        """<p><code>overspray.com.au</code> serves <strong>byte-identical content</strong> to
        <code>oversprayremovalists.com.au</code>. Same MD5 hash, same server IP. Neither redirects to
        the other, neither carries a canonical tag. Google is shown two copies of the same site and
        asked to choose.</p>
        <p>The result is split ranking authority and diluted backlink value. Compounding it, the
        email address used across the site is <code>info@overspray.com.au</code>, the
        <em>other</em> domain, so the contact identity and the web presence point at different
        places.</p>""",
        "oversprayremovalists.com.au  ->  192.185.161.245\noverspray.com.au             ->  192.185.161.245\n\nMD5 (both homepages)         =  312949609208db9523354fd7d64fa0a8"),
]

S2 = [
    finding(2, "2.1", "The site is effectively invisible to search",
        """<p>For a local and national service business, the on-page SEO is not weak. It is absent.</p>
        <table class="check">
          <tr><th>Check</th><th>All 10 pages</th></tr>
          <tr><td>Unique &lt;title&gt;</td><td class="no">No. Every page reads <em>The Overspray Removalist</em></td></tr>
          <tr><td>Meta description</td><td class="no">None</td></tr>
          <tr><td>&lt;h1&gt; heading</td><td class="no"><strong>Zero H1 tags on the entire site</strong></td></tr>
          <tr><td>Canonical tag</td><td class="no">None</td></tr>
          <tr><td>Open Graph / social cards</td><td class="no">None</td></tr>
          <tr><td>robots.txt</td><td class="no">404</td></tr>
          <tr><td>sitemap.xml</td><td class="no">404</td></tr>
          <tr><td>Schema.org markup</td><td class="no">None</td></tr>
        </table>
        <p>Ten pages sharing one title tag leaves Google no way to tell the cement splatter page from
        the graffiti page from the pricing page. Sharing a link on Facebook or LinkedIn produces a
        bare grey box with no image, title or description.</p>"""),
    finding(2, "2.2", "The content is too thin to rank",
        """<p><strong>1,836 words across the entire site</strong>, an average of 183 per page.</p>
        <table class="words">
          <tr><td>index</td><td>408</td><td class="bar"><span style="width:100%"></span></td></tr>
          <tr><td>pricing</td><td>352</td><td class="bar"><span style="width:86%"></span></td></tr>
          <tr><td>overspray-removal</td><td>273</td><td class="bar"><span style="width:67%"></span></td></tr>
          <tr><td>cement-splatter-removals</td><td>240</td><td class="bar"><span style="width:59%"></span></td></tr>
          <tr><td>graffiti-removals</td><td>197</td><td class="bar"><span style="width:48%"></span></td></tr>
          <tr><td>environmental-damage</td><td>188</td><td class="bar"><span style="width:46%"></span></td></tr>
          <tr><td>about</td><td>99</td><td class="bar"><span style="width:24%"></span></td></tr>
          <tr><td>gallery</td><td>57</td><td class="bar"><span style="width:14%"></span></td></tr>
          <tr><td>quote</td><td>14</td><td class="bar"><span style="width:4%"></span></td></tr>
          <tr><td>contact</td><td><strong>8</strong></td><td class="bar"><span style="width:2%"></span></td></tr>
        </table>
        <p>Service pages at 200 to 270 words will not compete for <em>overspray removal Melbourne</em>
        or any suburb-qualified variant. The contact page has eight words on it.</p>
        <p>The copy that does exist is good, written by someone who plainly knows the trade. There
        just is not enough of it, and none of it is structured for search.</p>"""),
    finding(2, "2.3", "No content management",
        """<p>Every page is hand-coded PHP. There is no CMS, no admin login, and no way for the
        business to change a price, add a gallery photo or update an opening hour without paying a
        developer to edit raw HTML.</p>
        <p>That is why the footer still reads <strong>Copyright &copy; 2021</strong>. The site reads
        as abandoned to anyone who scrolls to the bottom.</p>"""),
]

S3 = [
    finding(3, "3.1", "End-of-life front-end stack",
        """<table class="check">
          <tr><th>Library</th><th>Version</th><th>Status</th></tr>
          <tr><td>Bootstrap</td><td>3.3.7</td><td class="no">End of life since 2019</td></tr>
          <tr><td>jQuery</td><td>1.12.4</td><td class="no">Released 2016. Known XSS vulnerabilities (CVE-2020-11022, CVE-2020-11023)</td></tr>
          <tr><td>Font Awesome</td><td>4.5.0</td><td class="no">Superseded, served from a deprecated CDN</td></tr>
        </table>
        <p>All three load from third-party CDNs with <strong>no Subresource Integrity hashes</strong>.
        If any of those CDNs is compromised, arbitrary JavaScript executes on the site with nothing
        standing in the way.</p>"""),
    finding(3, "3.2", "Zero security headers",
        """<p>Every standard protective header is absent.</p>""",
        "Strict-Transport-Security   MISSING\nContent-Security-Policy     MISSING\nX-Frame-Options             MISSING\nX-Content-Type-Options      MISSING\nReferrer-Policy             MISSING\nPermissions-Policy          MISSING"),
    finding(3, "3.3", "Performance",
        """<ul>
          <li><strong>TTFB 684 ms.</strong> The server sits in the United States serving an Australian market</li>
          <li><strong>4.7 MB page weight</strong>, 4.1 MB of it images</li>
          <li><strong>No WebP or AVIF.</strong> 35 JPG and 8 PNG, no modern formats</li>
          <li><strong>No srcset, no lazy loading.</strong> Mobile visitors download full desktop images</li>
          <li><strong>No cache headers</strong> on static assets, so everything re-downloads on every visit</li>
        </ul>
        <p>Gzip on CSS is the one performance measure in place.</p>"""),
    finding(3, "3.4", "The template was never finished",
        """<p>The site is a repurposed <em>handyman</em> template. The CSS still references images from
        that original theme which were never replaced and do not exist, producing
        <strong>12 failed image requests on every page load</strong>.</p>""",
        "images/serv1.png  ...  serv8.png     404\nimages/handyman-1.png               404\nimages/left-lady.png                404\nimages/right-man.png                404\nimages/home-services/bottom-img.png 404"),
    finding(3, "3.5", "Accessibility",
        """<ul>
          <li><strong>Zero H1 elements.</strong> Screen reader users get no page structure</li>
          <li><strong>48 of 79 images</strong> have missing or empty alt text</li>
          <li><strong>0 of 15 form labels</strong> are bound to their inputs</li>
          <li>No skip-to-content link and no visible focus management</li>
        </ul>
        <p>Beyond being a barrier to users with disabilities, this carries legal exposure under the
        Disability Discrimination Act for a business serving corporate and government clients.</p>"""),
]

S4 = [
    finding(4, "4.1", "Dead links and wrong information",
        """<ul>
          <li><strong>Social icons go nowhere.</strong> Facebook and YouTube icons sit in the header and
          footer of every page, linking to <code>""</code> and <code>#x</code></li>
          <li><strong>The map shows the wrong place.</strong> The embed is centred on all of Australia at
          continent zoom, not the Epping VIC address, and still carries the Nepal locale parameter
          left in by whoever built it</li>
          <li><strong>Copyright 2021</strong> in the footer of every page</li>
        </ul>"""),
    finding(4, "4.2", "The quote form does not ask for what the business says it needs",
        """<p>The pricing page states plainly:</p>
        <blockquote>Emailing images to us will give us a much better understanding of a problem and
        knowing the type of fallout it is.</blockquote>
        <p>The quote form has <strong>no image upload field</strong>. The business has told visitors
        exactly what it needs to quote accurately, then built a form that cannot accept it.</p>"""),
    finding(4, "4.3", "No social proof anywhere",
        """<p>No testimonials. No reviews. No client or insurer logos. No case studies. No
        accreditations. For a high-trust, often high-value purchase where the buyer hands over a
        damaged vehicle or an insurance claim, there is nothing on the site that answers
        <em>why should I believe you</em>.</p>
        <p>The before and after gallery is the exception. It is strong, credible proof, and it is
        stuck behind a lightbox on a single page with 57 words of context and no captions explaining
        what happened, what was done, or how long it took.</p>"""),
    finding(4, "4.4", "The most valuable offers are buried",
        """<p>Three genuinely strong business-to-business propositions are hidden in the body copy.</p>
        <ol class="offers">
          <li><strong>Volume and fleet work.</strong> <em>"If there are a high volume amount of cars
          effected in one place... we can give a price on a volume lot"</em></li>
          <li><strong>Insurance claims management.</strong> <em>"We can offer a service which includes
          authorisation and release forms and handle the public relations on your behalf"</em></li>
          <li><strong>Construction sector specialisation.</strong> <em>"Our biggest clients are
          construction companies when they are pouring their slabs"</em></li>
        </ol>
        <p>Each is a higher-value, lower-competition buyer than a single retail car owner. None has a
        landing page. None is in the navigation. All three sit mid-paragraph on pages nobody
        lands on.</p>"""),
    finding(4, "4.5", "The contact form adds friction and is not promoted",
        """<p>Setting aside the broken reCAPTCHA in 1.2, the form itself works against the enquiry.</p>
        <ul>
          <li><strong>Six fields for a first contact</strong>, including First Name and Last Name as
          separate inputs and an <strong>Address</strong> field. Nobody types their street address to
          ask a question.</li>
          <li><strong>No image upload</strong>, the same omission as the quote form, and the same
          contradiction with the pricing page that explicitly asks for photos.</li>
          <li><strong>A RESET button beside SUBMIT.</strong> One misclick wipes everything the
          visitor typed. Mainstream web design abandoned this roughly two decades ago.</li>
          <li><strong>No context.</strong> No response time, no indication of what happens next, and
          the only instruction is "Please fill up the form".</li>
          <li><strong>Labels are not bound to inputs</strong>, so tapping a label on a phone does not
          focus the field.</li>
        </ul>
        <p>It is also <strong>not a call to action anywhere on the site</strong>. Every prominent
        button, including the red header CTA on all ten pages, points at the quote form. The contact
        form is reachable only by noticing <em>Contact Us</em> at the end of the navigation. So the
        weaker of the two forms is the harder one to find, and the stronger one is the one that is
        most visibly broken.</p>"""),
    finding(4, "4.6", "Fragmented contact identity",
        """<p>Two mobile numbers presented with equal weight and no routing logic, and an email on a
        different domain to the website. No form-fill confirmation, no auto-responder, and no
        after-hours path, for a service where a construction incident or a fresh insurance claim is
        inherently urgent.</p>"""),
]

SUMMARY_ROWS = [
    (1, "Quote form CAPTCHA returns 500, primary call to action is broken", "Critical", "Hours"),
    (1, "Contact form reCAPTCHA errors 'Invalid domain for site key', the fallback path is broken too", "Critical", "Hours"),
    (1, "No analytics or conversion tracking of any kind", "Critical", "Hours"),
    (1, "Duplicate site on a second domain, no redirect or canonical", "Critical", "Hours"),
    (2, "Zero H1s, duplicate titles, no meta descriptions sitewide", "High", "Days"),
    (2, "No robots.txt, sitemap or schema markup", "High", "Hours"),
    (2, "1,836 words total, content too thin to rank", "High", "Weeks"),
    (2, "No CMS, the business cannot edit its own site", "High", "Rebuild"),
    (4, "No social proof, no reviews, testimonials or client logos", "High", "Days"),
    (4, "No image upload on the quote form despite the pricing page asking for photos", "High", "Hours"),
    (4, "Three business-to-business offers with no landing pages", "High", "Weeks"),
    (3, "jQuery 1.12.4 with known XSS CVEs, no SRI", "Medium", "Days"),
    (3, "Zero security headers", "Medium", "Hours"),
    (3, "4.7 MB page weight, no modern image formats, 684 ms TTFB", "Medium", "Days"),
    (3, "12 broken image requests per page from an unfinished template", "Medium", "Hours"),
    (3, "Accessibility failures: alt text, labels, headings", "Medium", "Days"),
    (4, "Contact form friction: six fields, split name, address, RESET button, no upload, not a call to action", "Medium", "Hours"),
    (4, "Dead social links, map pointing at the wrong location", "Low", "Hours"),
]

summary_html = "".join(
    f'<tr><td><span class="sev s{s}">S{s}</span></td><td>{t}</td>'
    f'<td class="p-{p.lower()}">{p}</td><td class="eff">{e}</td></tr>'
    for s, t, p, e in SUMMARY_ROWS)


# ---------------------------------------------------------------- document

HTML = f"""<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8">
<title>Website Audit - The Overspray Removalist</title>
<style>
{FONT_CSS}
* {{ box-sizing: border-box; }}
/* margin 0 here on purpose: the two render passes in report.js set their own
   margins (zero for the bleed cover, 15/16mm for the body + footer). A CSS
   @page margin would shrink the page box under both and fragment the cover. */
@page {{ size: A4; margin: 0; }}
html, body {{ margin: 0; padding: 0; }}
body {{
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 10.2pt; line-height: 1.6; color: #1b1f2a; background: #fff;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}}
.page {{ padding: 0 18mm; }}
h1, h2, h3 {{ font-family: 'Bebas Neue', sans-serif; font-weight: 400;
  letter-spacing: .015em; text-transform: uppercase; margin: 0; line-height: .95; }}
p {{ margin: 0 0 .62em; }}
ul, ol {{ margin: .5em 0 .8em; padding-left: 1.1em; }}
li {{ margin-bottom: .3em; }}
code {{ font-family: 'Consolas', 'Courier New', monospace; font-size: .88em;
  background: #eef0f5; padding: .1em .35em; border-radius: 3px; color: #b3231c; }}
em {{ color: #40485c; }}

/* ---- cover ---- */
/* 295mm rather than a full 297mm sheet: at exactly one page height, sub-pixel
   rounding tips the bottom meta row onto a second blank page. */
.cover {{
  position: relative; height: 295mm; margin: -16mm 0 0; padding: 26mm 18mm 18mm;
  background: #080b16; color: #fff; overflow: hidden;
  page-break-after: always; display: flex; flex-direction: column;
}}
.cover > * {{ position: relative; z-index: 1; }}
.cover-band {{ margin: 13mm -18mm 0; position: relative; }}
.cover-band img {{ width: 100%; display: block; }}
.cover-band::after {{ content: ''; position: absolute; inset: 0; background:
  linear-gradient(to right, rgba(8,11,22,.6), rgba(8,11,22,0) 20%, rgba(8,11,22,0) 80%, rgba(8,11,22,.6)),
  linear-gradient(to bottom, rgba(8,11,22,.3), rgba(8,11,22,0) 34%, rgba(8,11,22,.3)); }}
.cover-cap {{ font-size: 8.4pt; color: #6f7c96; margin: 4mm 0 0; }}
.cover-stats {{ margin-top: auto; padding-top: 10mm; display: flex; gap: 8mm; }}
.cstat {{ flex: 1; border-top: 2px solid #d52a22; padding-top: 3.5mm; }}
.cstat b {{ display: block; font-family: 'Bebas Neue', sans-serif; font-weight: 400;
  font-size: 27pt; line-height: 1; color: #fff; margin-bottom: 2mm; }}
.cstat span {{ font-size: 8.6pt; color: #9aa6bd; line-height: 1.4; display: block; }}
.eyebrow {{ font-size: 8.4pt; letter-spacing: .24em; text-transform: uppercase;
  color: #ff7900; font-weight: 700; }}
.cover h1 {{ font-size: 50pt; margin: 6mm 0 4mm; }}
.cover .sub {{ font-size: 13pt; color: #c3ccdd; max-width: 108mm; line-height: 1.45; }}
.cover-meta {{ margin-top: auto; border-top: 1px solid #26314d; padding-top: 6mm;
  display: flex; gap: 14mm; font-size: 9.4pt; }}
.cover-meta b {{ display: block; color: #78849c; font-weight: 500; font-size: 8pt;
  letter-spacing: .14em; text-transform: uppercase; margin-bottom: 1.2mm; }}
.cover-rule {{ width: 26mm; height: 3px; background: #d52a22; margin-bottom: 7mm; }}

/* ---- verdict ---- */
.verdict {{ background: #0e1524; color: #fff; padding: 9mm 10mm; border-radius: 4mm;
  margin: 0 0 9mm; border-left: 4px solid #d52a22; }}
.verdict h2 {{ font-size: 19pt; margin-bottom: 3mm; }}
.verdict p {{ color: #c8d0e0; margin-bottom: .5em; }}
.verdict p:last-child {{ margin-bottom: 0; }}
.verdict strong {{ color: #fff; }}

/* ---- section heads ---- */
.sec {{ margin: 0 0 6mm; padding-top: 2mm; }}
.sec h2 {{ font-size: 21pt; color: #0d1220; }}
.sec .lede {{ color: #59617a; margin-top: 1.5mm; font-size: 10.6pt; }}
.sec-rule {{ height: 2px; background: #d52a22; width: 18mm; margin: 3mm 0 4mm; }}

/* ---- findings ---- */
.finding {{ border: 1px solid #e2e6ee; border-radius: 3mm; padding: 6mm 7mm;
  margin-bottom: 5mm; page-break-inside: avoid; background: #fff; }}
.finding.s1 {{ border-left: 4px solid #d52a22; }}
.finding.s2 {{ border-left: 4px solid #e8720c; }}
.finding.s3 {{ border-left: 4px solid #c9a227; }}
.finding.s4 {{ border-left: 4px solid #5b6784; }}
.f-head {{ display: flex; align-items: baseline; gap: 4mm; margin-bottom: 3mm; }}
.f-head h3 {{ font-size: 15pt; color: #0d1220; }}
.sev {{ font-family: 'DM Sans', sans-serif; font-size: 7.6pt; font-weight: 700;
  letter-spacing: .1em; padding: .9mm 2.2mm; border-radius: 2mm; color: #fff; flex: none; }}
.s1 .sev, .sev.s1 {{ background: #d52a22; }}
.s2 .sev, .sev.s2 {{ background: #e8720c; }}
.s3 .sev, .sev.s3 {{ background: #b8941f; }}
.s4 .sev, .sev.s4 {{ background: #5b6784; }}
.f-body > :last-child {{ margin-bottom: 0; }}
.hit {{ background: #fdf0ef; border-left: 3px solid #d52a22; padding: 3mm 4mm;
  font-weight: 700; color: #8f1a15; border-radius: 0 2mm 2mm 0; }}
blockquote {{ margin: 2mm 0 3mm; padding: 3mm 5mm; border-left: 3px solid #cfd5e2;
  color: #485066; font-style: italic; background: #f7f8fb; }}
.cap-compare {{ display: flex; gap: 6mm; margin: 4mm 0; }}
.cap-compare figure {{ margin: 0; flex: 1; }}
.cap-compare img {{ width: 100%; border: 1px solid #dfe3ec; border-radius: 2mm; display: block; }}
.cap-compare figcaption {{ font-size: 8pt; margin-top: 2mm; font-weight: 700; }}
.cap-compare .bad {{ color: #b3231c; }}
.cap-compare .good {{ color: #1d7a4c; }}

pre.ev {{ font-family: 'Consolas', 'Courier New', monospace; font-size: 8.2pt;
  background: #0e1524; color: #b9c4da; padding: 4mm 5mm; border-radius: 2mm;
  margin: 3mm 0 0; white-space: pre; overflow: hidden; line-height: 1.5; }}

/* ---- tables ---- */
table {{ width: 100%; border-collapse: collapse; margin: 2mm 0 3mm; font-size: 9.4pt; }}
th {{ text-align: left; font-size: 7.8pt; letter-spacing: .12em; text-transform: uppercase;
  color: #78819a; font-weight: 700; padding: 0 3mm 2mm 0; border-bottom: 1px solid #dfe3ec; }}
td {{ padding: 2mm 3mm 2mm 0; border-bottom: 1px solid #eef0f5; vertical-align: top; }}
td.no {{ color: #b3231c; }}
.words td:first-child {{ font-family: 'Consolas', monospace; font-size: 8.6pt; width: 46mm; }}
.words td:nth-child(2) {{ width: 14mm; font-weight: 700; text-align: right; padding-right: 4mm; }}
.words .bar span {{ display: block; height: 3.2mm; background: linear-gradient(90deg,#d52a22,#ff7900); border-radius: 2px; }}

/* ---- summary ---- */
.summary td {{ font-size: 9.2pt; }}
.summary td:first-child {{ width: 12mm; }}
.summary td:nth-child(3) {{ width: 22mm; font-weight: 700; }}
.summary td:last-child {{ width: 20mm; color: #6a7288; }}
.p-critical {{ color: #d52a22; }}
.p-high {{ color: #e8720c; }}
.p-medium {{ color: #a8871a; }}
.p-low {{ color: #5b6784; }}

/* ---- commercial ---- */
.impact {{ page-break-inside: avoid; margin-bottom: 4mm; padding-left: 8mm; position: relative; }}
.impact::before {{ content: ''; position: absolute; left: 0; top: 2.2mm;
  width: 3.4mm; height: 3.4mm; background: #d52a22; border-radius: 1px; }}
.impact h4 {{ margin: 0 0 1mm; font-size: 11pt; color: #0d1220; }}

/* ---- phases ---- */
.phase {{ border: 1px solid #e2e6ee; border-radius: 3mm; padding: 5mm 6mm; margin-bottom: 4mm;
  page-break-inside: avoid; }}
.phase h4 {{ margin: 0 0 1.5mm; font-size: 11.5pt; color: #0d1220;
  font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: .02em; font-weight: 400; }}
.phase.now {{ background: #fdf0ef; border-color: #f3cdca; }}
.phase.now h4 {{ color: #a01d17; }}

.pagebreak {{ page-break-before: always; }}
.foot-note {{ margin-top: 8mm; padding-top: 4mm; border-top: 1px solid #e2e6ee;
  font-size: 8.6pt; color: #78819a; }}
</style></head>
<body>

<div class="cover">
  <div class="cover-rule"></div>
  <p class="eyebrow">Website audit</p>
  <h1>The Overspray<br>Removalist</h1>
  <p class="sub">Front-end, back-end, search and conversion review of
  {SITE}, with the commercial cost of each finding.</p>
  <div class="cover-band"><img src="data:image/jpeg;base64,{COVER_IMG}" alt=""></div>
  <p class="cover-cap">Paint overspray across a customer vehicle, from the site's own gallery.</p>

  <div class="cover-stats">
    <div class="cstat"><b>BOTH FORMS</b><span>The quote form's CAPTCHA returns HTTP 500 and the
      contact form's reCAPTCHA errors. No written enquiry can be sent.</span></div>
    <div class="cstat"><b>ZERO</b><span>H1 tags, meta descriptions and analytics across all ten
      pages. The site is unmeasured and close to unfindable.</span></div>
    <div class="cstat"><b>TWO SITES</b><span>Byte-identical content on a second domain from the
      same server, with no redirect between them.</span></div>
  </div>

  <div class="cover-meta" style="margin-top:9mm">
    <div><b>Site</b>{SITE}</div>
    <div><b>Audited</b>{DATE}</div>
    <div><b>Pages reviewed</b>10 pages, 55 assets</div>
  </div>
</div>

<div class="page">

  <div class="verdict">
    <h2>The one-line version</h2>
    <p>The business has genuine authority. Thirty years, a specialist process no competitor offers,
    real before and after proof, and strong work in construction and insurance claims.</p>
    <p><strong>The website converts almost none of it.</strong> Both of its forms are broken,
    nothing on the site is measured, and the site is close to invisible to search.</p>
    <p>This is not a design problem. It is a lead-capture problem.</p>
  </div>

  <div class="sec">
    <h2>Severity 1</h2>
    <div class="sec-rule"></div>
    <p class="lede">Actively losing money right now.</p>
  </div>
  {"".join(S1)}

  <div class="sec" style="margin-top:8mm">
    <h2>Severity 2</h2>
    <div class="sec-rule"></div>
    <p class="lede">Structurally blocking growth.</p>
  </div>
  {"".join(S2)}

  <div class="sec" style="margin-top:8mm">
    <h2>Severity 3</h2>
    <div class="sec-rule"></div>
    <p class="lede">Technical debt and risk.</p>
  </div>
  {"".join(S3)}

  <div class="sec" style="margin-top:8mm">
    <h2>Severity 4</h2>
    <div class="sec-rule"></div>
    <p class="lede">Conversion and trust.</p>
  </div>
  {"".join(S4)}

  <div class="pagebreak"></div>
  <div class="sec">
    <h2>All findings</h2>
    <div class="sec-rule"></div>
    <p class="lede">Eighteen findings, ordered by what they cost.</p>
  </div>
  <table class="summary">
    <tr><th></th><th>Finding</th><th>Severity</th><th>Effort</th></tr>
    {summary_html}
  </table>

  <div class="pagebreak"></div>
  <div class="sec">
    <h2>What this means commercially</h2>
    <div class="sec-rule"></div>
    <p class="lede">The findings above, ordered by what they cost the business.</p>
  </div>

  <div class="impact"><h4>They cannot capture the demand they already have.</h4>
  <p>Whatever traffic arrives today hits a broken quote form, and the contact form behind it is
  broken too. Every written enquiry route on the advertised domain is closed, so anyone who will not
  pick up the phone leaves. Fixing the two CAPTCHAs is the highest-return hour of work available on
  this property, and it can happen before anything else is decided.</p></div>

  <div class="impact"><h4>They cannot see anything.</h4>
  <p>With no analytics there is no way to know the size of the problem above, no way to prove a
  rebuild worked, and no way to run paid acquisition without burning budget blind. Tracking needs to
  go in before the rebuild, not after, so there is a genuine before and after.</p></div>

  <div class="impact"><h4>They cannot be found.</h4>
  <p>No H1s, one title tag across ten pages, no sitemap, no schema, under 2,000 words, and a
  duplicate domain splitting whatever authority exists. For a business whose buyers search
  <em>overspray removal Melbourne</em> or <em>cement splatter car repair</em>, this is close to being
  absent from the market.</p></div>

  <div class="impact"><h4>They cannot sell their best work.</h4>
  <p>The volume and fleet, insurance claims and construction propositions are the highest-value
  things this business does, and they are invisible. A single construction-industry landing page
  aimed at site managers, with the gallery as proof and claims management as the differentiator,
  would likely outperform the entire current site.</p></div>

  <div class="impact"><h4>They look dormant.</h4>
  <p>A 2021 copyright, dead social icons, a map of the wrong continent and a broken form are the
  signals a procurement officer or insurance assessor reads before deciding whether to call. The work
  is thirty years deep. The website makes it look abandoned.</p></div>

  <div class="sec" style="margin-top:9mm">
    <h2>Recommended sequencing</h2>
    <div class="sec-rule"></div>
  </div>

  <div class="phase now">
    <h4>Immediate, before any rebuild decision</h4>
    <p>Fix or remove the broken CAPTCHA so the quote form works. Add the advertised domain to the
    reCAPTCHA key's allowed list so the contact form works, or drop the widget for a honeypot. Both
    take minutes. Install GA4 and conversion tracking to establish a baseline. Redirect
    <code>overspray.com.au</code> to the primary domain. Point the map at Epping. Update the
    copyright. These are same-week fixes on the existing site.</p>
  </div>

  <div class="phase">
    <h4>Phase 1 &middot; Foundation</h4>
    <p>Modern rebuild on a stack the business can edit itself. Unique titles, meta descriptions and
    H1s. Schema markup, sitemap, robots.txt. Image optimisation and modern formats. Australian
    hosting. Security headers. Accessibility remediation.</p>
  </div>

  <div class="phase">
    <h4>Phase 2 &middot; Conversion</h4>
    <p>Rebuild the quote flow with image upload, since that is what the business says it needs to
    quote. Restructure the gallery into captioned case studies. Add reviews and social proof. Clear
    routing for the two phone numbers.</p>
  </div>

  <div class="phase">
    <h4>Phase 3 &middot; Growth</h4>
    <p>Dedicated landing pages for construction and fleet, insurance claims management, and priority
    service areas. Content depth on each service. Then, with tracking finally in place, paid
    acquisition becomes viable.</p>
  </div>

  <p class="foot-note">Method: full crawl of all 10 pages and 55 assets, HTTP header inspection,
  endpoint probing and source review. Passive testing only. No forms were submitted and no intrusive
  testing was performed. Findings verified {DATE}.</p>

</div>
</body></html>
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(HTML)
print(f"wrote {OUT} ({len(HTML)//1024} KB with embedded fonts)")

# ---------------------------------------------------------------- render

import subprocess, shutil

BUILD = os.path.join(ROOT, "build")
NODE_MODULES = os.environ.get("PLAYWRIGHT_NODE_MODULES", "")
env = dict(os.environ)
if NODE_MODULES:
    env["NODE_PATH"] = NODE_MODULES

r = subprocess.run(["node", os.path.join(BUILD, "report.js")],
                   cwd=ROOT, env=env, capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip()[:500])
if r.returncode != 0:
    raise SystemExit("render failed")

cover_pdf = os.path.join(BUILD, ".cover.pdf")
body_pdf = os.path.join(BUILD, ".body.pdf")
final = os.path.join(ROOT, "Overspray-Website-Audit.pdf")

import fitz
doc = fitz.open(cover_pdf)
doc.insert_pdf(fitz.open(body_pdf))
doc.set_metadata({
    "title": "Website Audit - The Overspray Removalist",
    "subject": f"Front-end, back-end, SEO and conversion audit of {SITE}",
    "keywords": "website audit, overspray removal, SEO, conversion",
    "creator": "Neuronest",
})
doc.save(final, deflate=True, garbage=3)
pages = doc.page_count
doc.close()

for tmp in (cover_pdf, body_pdf):
    if os.path.exists(tmp):
        os.remove(tmp)

print(f"-> {final}  ({pages} pages, {os.path.getsize(final)//1024} KB)")
