import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES } from './routes';
import {
  trackPageView,
  trackKeyPageVisit,
  initScrollDepthTracking,
  initTimeOnPageTracking,
} from './lib/gtm';

function RouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    trackPageView(pathname);
    trackKeyPageVisit(pathname);
    const cleanupScroll = initScrollDepthTracking();
    const cleanupTimer = initTimeOnPageTracking(pathname);
    return () => {
      cleanupScroll();
      cleanupTimer();
    };
  }, [pathname]);
  return null;
}

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

export default function App() {
  return (
    <BrowserRouter>
      <RouteChange />
      <Routes>
        <Route element={<Layout />}>
          {ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
