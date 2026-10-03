/**
 * POST /api/lead  -  the quote form's lead, written to GoHighLevel and announced.
 *
 * The form used to post straight from the browser to a GoHighLevel inbound
 * webhook. That trigger answers 200 even when its workflow is unpublished, so
 * every lead was accepted and thrown away: the sub-account ("Renny - B -
 * Overspray") held 0 contacts on 3 Oct 2026 while the visitor saw a thank-you.
 * This writes the contact with the API instead, so the lead is saved whatever
 * the workflow is doing, and still pokes the webhook afterwards so the
 * workflow's own steps fire once it is published.
 * Same pattern as api/lead.js in the CDS and Formula repos.
 *
 * Environment variables (Vercel project overspray-removalist):
 *   GHL_TOKEN              private integration token (pit-...)
 *   GHL_LOCATION_ID        sub-account id
 *   VITE_GHL_WEBHOOK       the inbound webhook, already set from when the browser
 *                          posted to it. GHL_WEBHOOK overrides it. Optional.
 *   GHL_ALERT_CONTACT_ID   optional override for the lead-alert contact below
 *
 * EMAIL ALERT: sent from here through GoHighLevel's conversations API, because
 * workflow steps cannot be edited over the API. That API only mails an address
 * that belongs to a contact, hence the internal contact "Website Lead Alerts
 * (internal)" whose email is info@overspray.com.au (DND on SMS and calls, email
 * left open). The alerts thread under that contact in GoHighLevel's inbox. To
 * add a recipient, add the address to that contact's additional emails AND to
 * ALERT_EMAILS below. Don't delete that contact.
 *
 * SMS ALERT: same route, one internal contact per mobile (ALERT_SMS_CONTACTS).
 * GoHighLevel sends it from the sub-account's own phone number, so nothing goes
 * out until the sub-account has one. Don't test with a lead that uses an alert
 * mobile: the upsert would merge the test lead into that alert contact.
 *
 * GOTCHA: custom fields only save when addressed by BARE key ("vehicle") or by
 * field id. The "contact.vehicle" form the API hands back in customFields
 * listings is accepted, returns 200, and silently stores nothing.
 */

const GHL = 'https://services.leadconnectorhq.com';

/* Payload name -> the sub-account's field key, minus the "contact." prefix.
   "gclid" cannot be a custom field (GoHighLevel reserves it as a native key and
   drops the value), so it lands in the field named "Google Click ID". */
const FIELD_MAP = {
  contaminant: 'contaminant',
  contaminant_label: 'contaminant_label',
  location: 'location',
  postcode: 'postcode',
  vehicle: 'vehicle',
  vehicles: 'vehicles',
  when_happened: 'when_happened',
  when_happened_label: 'when_happened_label',
  handled_by: 'handled_by',
  handled_by_label: 'handled_by_label',
  notes: 'notes',
  photo_count: 'photo_count',
  page: 'page',
  submission_id: 'submission_id',
  first_landing_page: 'first_landing_page',
  utm_source: 'utm_source',
  utm_medium: 'utm_medium',
  utm_campaign: 'utm_campaign',
  utm_term: 'utm_term',
  utm_content: 'utm_content',
  gclid: 'google_click_id',
  gbraid: 'gbraid',
  wbraid: 'wbraid',
  fbclid: 'fbclid',
  msclkid: 'msclkid',
};

const ALERT_CONTACT_ID = process.env.GHL_ALERT_CONTACT_ID || 'dKIaYT0jgi1W5Scn8AmH';
/* Each address must be the alert contact's primary or an additional email. */
const ALERT_EMAILS = ['info@overspray.com.au', 'dion@pndulumdigital.com'];
/* Internal contacts that get the SMS alert: "Lead Alert SMS - Dion (internal)". */
const ALERT_SMS_CONTACTS = ['rL1shP5Ah2pjKZ1x9Bwx'];

const str = (v) => (v === undefined || v === null ? '' : String(v)).trim();

