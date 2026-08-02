/**
 * POST /api/quote  -  quote request handler (Vercel serverless, Node runtime).
 *
 * This is the endpoint that replaces the old site's broken CAPTCHA form. It
 * takes a JSON body (the client downscales photos to ~1600px JPEG and sends
 * them base64 encoded, so there is no multipart parsing and no dependencies)
 * and emails it to the business with the photos attached.
 *
 * Required environment variable:
 *   RESEND_API_KEY   an API key from resend.com
 *
 * Optional:
 *   QUOTE_TO         recipient, defaults to info@overspray.com.au
 *   QUOTE_FROM       verified sender, defaults to quotes@oversprayremovalists.com.au
 *
 * Swapping Resend for another provider means changing one fetch call below.
 */

const TO = process.env.QUOTE_TO || 'info@overspray.com.au';
const FROM = process.env.QUOTE_FROM || 'quotes@oversprayremovalists.com.au';
const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Bad JSON' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Bad request' });

  const { name, phone, email, message } = body;
  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  // honeypot-free spam guard: a real enquiry describes a vehicle, bots post links
  if ((String(message).match(/https?:\/\//g) || []).length > 2) {
    return res.status(400).json({ error: 'Rejected' });
  }

  const photos = Array.isArray(body.photos) ? body.photos.filter(Boolean).slice(0, MAX_PHOTOS) : [];
  const attachments = [];
  for (const p of photos) {
    if (!p || typeof p.data !== 'string') continue;
    if (Buffer.byteLength(p.data, 'base64') > MAX_PHOTO_BYTES) continue;
    attachments.push({ filename: String(p.name || 'photo.jpg').slice(0, 80), content: p.data });
  }

  const rows = [
    ['Name', name], ['Phone', phone], ['Email', email],
    ['Service', body.service || 'Not specified'],
    ['Location', body.location || 'Not given'],
    ['Vehicles affected', body.vehicles || '1'],
    ['Vehicle', body.vehicle || 'Not given'],
  ].map(([k, v]) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#666;white-space:nowrap">${esc(k)}</td>` +
    `<td style="padding:6px 0"><strong>${esc(v)}</strong></td></tr>`).join('');

  const html =
    `<h2 style="font-family:sans-serif;margin:0 0 16px">New quote request</h2>` +
    `<table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">${rows}</table>` +
    `<h3 style="font-family:sans-serif;margin:22px 0 6px">Details</h3>` +
    `<p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap;margin:0">${esc(message)}</p>` +
    `<p style="font-family:sans-serif;font-size:13px;color:#666;margin-top:22px">` +
    `${attachments.length} photo(s) attached. Sent from the website quote form.</p>`;

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set; quote request could not be emailed', { name, email, phone });
    return res.status(500).json({ error: 'Mail is not configured' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Overspray Website <${FROM}>`,
        to: [TO],
        reply_to: String(email),
        subject: `Quote request: ${String(name).slice(0, 60)}${body.location ? ' (' + String(body.location).slice(0, 40) + ')' : ''}`,
        html,
        attachments,
      }),
    });
    if (!r.ok) {
      console.error('Resend rejected the message', r.status, await r.text());
      return res.status(502).json({ error: 'Could not send' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Quote send failed', err);
    return res.status(502).json({ error: 'Could not send' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };
