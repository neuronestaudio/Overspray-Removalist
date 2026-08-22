"""Itemised scope for the client build log.

Separated from the generator so the line items can be edited without touching
the layout code.

HOURS ARE SCOPE ESTIMATES, NOT BILLED TIME. There is no timesheet behind this
build. Each figure is what that line item would conventionally take to produce.
The document states this in a callout rather than leaving a reader to assume
otherwise. Every other number in the report is measured from the repository.
"""

# (section title, blurb, [(line item, detail, hours), ...])
SECTIONS = [
    (
        "Discovery &amp; audit",
        "Understanding what was there before replacing it.",
        [
            ("Site archive", "Live site captured byte for byte, so nothing is lost in the change-over", 2),
            ("Content extraction", "Every page of existing copy pulled out and inventoried", 1.5),
            ("Front-end audit", "Markup, assets, responsiveness, page weight, broken behaviour", 2.5),
            ("Back-end audit", "Form handler, hosting, mail path, spam protection", 2),
            ("Form failure investigation", "Traced why enquiries were failing silently — a spam key registered to the wrong domain", 1),
            ("Duplicate domain finding", "Established the advertised domain and the live site were two different properties", 1),
            ("Audit document", "14 findings written up and produced as a client PDF", 2),
        ],
    ),
    (
        "Design system &amp; brand",
        "The visual language, built once and applied everywhere.",
        [
            ("Colour system", "Red gradient accent set, surface tones, outline states, dark base", 3),
            ("Typography", "Three self-hosted faces — display, body and script — subset for weight", 2.5),
            ("Carbon &amp; mesh surfaces", "Two textured backdrops used across hero, bands, footer and gallery", 2.5),
            ("Glass treatment system", "Layered translucency used on cards, panels, the wizard and the deck", 3),
            ("Button system", "Pill geometry, gradient fill, travelling sheen, hover and focus states", 2.5),
            ("Motion language", "Easing curves, reveal timing, scroll-driven effects, reduced-motion fallbacks", 3),
            ("Logo processing", "New artwork keyed off its background; two derivatives cut for header and footer", 3),
            ("Landing splash", "Branded entry animation on first load", 2),
            ("Icon set", "Inline SVG icons for phone, mail, location, hours and navigation", 1.5),
            ("Spacing &amp; scale tokens", "Responsive type and spacing scale so every breakpoint holds together", 2),
            ("Favicon &amp; social cards", "Browser icon plus Open Graph imagery per page", 1.5),
        ],
    ),
    (
        "Website infrastructure",
        "The engineering underneath. This is what separates the site from a page builder.",
        [
            ("Application framework", "React 19, Vite 7 and TypeScript — a typed, compiled build rather than a template", 3),
            ("Single route table", "One list of URLs feeding the browser, the server and the page generator", 4),
            ("Server-side rendering", "Pages rendered on the server at build time, not assembled in the visitor's browser", 5),
            ("Static pre-render", "All 63 URLs written to real HTML files, so search engines and social previews see finished pages", 4),
            ("Canonical guard", "The build fails if any page would publish the wrong canonical URL — the exact fault that broke three pages on the old site", 2.5),
            ("Image manifest", "Generated index of every image and the sizes that actually exist, so the site cannot request a file that was never made", 3),
            ("Responsive image pipeline", "Each photo exported at multiple widths in WebP; the browser picks the smallest that will do", 3),
            ("Lazy media loading", "Video and off-screen imagery load only on approach, and one video decodes at a time", 2.5),
            ("Asset build scripts", "Repeatable pipeline so new photos process the same way every time", 2),
            ("Sitemap &amp; robots generation", "Both regenerated automatically on every build, so they can never fall out of date", 2),
            ("Accessibility fallbacks", "Reduced-motion and reduced-transparency paths for visitors who ask for them", 3),
        ],
    ),
    (
        "Page templates",
        "Thirteen templates producing sixty-three live pages.",
        [
            ("Home", "Nine sections: hero deck, contaminant band, results, stats, coating process, gallery, proof, demonstration, quote", 12),
            ("Services index", "Grid entry point to all nine services", 3),
            ("Service page template", "One template, nine services, each with its own copy, imagery and structured data", 10),
            ("Gallery", "Full job archive with beam-outlined tiles", 3),
            ("Pricing", "How jobs are priced and what changes the number", 3),
            ("About", "Company story, method, people, service area and credentials", 6),
            ("Quote", "Dedicated wizard page with supporting aside", 3),
            ("Contact", "Both numbers, email, address, hours and enquiry paths", 3),
            ("Thank you", "Post-submission page, deliberately excluded from search", 1.5),
            ("Privacy", "Legal page covering the data the form collects", 1.5),
            ("HTML sitemap", "Every page on the site, grouped, reachable in one click", 3),
            ("Suburb page template", "One template, forty-six suburbs, each with its own local content", 12),
            ("404", "Handled properly rather than falling through to a blank page", 1),
        ],
    ),
    (
        "Interactive features",
        "The parts that demonstrate the work instead of describing it.",
        [
            ("Coverflow deck", "Infinite three-dimensional carousel of real jobs, drag and swipe enabled", 10),
            ("Before / after sliders", "Four live comparison panes, every job draggable in place", 8),
            ("Scrub-to-clean hero", "Visitors wipe contamination off a real vehicle photo with finger or mouse", 9),
            ("3D vehicle wipe", "WebGL vehicle that rotates and cleans under the cursor", 7),
            ("Word-belt parallax", "Oversized type drifting across a job photograph as the page scrolls", 6),
            ("Coating process carousel", "Four stages, each backed by its own looping process video", 7),
            ("Animated beam outlines", "Light travelling around every gallery tile, built to stay off the paint path", 4),
            ("Photo marquee rails", "Two continuous seamless-loop belts of job photography", 4),
            ("Scroll-scrubbed titles", "Section headings that arrive and leave with the scroll", 3),
        ],
    ),
    (
        "Lead capture",
        "Turning a visitor into a qualified enquiry, and making it measurable.",
        [
            ("Five-step quote wizard", "Guided flow replacing the single-block form that was failing", 10),
            ("Branching logic", "Removal jobs and protection jobs ask different questions", 4),
            ("Conditional fields", "Address only appears for on-site jobs; drop-off skips it entirely", 2),
            ("Validation &amp; recovery", "Per-step checks, clear errors, and a jump back to the first problem on submit", 3),
            ("Photo upload", "Multiple photos, resized in the browser before sending so uploads do not stall on mobile data", 5),
            ("Ad attribution", "First-touch capture of ten campaign parameters, retained across the visit", 4),
            ("Conversion tracking", "Tag manager events fired only on a confirmed submission", 2),
            ("CRM delivery", "Webhook into the customer database, with a hard stop that refuses to submit rather than silently dropping a lead", 2),
        ],
    ),
    (
        "Search &amp; local visibility",
        "Being findable, and being findable in the right suburbs.",
        [
            ("Page metadata", "Individual title, description and canonical URL on all 63 pages", 5),
            ("Structured data", "Machine-readable business, service and breadcrumb data on every route", 5),
            ("Suburb landing pages", "Forty-six pages, each naming the actual local source of the work rather than swapping a suburb name", 16),
            ("HTML sitemap page", "Human-readable index carrying the search phrase for each suburb", 3),
            ("XML sitemap &amp; robots", "Generated on every build and submitted-ready", 2),
            ("Internal linking", "Services, suburbs and gallery cross-linked so authority flows through the site", 4),
            ("Social preview cards", "Correct imagery and copy when a page is shared", 2),
            ("Index control", "Utility pages excluded so a thank-you page can never be landed on from search", 1),
            ("Google Business Profile audit", "Established there is no profile — the single biggest local gap", 2),
        ],
    ),
    (
        "Copywriting",
        "Every word on the site is written for this business.",
        [
            ("Home page", "Hero, positioning, section copy and calls to action", 5),
            ("Service pages", "Nine services, each explaining method, materials and what the customer gets", 12),
            ("About page", "Story, method, differentiation and service area", 4),
            ("Suburb content", "Forty-six individually written local paragraphs", 14),
            ("Quote wizard", "Question wording, hints and error messages", 3),
            ("Proof points", "Capability claims, each traceable to a source the client can confirm", 2),
        ],
    ),
    (
        "Media production",
        "Preparing thirty years of job photography for the web.",
        [
            ("Image processing", "57 photographs cropped, corrected and exported at multiple widths", 8),
            ("Before / after verification", "Confirmed each pair is genuinely the same vehicle before publishing it as proof", 3),
            ("Process video integration", "Four coating clips with poster frames and staged loading", 3),
            ("Texture production", "Carbon and woven mesh surfaces prepared for tiling", 2),
            ("Logo derivatives", "Background keyed by colour distance; header and footer versions cut", 2),
        ],
    ),
    (
        "Quality assurance",
        "Automated verification, not a click-through.",
        [
            ("Layout sweeps", "Every route checked for horizontal overflow at each breakpoint", 3),
            ("Tap-target auditing", "Every link and button measured against the 44px minimum", 3),
            ("Performance profiling", "Frame rate measured on a CPU-throttled phone; the gallery effect rebuilt when it cost 32fps", 4),
            ("Hydration verification", "Confirmed the served HTML and the live page agree", 2),
            ("Link &amp; canonical sweep", "All 64 sitemap links walked on production", 2),
            ("Keyboard &amp; assistive testing", "Focus order, labels, inert panels, screen-reader naming", 4),
            ("Cross-breakpoint verification", "Desktop, tablet and phone passes on every change", 4),
            ("Defect resolution", "Three global stylesheet collisions traced and fixed, among others", 4),
        ],
    ),
    (
        "Deployment &amp; hosting",
        "Getting it live, and keeping it live.",
        [
            ("Hosting setup", "Global edge hosting with automatic certificates", 2),
            ("Continuous deployment", "Every approved change builds and publishes itself", 2),
            ("Security headers", "Content, framing and transport protections configured", 2),
            ("Deploy fault fix", "Found and fixed a misconfiguration publishing a 404 over the working site on every push", 2),
            ("Production verification", "Every route confirmed live after each release", 2),
            ("Documentation", "This report, the URL inventory and the release history", 2),
        ],
    ),
]

# What the client is receiving, in plain terms.
INCLUDED = [
    ("63-page website", "Every page built, written and live — not a template with placeholder content"),
    ("46 suburb landing pages", "Individually written local pages targeting Melbourne search"),
    ("9 service pages", "Including ceramic coating, paint protection and auto detailing"),
    ("Quote system", "Five-step wizard with photo upload, feeding directly into a customer database"),
    ("Conversion tracking", "Every enquiry attributed to the campaign that produced it"),
    ("Mobile-first build", "Verified on phone at every breakpoint, not scaled down from desktop"),
    ("Search foundation", "Structured data, sitemaps, canonical control and internal linking"),
    ("Hosting &amp; deployment", "Global edge hosting, automatic certificates, continuous deployment"),
    ("Source code ownership", "The full codebase, version-controlled, with a documented release history"),
    ("Brand assets", "Logo derivatives, processed photography and a documented design system"),
]

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
    "Connect the customer database and tag manager so every enquiry is captured and attributed.",
    "Sign off the ceramic and paint protection specifics: coating range, film brand, and whether coverage levels carry prices.",
    "Confirm the service radius. The site currently says Melbourne on coverage claims; the legacy copy said Australia wide.",
    "Point the domain at the new build.",
]
