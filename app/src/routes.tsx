/**
 * THE route table. Single source of truth.
 *
 * The template this is based on kept three hand-maintained lists (App.tsx,
 * entry-server.tsx, prerender.mjs). When they drifted, a route the pre-renderer
 * knew about but the server router didn't fell through to the "*" wildcard and
 * its static HTML was written as the 404 page — noindex, wrong canonical, none
 * of the real content — while the build still printed a tick for it. That bit
 * three live pages on the original build.
 *
 * Here the array below is consumed by all three:
 *   - App.tsx        maps it to client <Route>s
 *   - entry-server   maps it to server <Route>s and re-exports PRERENDER_PATHS
 *   - prerender.mjs  imports PRERENDER_PATHS out of the built SSR bundle
 *
 * There is no second list to keep in sync, so the failure mode cannot recur.
 *
 * Imports are eager, not lazy: the SSR pass renders without Suspense, and for a
 * site this size the extra client bundle is a better trade than a second
 * loading path that only exists in one of the two renderers.
 */
import type { ReactElement } from 'react';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServicePage from './pages/ServicePage';
import GalleryPage from './pages/GalleryPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import QuotePage from './pages/QuotePage';
import ContactPage from './pages/ContactPage';
import ThankYouPage from './pages/ThankYouPage';
import PrivacyPage from './pages/PrivacyPage';
import { SERVICES } from './data/services';

export interface RouteDef {
  path: string;
  element: ReactElement;
  /** Written to static HTML at build time. Only the wildcard opts out. */
  prerender?: boolean;
}

export const ROUTES: RouteDef[] = [
  { path: '/', element: <HomePage /> },
  { path: '/services', element: <ServicesPage /> },

  // One component, one data file, six URLs.
  ...SERVICES.map((s) => ({
    path: s.path,
    element: <ServicePage slug={s.slug} />,
  })),

  { path: '/gallery', element: <GalleryPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/quote', element: <QuotePage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/thank-you', element: <ThankYouPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
];

/** Routes the build writes to disk. */
export const PRERENDER_PATHS: string[] = ROUTES.filter((r) => r.prerender !== false).map(
  (r) => r.path,
);
