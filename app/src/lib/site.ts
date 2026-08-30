/**
 * Every business-specific value the app needs, in one place.
 *
 * This is the file to edit when standing the template up for a new client.
 * Nothing below is referenced from more than one conceptual place, so changing
 * a phone number here changes it in the nav, the footer, the schema, the
 * tel: tracking and the form's failure message at once.
 */

export const SITE_ORIGIN = 'https://oversprayremovalists.com.au';

export const BUSINESS = {
  name: 'The Overspray Removalist',
  legalName: 'The Overspray Removalist',
  /** Used in <title> suffixes and the sitewide schema. */
  shortName: 'Overspray Removalist',
  email: 'info@overspray.com.au',
  /** Primary number: the one in the nav, the sticky CTA and failure messages. */
  phone: '0412 107 464',
  phoneHref: 'tel:0412107464',
  phoneE164: '+61412107464',
  phoneContact: 'Renny',
  /** Both principals are founders who still do the work themselves. */
  phoneContactRole: 'Founder & auto detailing specialist',
  /** Secondary number, footer and contact page only. */
  phoneAlt: '0410 939 700',
  phoneAltHref: 'tel:0410939700',
  phoneAltContact: 'Adrianus',
  phoneAltContactRole: 'Founder & auto detailing specialist',
  address: {
    locality: 'Epping',
    region: 'VIC',
    postcode: '3076',
    country: 'AU',
  },
  hours: 'Mon to Fri, 8:00am to 5:00pm',
  areaServed: 'Australia',
} as const;

/**
 * Google Tag Manager container.
 *
 * REPLACE before launch. The GTM snippet in index.html carries this same ID and
 * must be changed with it — it is inlined there rather than injected so the
 * container loads before React boots.
 */
export const GTM_ID: string = import.meta.env.VITE_GTM_ID || 'GTM-XXXXXXX';

/**
 * GoHighLevel inbound webhook that receives every lead.
 *
 * Read from the environment, NOT written here. This repository is public, and a
 * GoHighLevel inbound webhook has no authentication on it — anyone holding the
 * URL can POST arbitrary JSON and create contacts in the CRM. Committed to
 * source it would be greppable by the bots that scan GitHub for exactly this
 * pattern.
 *
 * It is still visible to anyone who opens DevTools on the live site, because the
 * form posts to it straight from the browser. That is inherent to a static site
 * with no server of its own, and it is the reason the form carries a honeypot
 * rather than relying on the URL being secret.
 *
 * Set it in two places:
 *   local   app/.env.local          VITE_GHL_WEBHOOK=https://...
 *   hosting Vercel project settings  VITE_GHL_WEBHOOK
 *
 * Annotated `: string` deliberately. Without it TypeScript narrows this to the
 * literal fallback and the guard comparing it to 'REPLACE_ME' becomes a
 * no-overlap type error the moment a real URL is supplied.
 */
export const GHL_WEBHOOK: string = import.meta.env.VITE_GHL_WEBHOOK || 'REPLACE_ME';

/** Paths worth their own dataLayer event because they signal buying intent. */
export const KEY_SERVICE_PATHS = [
  '/overspray-removal',
  '/fleet-and-construction',
  '/insurance-claims',
];

/** How long a lead POST may run before we give the visitor the retry message. */
export const REQUEST_TIMEOUT_MS = 15000;
