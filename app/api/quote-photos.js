/**
 * POST /api/quote-photos  -  emails the photos attached to a quote request.
 *
 * The lead itself never comes through here. It goes straight from the browser
 * to the GoHighLevel webhook, and is already captured by the time this endpoint
 * is called. Photos are the difference between a phone estimate and an accurate
 * quote, but they are not worth risking the lead for, so they travel separately
 * and a failure here is not a failure of the enquiry.
 *
 * `submission_id` is the join key: it is generated once per submit attempt and
 * sent to the CRM with the lead, so a photo email can always be matched back to
 * its contact record.
 *
 * The client downscales each image to ~1600px JPEG before encoding, which keeps
 * a realistic 8-photo submission inside the serverless body limit.
 *
 * Required environment variable:
 *   RESEND_API_KEY   an API key from resend.com
 * Optional:
 *   QUOTE_TO         recipient, defaults to info@overspray.com.au
 *   QUOTE_FROM       verified sender
 */

const TO = process.env.QUOTE_TO || 'info@overspray.com.au';
const FROM = process.env.QUOTE_FROM || 'quotes@oversprayremovalists.com.au';
const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

  const { submission_id: submissionId, name, email, phone } = body;
  if (!submissionId) return res.status(400).json({ error: 'Missing submission_id' });

  const incoming = Array.isArray(body.photos) ? body.photos.filter(Boolean) : [];
  if (!incoming.length) return res.status(400).json({ error: 'No photos' });

  const attachments = [];
  for (const p of incoming.slice(0, MAX_PHOTOS)) {
    if (!p || typeof p.data !== 'string') continue;
    if (Buffer.byteLength(p.data, 'base64') > MAX_PHOTO_BYTES) continue;
    attachments.push({ filename: String(p.name || 'photo.jpg').slice(0, 80), content: p.data });
  }
  if (!attachments.length) return res.status(400).json({ error: 'No usable photos' });

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set; photos could not be emailed', { submissionId });
    return res.status(500).json({ error: 'Mail is not configured' });
  }

  const html =
    `<h2 style="font-family:sans-serif;margin:0 0 14px">Photos for quote request</h2>` +
    `<p style="font-family:sans-serif;font-size:15px;margin:0 0 6px">` +
    `<strong>${esc(name)}</strong><br>${esc(phone)}<br>${esc(email)}</p>` +
    `<p style="font-family:sans-serif;font-size:13px;color:#666;margin-top:18px">` +
    `${attachments.length} photo(s) attached. Submission ID <code>${esc(submissionId)}</code> ` +
    `matches the contact record in the CRM.</p>`;

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
        reply_to: email ? String(email) : undefined,
        subject: `Quote photos: ${String(name || 'Website enquiry').slice(0, 60)}`,
        html,
        attachments,
      }),
    });
    if (!r.ok) {
      console.error('Resend rejected the photo email', r.status, await r.text());
      return res.status(502).json({ error: 'Could not send' });
    }
    return res.status(200).json({ ok: true, count: attachments.length });
  } catch (err) {
    console.error('Photo send failed', err);
    return res.status(502).json({ error: 'Could not send' });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };
