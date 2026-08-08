/**
 * SSR entry point, used at build time to pre-render each route to static HTML.
 * StaticRouter (no browser APIs) and eager imports (no lazy/Suspense).
 *
 * The route table is imported, not restated. See src/routes.tsx for why that
 * matters. PRERENDER_PATHS is re-exported so scripts/prerender.mjs can read the
 * list straight out of this bundle rather than keeping its own copy.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES } from './routes';
import { startCapture, endCapture, type HeadData } from './lib/headStore';

export { PRERENDER_PATHS } from './routes';

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Navbar />
      <main id="main" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function render(url: string): { html: string; head: HeadData } {
  const head = startCapture();
  try {
    const html = renderToString(
      <StaticRouter location={url}>
        <Routes>
          <Route element={<Layout />}>
            {ROUTES.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </StaticRouter>,
    );
    return { html, head };
  } finally {
    endCapture();
  }
}
