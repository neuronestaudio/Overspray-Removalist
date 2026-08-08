/**
 * Serve dist/ the way Vercel does, so what you check locally is what ships.
 *
 * `vite preview` is not equivalent: it serves the SPA shell for deep links
 * rather than the pre-rendered file for that route, so every page looks
 * client-rendered and the thing the pre-render exists to prove is invisible.
 * It also binds IPv6-only on some Windows setups, so http://127.0.0.1 refuses
 * the connection while http://localhost works, which reads as a broken build.
 *
 * This mirrors the production contract instead:
 *   cleanUrls      /pricing        -> dist/pricing/index.html
 *   trailingSlash  /pricing/       -> 308 to /pricing
 *   404            unmatched paths -> dist/404.html with a real 404 status
 *
 * Usage: npm run serve  [-- --port 4173]
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

const portArg = process.argv.indexOf('--port');
const PORT = portArg > -1 ? Number(process.argv[portArg + 1]) : 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, type, extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': body.length, ...extra });
  res.end(body);
}

function tryFile(p) {
  try {
    if (fs.statSync(p).isFile()) return p;
  } catch {
    /* not there */
  }
  return null;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  /* Stay in URL space (forward slashes) for all routing decisions. Running the
     path through path.normalize first turns it into backslashes on Windows, at
     which point endsWith('/') and startsWith('/assets/') are both quietly
     false and the rules below stop applying. */
  const safe = ('/' + decodeURIComponent(url.pathname).replace(/^\/+/, ''))
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/');

  // Reject traversal rather than trying to sanitise it.
  if (safe.split('/').includes('..')) {
    return send(res, 400, Buffer.from('Bad request'), TYPES['.txt']);
  }

  // trailingSlash: false
  if (safe.length > 1 && safe.endsWith('/')) {
    res.writeHead(308, { Location: safe.slice(0, -1) + url.search });
    return res.end();
  }

  const rel = safe.slice(1).split('/');
  const candidates =
    safe === '/'
      ? [path.join(DIST, 'index.html')]
      : [
          path.join(DIST, ...rel), // a real asset
          path.join(DIST, ...rel.slice(0, -1), `${rel[rel.length - 1]}.html`), // cleanUrls
          path.join(DIST, ...rel, 'index.html'), // directory index
        ];

  for (const c of candidates) {
    const hit = tryFile(c);
    if (!hit) continue;
    const body = fs.readFileSync(hit);
    const type = TYPES[path.extname(hit).toLowerCase()] || 'application/octet-stream';
    const immutable = safe.startsWith('/assets/');
    return send(res, 200, body, type, {
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
  }

  const notFound = tryFile(path.join(DIST, '404.html'));
  if (notFound) return send(res, 404, fs.readFileSync(notFound), TYPES['.html']);
  return send(res, 404, Buffer.from('Not found'), TYPES['.txt']);
});

if (!fs.existsSync(DIST)) {
  console.error('dist/ does not exist. Run `npm run build` first.');
  process.exit(1);
}

// Bind 127.0.0.1 explicitly: the default can resolve IPv6-only on Windows.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  dist/ served like production:  http://127.0.0.1:${PORT}\n`);
});
