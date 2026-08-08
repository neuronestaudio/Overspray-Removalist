/**
 * Post-build pre-rendering.
 *
 * Imports the SSR bundle Vite just built, calls render(url) for every route and
 * injects the HTML plus per-route head tags into the client index.html shell.
 * No browser involved; runs entirely in Node.
 *
 * The route list comes from the bundle (PRERENDER_PATHS), not from a copy kept
 * here. That is deliberate: a second list is how routes silently get written as
 * the 404 page while the build still reports success.
 *
 * It also fails the build if a rendered route comes back without a title or
 * with the wrong canonical, which is the observable symptom of a route falling
 * through to the wildcard.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

const SITE_ORIGIN = 'https://oversprayremovalists.com.au';
const FALLBACK_TITLE = 'Overspray Removal Australia | The Overspray Removalist';
const FALLBACK_DESC =
  'Specialist paint overspray, cement splatter, graffiti and industrial fallout removal from vehicles, fleets and property. Over 30 years, non-abrasive, Australia wide.';

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHeadTags(head) {
  const title = head.title || FALLBACK_TITLE;
  const description = head.description || FALLBACK_DESC;
  const canonical = head.canonical || `${SITE_ORIGIN}/`;
  const image = head.image || `${SITE_ORIGIN}/assets/images/job-splatter-2-677.webp`;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `    <meta name="description" content="${escapeAttr(description)}" />`,
    `    <link rel="canonical" href="${escapeAttr(canonical)}" />`,
    `    <meta property="og:title" content="${escapeAttr(title)}" />`,
    `    <meta property="og:description" content="${escapeAttr(description)}" />`,
    `    <meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:site_name" content="The Overspray Removalist" />`,
    `    <meta property="og:locale" content="en_AU" />`,
    `    <meta property="og:image" content="${escapeAttr(image)}" />`,
  ];
  if (head.imageAlt) {
    tags.push(`    <meta property="og:image:alt" content="${escapeAttr(head.imageAlt)}" />`);
  }
  tags.push(
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `    <meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `    <meta name="twitter:image" content="${escapeAttr(image)}" />`,
  );
  if (head.noindex) {
    tags.push(`    <meta name="robots" content="noindex,nofollow" />`);
  }
  if (Array.isArray(head.jsonLd) && head.jsonLd.length) {
    for (const item of head.jsonLd) {
      const json = JSON.stringify(item).replace(/<\//g, '<\\/');
      /* data-pagemeta-jsonld matters: PageMeta clears blocks carrying this
         attribute before injecting its own on hydration. Without it the
         pre-rendered copy survives and every page ends up with two of each
         schema block. */
      tags.push(`    <script type="application/ld+json" data-pagemeta-jsonld>${json}</script>`);
    }
  }
  return tags.join('\n');
}

function inject(template, appHtml, head) {
  return template
    .replace(/<title>[^<]*<\/title>\s*/, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/, '')
    .replace('</head>', `${buildHeadTags(head)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

async function prerender() {
  console.log('\nPre-rendering...\n');

  const bundle = pathToFileURL(path.resolve(DIST, 'server', 'entry-server.js')).href;
  const { render, PRERENDER_PATHS } = await import(bundle);

  if (!Array.isArray(PRERENDER_PATHS) || PRERENDER_PATHS.length === 0) {
    console.error('  entry-server did not export PRERENDER_PATHS. Nothing to render.');
    process.exit(1);
  }

  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');
  const problems = [];
  let rendered = 0;

  for (const route of PRERENDER_PATHS) {
    try {
      const { html: appHtml, head } = render(route);

      /* A route that fell through to the wildcard renders the 404 page: no
         recorded title, and a canonical that is not this route. Catching it
         here is the whole point — the original template reported these as
         successful pre-renders. */
      const expected = `${SITE_ORIGIN}${route === '/' ? '/' : route}`;
      if (!head.title) {
        problems.push(`${route}: no head recorded (route not matched by the server router?)`);
      } else if (head.canonical !== expected) {
        problems.push(`${route}: canonical is ${head.canonical}, expected ${expected}`);
      }

      const outFile = path.join(DIST, route === '/' ? 'index.html' : `${route}/index.html`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, inject(template, appHtml, head), 'utf-8');

      rendered++;
      console.log(`  ok  ${route.padEnd(28)} ${head.title.slice(0, 62)}`);
    } catch (err) {
      problems.push(`${route}: ${err.message}`);
      console.error(`  FAIL ${route}: ${err.message}`);
    }
  }

  /* /404.html — render a path no route matches. Vercel serves this file with a
     404 status when nothing else matches. */
  try {
    const { html: appHtml, head } = render('/__osr_not_found__');
    fs.writeFileSync(path.join(DIST, '404.html'), inject(template, appHtml, head), 'utf-8');
    console.log(`  ok  /404.html`);
  } catch (err) {
    problems.push(`/404.html: ${err.message}`);
  }

  console.log(`\nPre-rendered ${rendered}/${PRERENDER_PATHS.length} routes`);

  if (problems.length) {
    console.error('\nBuild failed:\n' + problems.map((p) => `  - ${p}`).join('\n') + '\n');
    process.exit(1);
  }

  /* sitemap.xml and robots.txt are generated from the same route list, so a new
     page cannot be shipped missing from the sitemap. noindex routes are excluded
     by asking the renderer, not by keeping a second list of exclusions. */
  const indexable = [];
  for (const route of PRERENDER_PATHS) {
    const { head } = render(route);
    if (!head.noindex) indexable.push(route);
  }
  const priority = (r) => (r === '/' ? '1.0' : r === '/quote' ? '0.9' : r === '/services' ? '0.8' : '0.7');
  const urls = indexable
    .map(
      (r) =>
        `  <url><loc>${SITE_ORIGIN}${r === '/' ? '/' : r}</loc>` +
        `<changefreq>monthly</changefreq><priority>${priority(r)}</priority></url>`,
    )
    .join('\n');
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf-8',
  );
  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /thank-you\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
    'utf-8',
  );
  console.log(`  ok  sitemap.xml (${indexable.length} indexable) + robots.txt`);
  console.log('');
}

prerender();