const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* Laid out for a phone's mail app: the facts needed to call the lead back. */
function alertEmail(body, { name, phone, email, contactId, locationId }) {
  const vehicleCount = Number(str(body.vehicles)) > 1 ? ` (${str(body.vehicles)} vehicles)` : '';
  const rows = [
    ['Name', name],
    ['Phone', phone && `<a href="tel:${esc(phone)}">${esc(phone)}</a>`, true],
    ['Email', email && `<a href="mailto:${esc(email)}">${esc(email)}</a>`, true],
    ['Problem', str(body.contaminant_label) || str(body.contaminant)],
    ['Vehicle', str(body.vehicle) && str(body.vehicle) + vehicleCount],
    ['Suburb', [str(body.location), str(body.postcode)].filter(Boolean).join(' ')],
    ['Happened', str(body.when_happened_label) || str(body.when_happened)],
    ['Handled by', str(body.handled_by_label) || str(body.handled_by)],
    ['Photos', Number(str(body.photo_count)) > 0 ? `${str(body.photo_count)} attached` : ''],
    ['Notes', str(body.notes)],
    ['Source', [str(body.source), str(body.utm_source)].filter(Boolean).join(' / ')],
    ['Page', str(body.page)],
  ].filter(([, v]) => v);

  const table = rows
    .map(
      ([k, v, raw]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${k}</td>` +
        `<td style="padding:6px 0;color:#111">${raw ? v : esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('');

  const link = contactId
    ? `<p style="margin:20px 0 0"><a href="https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}" ` +
      `style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open in GHL</a></p>`
    : '';

  const problem = str(body.contaminant_label) || str(body.contaminant);
  return {
    subject: `New website lead: ${name || phone || email}${problem ? ` - ${problem}` : ''}`,
    html:
      `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.4">` +
      `<p style="margin:0 0 12px"><strong>New quote request from the Overspray Removalist website</strong></p>` +
      `<table style="border-collapse:collapse">${table}</table>${link}</div>`,
  };
}

/* One text, plain ASCII so it stays a short GSM message: who, how to reach
   them, what they want. */
function alertSms(body, { name, phone, email }) {
  const bits = [
    `New Overspray lead: ${name || 'no name'}`,
    phone || email,
    [str(body.contaminant_label) || str(body.contaminant), str(body.vehicle)].filter(Boolean).join(', '),
    [str(body.location), str(body.postcode)].filter(Boolean).join(' '),
  ].filter(Boolean);
  return bits
    .join(' | ')
    .replace(/[^ -~]/g, '')
    .slice(0, 300);
}

/* The form asks for one name. GoHighLevel wants it in two. */
function splitName(full) {
  if (!full) return { firstName: '', lastName: '' };
  const bits = full.split(/\s+/);
  return bits.length === 1
    ? { firstName: bits[0], lastName: '' }
    : { firstName: bits.slice(0, -1).join(' '), lastName: bits[bits.length - 1] };
}

async function postJson(url, headers, payload, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const text = await r.text();
    return { ok: r.ok, status: r.status, text };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Bad JSON' });
    }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Bad request' });

  const email = str(body.email);
  const phone = str(body.phone);
  if (!email && !phone) return res.status(400).json({ error: 'Need an email or a phone number' });

  const token = process.env.GHL_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const webhook = process.env.GHL_WEBHOOK || process.env.VITE_GHL_WEBHOOK;
  const auth = { Authorization: `Bearer ${token}`, Version: '2021-07-28', Accept: 'application/json' };
  const name = str(body.name);

  let saved = false;
  let contactId = null;

  if (token && locationId) {
    const customFields = Object.keys(FIELD_MAP)
      .filter((k) => str(body[k]))
      .map((k) => ({ key: FIELD_MAP[k], field_value: str(body[k]).slice(0, 2000) }));

    /* No tags here: upsert REPLACES the tag list, which would strip whatever a
       returning customer has been tagged with. The tag is added below. */
    const payload = {
      locationId,
      ...splitName(name),
      source: str(body.source) || 'website',
      customFields,
    };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    if (str(body.location)) payload.city = str(body.location);
    if (str(body.postcode)) payload.postalCode = str(body.postcode);

    try {
      const r = await postJson(`${GHL}/contacts/upsert`, auth, payload);
      if (r.ok) {
        saved = true;
        try {
          contactId = JSON.parse(r.text).contact.id;
        } catch {
          /* id is a nicety */
        }
      } else {
        console.error('GHL upsert failed', r.status, r.text.slice(0, 500));
      }
    } catch (err) {
      console.error('GHL upsert threw', err && err.message);
    }
  } else {
    console.error('GHL_TOKEN or GHL_LOCATION_ID missing - lead not written to the CRM');
  }

  /* The rest runs side by side; none of it may fail the request. */
  const emailed = [];
  let texted = 0;
  let hooked = false;
  const jobs = [];

  if (contactId) {
    jobs.push(
      postJson(`${GHL}/contacts/${contactId}/tags`, auth, { tags: ['website lead'] }, 6000)
        .then((t) => {
          if (!t.ok) console.error('GHL tag failed', t.status, t.text.slice(0, 300));
        })
        .catch((err) => console.error('GHL tag threw', err && err.message)),
    );
  }

  /* Fire the workflow too. Harmless while it is a draft; once it is published
     this is what runs the workflow's own steps. */
  if (webhook && webhook !== 'REPLACE_ME') {
    jobs.push(
      postJson(webhook, {}, { ...body, full_name: name, lead_source: str(body.source) }, 5000)
        .then((w) => {
          if (w.ok) hooked = true;
          else console.error('GHL webhook failed', w.status, w.text.slice(0, 300));
        })
        .catch((err) => console.error('GHL webhook threw', err && err.message)),
    );
  }

  /* Email the alert list, one message each so one bad address can't sink the rest. */
  if (token && locationId && ALERT_CONTACT_ID) {
    const msg = alertEmail(body, { name, phone, email, contactId, locationId });
    ALERT_EMAILS.forEach((to) => {
      jobs.push(
        postJson(
          `${GHL}/conversations/messages`,
          auth,
          {
            type: 'Email',
            contactId: ALERT_CONTACT_ID,
            emailTo: to,
            emailFrom: 'Overspray Website <info@overspray.com.au>',
            ...msg,
          },
          6000,
        )
          .then((a) => {
            if (a.ok) emailed.push(to);
            else console.error('GHL alert email failed', to, a.status, a.text.slice(0, 300));
          })
          .catch((err) => console.error('GHL alert email threw', to, err && err.message)),
      );
    });
  }

  /* Text the alert mobiles. GoHighLevel answers 201 and fails the message
     afterwards if the sub-account has no number, so "texted" means accepted,
     not delivered. */
  if (token && locationId) {
    const message = alertSms(body, { name, phone, email });
    ALERT_SMS_CONTACTS.forEach((id) => {
      jobs.push(
        postJson(`${GHL}/conversations/messages`, auth, { type: 'SMS', contactId: id, message }, 6000)
          .then((a) => {
            if (a.ok) texted += 1;
            else console.error('GHL alert sms failed', id, a.status, a.text.slice(0, 300));
          })
          .catch((err) => console.error('GHL alert sms threw', id, err && err.message)),
      );
    });
  }

  await Promise.all(jobs);

  /* Always log the lead so it exists in the deployment logs even if GoHighLevel
     is down. */
  console.log(
    'LEAD',
    JSON.stringify({
      saved,
      hooked,
      emailed,
      texted,
      contactId,
      email,
      phone,
      name,
      contaminant: str(body.contaminant),
      location: str(body.location),
      vehicle: str(body.vehicle),
    }),
  );

  /* The form only reports a conversion (and sends the visitor to /thank-you) on
     a 2xx, so a lead nobody will ever see must not look like a success: the
     form then keeps what was typed and offers the phone number instead. */
  if (!saved && !emailed.length) return res.status(502).json({ ok: false, error: 'Lead not delivered' });

  return res.status(200).json({ ok: true, saved, id: contactId });
}
