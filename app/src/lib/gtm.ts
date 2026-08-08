/**
 * Google Tag Manager dataLayer helpers.
 *
 * Conversion events (`quote_form_submit`, `generate_lead`) are pushed from the
 * form and only after the CRM has acknowledged the lead. An uncaptured lead is
 * not a conversion, and reporting it as one poisons every downstream decision
 * about ad spend.
 */
import { KEY_SERVICE_PATHS } from './site';

type GtmEventPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    __osrPhoneTrackingBound?: boolean;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire a Google Ads conversion directly via gtag, when one is configured. */
export function fireGadsConversion(sendTo: string) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: sendTo });
  }
}

export function pushGtmEvent(event: string, payload: GtmEventPayload = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

/**
 * One delegated listener for every tel: link on the site, bound once.
 *
 * Delegation rather than per-link handlers: links are added and removed by
 * route changes, and a phone number in a footer rendered after boot would
 * otherwise go untracked.
 */
export function initPhoneCtaTracking() {
  if (typeof window === 'undefined') return;
  if (window.__osrPhoneTrackingBound) return;

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const anchor = target?.closest('a[href^="tel:"]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const telHref = anchor.getAttribute('href') || '';
    const phoneNumber = telHref.replace('tel:', '').trim();
    const ctaText =
      (anchor.textContent || '').trim() || anchor.getAttribute('aria-label') || 'phone_cta';

    pushGtmEvent('phone_call_cta_click', {
      phone_number: phoneNumber,
      cta_text: ctaText,
      cta_href: telHref,
      page_path: window.location.pathname,
      page_title: document.title,
    });
    // GA4 recommended event
    pushGtmEvent('contact', { method: 'phone' });
  });

  window.__osrPhoneTrackingBound = true;
}

export function trackPageView(pathname: string) {
  pushGtmEvent('page_view', { page_path: pathname });
}

export function trackKeyPageVisit(pathname: string) {
  if (KEY_SERVICE_PATHS.includes(pathname)) {
    pushGtmEvent('key_service_page_view', { page_path: pathname });
  }
}

export function initScrollDepthTracking(): () => void {
  const thresholds = [25, 50, 75, 90];
  const fired = new Set<number>();

  function onScroll() {
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    if (total <= 0) return;
    const pct = Math.round((scrolled / total) * 100);
    for (const t of thresholds) {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        pushGtmEvent('scroll_depth', {
          scroll_depth_threshold: t,
          page_path: window.location.pathname,
        });
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}

export function initTimeOnPageTracking(pathname: string): () => void {
  const timer = setTimeout(() => {
    pushGtmEvent('high_intent_time_on_page', { page_path: pathname });
  }, 60000);
  return () => clearTimeout(timer);
}
