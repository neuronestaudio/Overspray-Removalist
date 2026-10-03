/**
 * Every business-specific value the app needs, in one place.
 *
 * This is the file to edit when standing the template up for a new client.
 * Nothing below is referenced from more than one conceptual place, so changing
 * a phone number here changes it in the nav, the footer, the schema, the
 * tel: tracking and the form's failure message at once.
 */

export const SITE_ORIGIN = 'https://overspray.com.au';

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
 * Where the quote form posts every lead: this site's own function, api/lead.js.
 *
 * The form used to post straight from the browser to a GoHighLevel inbound
 * webhook. That webhook answers 200 whether or not its workflow is published,
 * so while the workflow sat in draft every lead was accepted and thrown away.
 * The function writes the contact with the GoHighLevel API instead and sends
 * the alert email and SMS itself, so a lead is kept whatever the workflow is
 * doing.
 *
 * Nothing about the CRM reaches the browser any more. The token, the
 * sub-account id and the webhook URL are Vercel environment variables read by
 * the function; they are listed at the top of api/lead.js.
 */
export const LEAD_ENDPOINT = '/api/lead';

/** Paths worth their own dataLayer event because they signal buying intent. */
export const KEY_SERVICE_PATHS = [
  '/overspray-removal',
  '/fleet-and-construction',
  '/insurance-claims',
];

/** How long a lead POST may run before we give the visitor the retry message. */
export const REQUEST_TIMEOUT_MS = 15000;
